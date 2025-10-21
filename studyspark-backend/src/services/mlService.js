// Rabie: New service to call the StudyGroupAi Flask API (predict, predict_batch, health)
import axios from 'axios';

const ML_BASE = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

/**
 * Call single prediction endpoint on the Flask AI service
 * @param {Object} payload
 */
export async function predict(payload) {
  try {
    const resp = await axios.post(`${ML_BASE}/predict`, payload, { timeout: 10_000 });
    return resp.data;
  } catch (err) {
    console.error('❌ mlService.predict error:', err.message || err);
    throw err;
  }
}

/**
 * Call batch prediction endpoint on the Flask AI service
 * @param {Object} payload
 */
export async function predictBatch(payload) {
  try {
    const resp = await axios.post(`${ML_BASE}/predict_batch`, payload, { timeout: 20_000 });
    return resp.data;
  } catch (err) {
    console.error('❌ mlService.predictBatch error:', err.message || err);
    throw err;
  }
}

/**
 * Healthcheck for the Flask AI service
 */
export async function health() {
  try {
    const resp = await axios.get(`${ML_BASE}/health`, { timeout: 3000 });
    return resp.data;
  } catch (err) {
    console.error('❌ mlService.health error:', err.message || err);
    return { healthy: false, error: err.message };
  }
}

export default { predict, predictBatch, health };
