from flask import Flask, request, jsonify, send_file, abort
import joblib
import os
import numpy as np
import pandas as pd

# Rabie: Prefer exported_models (where artifacts currently live), fallback to model_outputs
HERE = os.path.dirname(os.path.abspath(__file__))
CANDIDATE_DIRS = [
    os.path.join(HERE, 'exported_models'),
    os.path.join(HERE, 'model_outputs'),
]

def resolve_artifact(filename: str):
    for d in CANDIDATE_DIRS:
        p = os.path.join(d, filename)
        if os.path.exists(p):
            return p
    # Return default under exported_models even if missing (health will show not loaded)
    return os.path.join(CANDIDATE_DIRS[0], filename)

MODEL_BASENAME = 'final_clusters_GMM_k2_reg1e-1.pkl'
SCALER_BASENAME = 'scaler.pkl'
MODEL_PATH = resolve_artifact(MODEL_BASENAME)
SCALER_PATH = resolve_artifact(SCALER_BASENAME)

app = Flask(__name__)

# Load model and scaler at startup (lazy load)
model = None
scaler = None


def load_artifacts():
    global model, scaler
    if model is None:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
        else:
            # Rabie: Dev-mode — allow running without model by warning only
            app.logger.warning(f"Model not found at {MODEL_PATH}")
    if scaler is None:
        if os.path.exists(SCALER_PATH):
            scaler = joblib.load(SCALER_PATH)
        else:
            # Rabie: Dev-mode — allow running without scaler by warning only
            app.logger.warning(f"Scaler not found at {SCALER_PATH}")


def to_feature_df(X, ref_estimator=None):
    """
    Rabie: Build a pandas DataFrame for sklearn transformers/estimators
    that were fitted with feature names to avoid warnings like:
    "X does not have valid feature names, but StandardScaler was fitted with feature names"
    """
    try:
        cols = getattr(ref_estimator, 'feature_names_in_', None)
        if cols is not None:
            return pd.DataFrame(X, columns=list(cols))
        # Fallback to plain DataFrame (no named columns)
        return pd.DataFrame(X)
    except Exception:
        # Last-resort fallback to the original numpy input
        return X

def clamp_and_normalize_probs(probs, eps: float = 0.01):
    """Clamp probabilities away from 0 and 1, then renormalize per row."""
    try:
        arr = np.array(probs, dtype=float)
        if arr.ndim == 1:
            arr = arr.reshape(1, -1)
        arr = np.clip(arr, eps, 1.0 - eps)
        s = arr.sum(axis=1, keepdims=True)
        s[s == 0] = 1.0
        arr = arr / s
        return arr.tolist()
    except Exception:
        return probs

@app.route('/health', methods=['GET'])
def health():
    load_artifacts()
    status = {
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None,
        # Rabie: Expose a simple flag to indicate heuristic mode (no artifacts)
        'dev_mode': (model is None)
    }
    return jsonify(status)


@app.route('/download/<name>', methods=['GET'])
def download(name):
    # Allow 'model' or 'scaler' to be downloaded
    if name == 'model':
        path = resolve_artifact(MODEL_BASENAME)
    elif name == 'scaler':
        path = resolve_artifact(SCALER_BASENAME)
    else:
        abort(404, "Unknown artifact")
    if not os.path.exists(path):
        abort(404, "File not found")
    return send_file(path, as_attachment=True)


@app.route('/predict', methods=['POST'])
def predict():
    """Expect JSON body with either:
    - {'features': [w_academics, w_availability, w_interests]} OR
    - {'w_academics': ..., 'w_availability': ..., 'w_interests': ...}
    Returns predicted cluster and probabilities (if available).
    """
    load_artifacts()

    payload = request.get_json(force=True)
    if payload is None:
        return jsonify({'error': 'Invalid JSON'}), 400

    # Extract features
    if 'features' in payload:
        arr = np.array(payload['features'], dtype=float)
        if arr.shape[0] != 3:
            return jsonify({'error': 'features must be length 3'}), 400
        X = arr.reshape(1, -1)
    else:
        try:
            X = np.array([
                float(payload['w_academics']),
                float(payload['w_availability']),
                float(payload['w_interests'])
            ]).reshape(1, -1)
        except Exception:
            return jsonify({'error': 'Missing or invalid feature keys'}), 400

    # Rabie: Dev-mode heuristic if model/scaler missing
    if model is None:
        # Simple heuristic: use mean of features as confidence in [0,1], with smoothing to avoid exact 0/1
        try:
            m = float(np.clip(np.mean(X), 0.0, 1.0))
        except Exception:
            m = 0.5
        eps = 0.02
        p1 = float(np.clip(eps + (1 - 2 * eps) * m, 0.0, 1.0))
        p0 = float(np.clip(1.0 - p1, 0.0, 1.0))
        pred = 1 if p1 >= p0 else 0
        probs = [[round(p0, 4), round(p1, 4)]]
        return jsonify({'prediction': pred, 'probabilities': probs, 'note': 'dev-mode heuristic (no model loaded)'}), 200

    # Apply scaler if present
    if scaler is not None:
        try:
            # Rabie: Use DataFrame with feature names if scaler expects them to silence warnings
            Xin = to_feature_df(X, scaler)
            Xs = scaler.transform(Xin)
        except Exception as e:
            return jsonify({'error': f'scaler transform failed: {e}'}), 500
    else:
        # Rabie: If no scaler, but model expects feature names, pass DataFrame directly to the model later
        Xs = X

    try:
        # Rabie: If no scaler used and model expects feature names, predict with named DataFrame
        model_input = to_feature_df(X, model) if scaler is None else Xs
        pred = model.predict(model_input).tolist()
        probs = None
        if hasattr(model, 'predict_proba'):
            try:
                probs = model.predict_proba(model_input).tolist()
                probs = clamp_and_normalize_probs(probs, eps=0.01)
            except Exception:
                probs = None
        return jsonify({'prediction': pred[0], 'probabilities': probs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """Accepts JSON with key 'rows': list of feature lists or objects. Returns list of predictions."""
    load_artifacts()

    payload = request.get_json(force=True)
    rows = payload.get('rows') if payload else None
    if not rows or not isinstance(rows, list):
        return jsonify({'error': 'Provide rows list'}), 400

    # Normalize rows to 2D array
    X_list = []
    for r in rows:
        if isinstance(r, list) or isinstance(r, tuple):
            if len(r) != 3:
                return jsonify({'error': 'Each row list must have length 3'}), 400
            X_list.append([float(r[0]), float(r[1]), float(r[2])])
        elif isinstance(r, dict):
            try:
                X_list.append([
                    float(r['w_academics']),
                    float(r['w_availability']),
                    float(r['w_interests'])
                ])
            except Exception:
                return jsonify({'error': 'Row dict missing keys'}), 400
        else:
            return jsonify({'error': 'Rows must be list or dicts'}), 400

    X = np.array(X_list)

    # Rabie: Dev-mode heuristic for batch
    if model is None:
        try:
            means = np.clip(np.mean(X, axis=1), 0.0, 1.0)
        except Exception:
            means = np.array([0.5] * len(X_list))
        eps = 0.02
        p1s = eps + (1 - 2 * eps) * means
        p1s = np.clip(p1s, 0.0, 1.0)
        preds = [1 if float(p1) >= (1 - float(p1)) else 0 for p1 in p1s]
        probs = [[round(1 - float(p1), 4), round(float(p1), 4)] for p1 in p1s]
        return jsonify({'predictions': preds, 'probabilities': probs, 'note': 'dev-mode heuristic (no model loaded)'}), 200

    if scaler is not None:
        # Rabie: Use DataFrame with feature names if scaler expects them
        Xs = scaler.transform(to_feature_df(X, scaler))
    else:
        Xs = X

    try:
        # Rabie: If no scaler used and model expects feature names, send DataFrame with names
        model_input = to_feature_df(X, model) if scaler is None else Xs
        preds = model.predict(model_input).tolist()
        probs = None
        if hasattr(model, 'predict_proba'):
            try:
                probs = model.predict_proba(model_input).tolist()
                probs = clamp_and_normalize_probs(probs, eps=0.01)
            except Exception:
                probs = None
        return jsonify({'predictions': preds, 'probabilities': probs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # For local testing only. Use a production WSGI server for deployment.
    # Allow overriding host/port/debug via environment variables.
    load_artifacts()
    host = os.getenv('FLASK_HOST', '127.0.0.1')
    try:
        port = int(os.getenv('FLASK_PORT', '5000'))
    except Exception:
        port = 5000
    debug = os.getenv('FLASK_DEBUG', '0') == '1'
    # Disable Flask's reloader to avoid spawning child processes (causes instability on Windows when backgrounded)
    app.run(host=host, port=port, debug=debug, use_reloader=False)
