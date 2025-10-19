from flask import Flask, request, jsonify, send_file, abort
import joblib
import os
import numpy as np
import pandas as pd

MODEL_PATH = os.path.join('model_outputs', 'final_clusters_GMM_k2_reg1e-1.pkl')
SCALER_PATH = os.path.join('model_outputs', 'scaler.pkl')

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
            app.logger.warning(f"Model not found at {MODEL_PATH}")
    if scaler is None:
        if os.path.exists(SCALER_PATH):
            scaler = joblib.load(SCALER_PATH)
        else:
            app.logger.warning(f"Scaler not found at {SCALER_PATH}")


@app.route('/health', methods=['GET'])
def health():
    load_artifacts()
    status = {
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None,
    }
    return jsonify(status)


@app.route('/download/<name>', methods=['GET'])
def download(name):
    # Allow 'model' or 'scaler' to be downloaded
    if name == 'model':
        path = MODEL_PATH
    elif name == 'scaler':
        path = SCALER_PATH
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
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

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

    # Apply scaler if present
    if scaler is not None:
        try:
            Xs = scaler.transform(X)
        except Exception as e:
            return jsonify({'error': f'scaler transform failed: {e}'}), 500
    else:
        Xs = X

    try:
        pred = model.predict(Xs).tolist()
        probs = None
        if hasattr(model, 'predict_proba'):
            try:
                probs = model.predict_proba(Xs).tolist()
            except Exception:
                probs = None
        return jsonify({'prediction': pred[0], 'probabilities': probs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """Accepts JSON with key 'rows': list of feature lists or objects. Returns list of predictions."""
    load_artifacts()
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

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
    if scaler is not None:
        Xs = scaler.transform(X)
    else:
        Xs = X

    try:
        preds = model.predict(Xs).tolist()
        probs = None
        if hasattr(model, 'predict_proba'):
            try:
                probs = model.predict_proba(Xs).tolist()
            except Exception:
                probs = None
        return jsonify({'predictions': preds, 'probabilities': probs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # For local testing only. Use a production WSGI server for deployment.
    load_artifacts()
    app.run(host='0.0.0.0', port=5000, debug=True)
