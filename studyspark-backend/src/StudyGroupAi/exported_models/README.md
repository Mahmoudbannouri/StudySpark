Exported models
=================

Contents
- final_clusters_GMM_k2_reg1e-1.pkl — trained GaussianMixture model (joblib pickle)
- scaler.pkl — StandardScaler used to transform features before prediction

Quick notes
- These artifacts were exported from the project workspace and are ready to be loaded with joblib.
- Features expected (3-length vector): [w_academics, w_availability, w_interests]
  - Ensure you compute these features the same way as in `data_prep.ipynb` before calling the model.

Python example — load and single prediction
```python
import joblib
import numpy as np

model = joblib.load('final_clusters_GMM_k2_reg1e-1.pkl')
scaler = joblib.load('scaler.pkl')

# Example sample
sample = np.array([[27.5, 55.0, 10.0]])  # replace with your computed features
sample_scaled = scaler.transform(sample)
cluster = model.predict(sample_scaled)
probs = model.predict_proba(sample_scaled) if hasattr(model, 'predict_proba') else None
print('cluster', cluster, 'probs', probs)
```

Python example — batch predictions from CSV
```python
import pandas as pd
import joblib

df = pd.read_csv('some_students.csv')
# df must contain columns w_academics,w_availability,w_interests
model = joblib.load('final_clusters_GMM_k2_reg1e-1.pkl')
scaler = joblib.load('scaler.pkl')
X = df[['w_academics','w_availability','w_interests']].values
X_scaled = scaler.transform(X)
preds = model.predict(X_scaled)

result = df.copy()
result['predicted_cluster'] = preds
result.to_csv('predicted_with_model.csv', index=False)
```

Flask endpoints (if you run the provided `app.py` in the repo root):
- GET /health — returns JSON telling whether model/scaler are loaded
- GET /download/model or /download/scaler — download the artifacts
- POST /predict — single prediction (JSON body)
- POST /predict_batch — batch predictions (JSON body with `rows`)

Contact
- For questions about expected feature computation, see `data_prep.ipynb` in the repo root.
