import Quota from "../models/Quota.js";
import User from "../models/userModel.js";

export const getQuotaByUser = async (req, res) => {
  try {
    const quota = await Quota.findOne({ where: { userId: req.params.id } });
    if (!quota) return res.status(404).json({ message: "Quota not found" });
    res.json(quota);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// 📄 GET /api/quotas/me
export const getMyQuota = async (req, res) => {
    try {
      const quota = await Quota.findOne({ where: { userId: req.user.id } });
      if (!quota) return res.status(404).json({ message: "Quota not found" });
      res.json(quota);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
export const updateQuota = async (req, res) => {
  try {
    const quota = await Quota.findOne({ where: { userId: req.params.id } });
    if (!quota) return res.status(404).json({ message: "Quota not found" });
    await quota.update(req.body);
    res.json(quota);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllQuotas = async (req, res) => {
  const quotas = await Quota.findAll({ include: User });
  res.json(quotas);
};
