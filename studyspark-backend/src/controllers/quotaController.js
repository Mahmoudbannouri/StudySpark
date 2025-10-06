import Quota from "../models/Quota.js";
import User from "../models/userModel.js";
import Subscription from "../models/Subscription.js";
import { Op } from "sequelize";
import sequelize from "../config/db.js";

/**
 * Get quota by user ID
 * GET /api/quotas/:id
 */
export const getQuotaByUser = async (req, res) => {
  try {
    const quota = await Quota.findOne({
      where: { userId: req.params.id },
      include: [{
        model: User,
        attributes: ['id', 'fullname', 'email', 'subscriptionTier']
      }]
    });

    if (!quota) {
      return res.status(404).json({ message: "Quota not found" });
    }

    res.json({
      ...quota.toJSON(),
      totalUsage: quota.getTotalUsage()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get current user's quota
 * GET /api/quotas/me
 */
export const getMyQuota = async (req, res) => {
  try {
    const quota = await Quota.findOne({ where: { userId: req.user.id } });

    if (!quota) {
      return res.status(404).json({ message: "Quota not found" });
    }

    res.json({
      ...quota.toJSON(),
      totalUsage: quota.getTotalUsage(),
      percentages: {
        uploads: quota.getUsagePercentage('uploads'),
        summaries: quota.getUsagePercentage('summaries'),
        flashcards: quota.getUsagePercentage('flashcards'),
        quizzes: quota.getUsagePercentage('quizzes'),
        chats: quota.getUsagePercentage('chats'),
        studyPlans: quota.getUsagePercentage('studyPlans')
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update quota for a user
 * PUT /api/quotas/:id
 */
export const updateQuota = async (req, res) => {
  try {
    const quota = await Quota.findOne({ where: { userId: req.params.id } });

    if (!quota) {
      return res.status(404).json({ message: "Quota not found" });
    }

    // Validate update fields
    const allowedFields = [
      'maxUploads', 'summaries', 'flashcards', 'quizzes', 'chats', 'studyPlans',
      'usedUploads', 'usedSummaries', 'usedFlashcards', 'usedQuizzes', 'usedChats', 'usedStudyPlans'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await quota.update(updates);

    res.json({
      message: "Quota updated successfully",
      quota: {
        ...quota.toJSON(),
        totalUsage: quota.getTotalUsage()
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get all quotas (Admin only)
 * GET /api/quotas
 */
export const getAllQuotas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows: quotas } = await Quota.findAndCountAll({
      include: [{
        model: User,
        attributes: ['id', 'fullname', 'email', 'subscriptionTier', 'subscriptionStatus']
      }],
      limit,
      offset,
      order: [['updatedAt', 'DESC']]
    });

    const quotasWithUsage = quotas.map(quota => ({
      ...quota.toJSON(),
      totalUsage: quota.getTotalUsage()
    }));

    res.json({
      quotas: quotasWithUsage,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get quota statistics for admin dashboard
 * GET /api/quotas/statistics
 */
export const getQuotaStatistics = async (req, res) => {
  try {
    // Get total and active users
    const totalUsers = await User.count();
    const activeUsers = await User.count({
      where: {
        subscriptionStatus: 'active'
      }
    });

    // Get all quotas for calculations
    const allQuotas = await Quota.findAll({
      include: [{
        model: User,
        attributes: ['id', 'fullname', 'email', 'subscriptionTier']
      }]
    });

    // Calculate total quotas and usage
    const totals = {
      uploads: { total: 0, used: 0 },
      summaries: { total: 0, used: 0 },
      flashcards: { total: 0, used: 0 },
      quizzes: { total: 0, used: 0 },
      chats: { total: 0, used: 0 },
      studyPlans: { total: 0, used: 0 }
    };

    allQuotas.forEach(quota => {
      totals.uploads.total += quota.maxUploads;
      totals.uploads.used += quota.usedUploads;
      totals.summaries.total += quota.summaries;
      totals.summaries.used += quota.usedSummaries;
      totals.flashcards.total += quota.flashcards;
      totals.flashcards.used += quota.usedFlashcards;
      totals.quizzes.total += quota.quizzes;
      totals.quizzes.used += quota.usedQuizzes;
      totals.chats.total += quota.chats;
      totals.chats.used += quota.usedChats;
      totals.studyPlans.total += quota.studyPlans;
      totals.studyPlans.used += quota.usedStudyPlans;
    });

    // Calculate percentage utilization for each feature
    const utilizationPercentage = {};
    for (const [feature, data] of Object.entries(totals)) {
      utilizationPercentage[feature] = data.total > 0
        ? Math.round((data.used / data.total) * 100)
        : 0;
    }

    // Get top 10 users by total quota usage
    const topUsers = allQuotas
      .map(quota => {
        const totalUsed = quota.usedUploads + quota.usedSummaries +
                         quota.usedFlashcards + quota.usedQuizzes +
                         quota.usedChats + quota.usedStudyPlans;
        const totalMax = quota.maxUploads + quota.summaries +
                        quota.flashcards + quota.quizzes +
                        quota.chats + quota.studyPlans;

        return {
          userId: quota.userId,
          userName: quota.User?.fullname || 'Unknown',
          email: quota.User?.email || 'N/A',
          subscriptionTier: quota.User?.subscriptionTier || 'free',
          totalUsed,
          totalMax,
          usagePercentage: totalMax > 0 ? Math.round((totalUsed / totalMax) * 100) : 0
        };
      })
      .sort((a, b) => b.totalUsed - a.totalUsed)
      .slice(0, 10);

    // Usage breakdown by feature
    const usageBreakdown = {
      uploads: {
        total: totals.uploads.total,
        used: totals.uploads.used,
        remaining: totals.uploads.total - totals.uploads.used,
        percentage: utilizationPercentage.uploads
      },
      summaries: {
        total: totals.summaries.total,
        used: totals.summaries.used,
        remaining: totals.summaries.total - totals.summaries.used,
        percentage: utilizationPercentage.summaries
      },
      flashcards: {
        total: totals.flashcards.total,
        used: totals.flashcards.used,
        remaining: totals.flashcards.total - totals.flashcards.used,
        percentage: utilizationPercentage.flashcards
      },
      quizzes: {
        total: totals.quizzes.total,
        used: totals.quizzes.used,
        remaining: totals.quizzes.total - totals.quizzes.used,
        percentage: utilizationPercentage.quizzes
      },
      chats: {
        total: totals.chats.total,
        used: totals.chats.used,
        remaining: totals.chats.total - totals.chats.used,
        percentage: utilizationPercentage.chats
      },
      studyPlans: {
        total: totals.studyPlans.total,
        used: totals.studyPlans.used,
        remaining: totals.studyPlans.total - totals.studyPlans.used,
        percentage: utilizationPercentage.studyPlans
      }
    };

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers
      },
      usageBreakdown,
      utilizationPercentage,
      topUsers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get quota usage history for a specific user
 * GET /api/quotas/user/:userId/history
 */
export const getUserQuotaHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 30;

    // Get user info
    const user = await User.findByPk(userId, {
      attributes: ['id', 'fullname', 'email', 'subscriptionTier']
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get current quota
    const currentQuota = await Quota.findOne({ where: { userId } });

    if (!currentQuota) {
      return res.status(404).json({ message: "Quota not found for this user" });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get quota snapshots (you would need to implement a QuotaHistory table for detailed history)
    // For now, return current usage with historical context
    const history = {
      userId: user.id,
      userName: user.fullname,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      period: {
        startDate,
        endDate,
        days
      },
      currentUsage: currentQuota.getTotalUsage(),
      resetDate: currentQuota.resetDate,
      percentages: {
        uploads: currentQuota.getUsagePercentage('uploads'),
        summaries: currentQuota.getUsagePercentage('summaries'),
        flashcards: currentQuota.getUsagePercentage('flashcards'),
        quizzes: currentQuota.getUsagePercentage('quizzes'),
        chats: currentQuota.getUsagePercentage('chats'),
        studyPlans: currentQuota.getUsagePercentage('studyPlans')
      }
    };

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Reset user's quota usage
 * POST /api/quotas/user/:userId/reset
 */
export const resetUserQuota = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const quota = await Quota.findOne({ where: { userId } });
    if (!quota) {
      return res.status(404).json({ message: "Quota not found for this user" });
    }

    // Reset usage
    await quota.resetUsage();

    res.json({
      message: `Quota reset successfully for user ${user.fullname}`,
      quota: {
        ...quota.toJSON(),
        totalUsage: quota.getTotalUsage()
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Bulk update quotas for multiple users based on subscription plan
 * PUT /api/quotas/bulk-update
 */
export const bulkUpdateQuotas = async (req, res) => {
  try {
    const { subscriptionTier, quotaUpdates } = req.body;

    // Validate input
    if (!subscriptionTier && !req.body.userIds) {
      return res.status(400).json({
        message: "Either subscriptionTier or userIds array must be provided"
      });
    }

    if (!quotaUpdates || typeof quotaUpdates !== 'object') {
      return res.status(400).json({
        message: "quotaUpdates object is required"
      });
    }

    // Validate quota update fields
    const allowedFields = [
      'maxUploads', 'summaries', 'flashcards', 'quizzes', 'chats', 'studyPlans'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (quotaUpdates[field] !== undefined) {
        if (typeof quotaUpdates[field] !== 'number' || quotaUpdates[field] < 0) {
          return res.status(400).json({
            message: `Invalid value for ${field}. Must be a non-negative number.`
          });
        }
        updates[field] = quotaUpdates[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid quota fields to update"
      });
    }

    let whereClause = {};

    // Build where clause based on input
    if (req.body.userIds && Array.isArray(req.body.userIds)) {
      whereClause.userId = { [Op.in]: req.body.userIds };
    } else if (subscriptionTier) {
      // Find users with specified subscription tier
      const users = await User.findAll({
        where: { subscriptionTier },
        attributes: ['id']
      });

      const userIds = users.map(u => u.id);
      if (userIds.length === 0) {
        return res.status(404).json({
          message: `No users found with subscription tier: ${subscriptionTier}`
        });
      }

      whereClause.userId = { [Op.in]: userIds };
    }

    // Perform bulk update
    const [updatedCount] = await Quota.update(updates, {
      where: whereClause
    });

    res.json({
      message: `Successfully updated quotas for ${updatedCount} users`,
      updatedCount,
      updates
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Admin: Apply subscription plan quotas to a specific user
 * POST /api/quotas/admin/apply-plan/:userId
 */
export const applySubscriptionPlanToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { plan, customQuotas, resetUsage } = req.body;

    // Validate plan
    if (!['free', 'basic', 'premium', 'enterprise'].includes(plan)) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find quota
    const quota = await Quota.findOne({ where: { userId } });
    if (!quota) {
      return res.status(404).json({ message: "Quota not found for this user" });
    }

    // Define plan quotas (same as subscription controller)
    const planQuotas = {
      free: {
        maxUploads: 5,
        summaries: 10,
        flashcards: 20,
        quizzes: 5,
        chats: 50,
        studyPlans: 2
      },
      basic: {
        maxUploads: 25,
        summaries: 50,
        flashcards: 100,
        quizzes: 25,
        chats: 200,
        studyPlans: 10
      },
      premium: {
        maxUploads: 100,
        summaries: 200,
        flashcards: 500,
        quizzes: 100,
        chats: 1000,
        studyPlans: 50
      },
      enterprise: {
        maxUploads: 999999,
        summaries: 999999,
        flashcards: 999999,
        quizzes: 999999,
        chats: 999999,
        studyPlans: 999999
      }
    };

    // Get base quotas from plan
    let quotaUpdates = { ...planQuotas[plan] };

    // Apply custom overrides if provided
    if (customQuotas && typeof customQuotas === 'object') {
      const allowedFields = ['maxUploads', 'summaries', 'flashcards', 'quizzes', 'chats', 'studyPlans'];

      for (const field of allowedFields) {
        if (customQuotas[field] !== undefined) {
          if (typeof customQuotas[field] !== 'number' || customQuotas[field] < 0) {
            return res.status(400).json({
              message: `Invalid value for ${field}. Must be a non-negative number.`
            });
          }
          quotaUpdates[field] = customQuotas[field];
        }
      }
    }

    // Reset usage if requested
    if (resetUsage) {
      quotaUpdates.usedUploads = 0;
      quotaUpdates.usedSummaries = 0;
      quotaUpdates.usedFlashcards = 0;
      quotaUpdates.usedQuizzes = 0;
      quotaUpdates.usedChats = 0;
      quotaUpdates.usedStudyPlans = 0;
      quotaUpdates.resetDate = new Date();
    }

    // Update quota
    await quota.update(quotaUpdates);

    res.json({
      message: `Successfully applied ${plan} plan quotas to user ${user.fullname}`,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        subscriptionTier: user.subscriptionTier
      },
      appliedPlan: plan,
      quota: {
        ...quota.toJSON(),
        totalUsage: quota.getTotalUsage()
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Admin: Completely customize all quota attributes for a user
 * PUT /api/quotas/admin/customize/:userId
 */
export const customizeUserQuota = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      maxUploads,
      summaries,
      flashcards,
      quizzes,
      chats,
      studyPlans,
      usedUploads,
      usedSummaries,
      usedFlashcards,
      usedQuizzes,
      usedChats,
      usedStudyPlans,
      resetDate
    } = req.body;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find quota
    const quota = await Quota.findOne({ where: { userId } });
    if (!quota) {
      return res.status(404).json({ message: "Quota not found for this user" });
    }

    // Build update object with all provided fields
    const updates = {};
    const allowedFields = {
      maxUploads,
      summaries,
      flashcards,
      quizzes,
      chats,
      studyPlans,
      usedUploads,
      usedSummaries,
      usedFlashcards,
      usedQuizzes,
      usedChats,
      usedStudyPlans
    };

    // Validate and add fields to updates
    for (const [field, value] of Object.entries(allowedFields)) {
      if (value !== undefined) {
        if (typeof value !== 'number' || value < 0) {
          return res.status(400).json({
            message: `Invalid value for ${field}. Must be a non-negative number.`
          });
        }
        updates[field] = value;
      }
    }

    // Handle reset date
    if (resetDate !== undefined) {
      const date = new Date(resetDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid resetDate format" });
      }
      updates.resetDate = date;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Update quota
    await quota.update(updates);

    res.json({
      message: `Successfully customized quota for user ${user.fullname}`,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        subscriptionTier: user.subscriptionTier
      },
      quota: {
        ...quota.toJSON(),
        totalUsage: quota.getTotalUsage()
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Admin: Get complete quota details with subscription info
 * GET /api/quotas/admin/details/:userId
 */
export const getAdminQuotaDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'fullname', 'email', 'subscriptionTier', 'subscriptionStatus', 'subscriptionStartDate', 'subscriptionEndDate']
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const quota = await Quota.findOne({ where: { userId } });
    if (!quota) {
      return res.status(404).json({ message: "Quota not found for this user" });
    }

    // Get active subscription if exists
    const subscription = await Subscription.findOne({
      where: { userId, status: 'active' },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      user: user.toJSON(),
      quota: {
        ...quota.toJSON(),
        totalUsage: quota.getTotalUsage(),
        percentages: {
          uploads: quota.getUsagePercentage('uploads'),
          summaries: quota.getUsagePercentage('summaries'),
          flashcards: quota.getUsagePercentage('flashcards'),
          quizzes: quota.getUsagePercentage('quizzes'),
          chats: quota.getUsagePercentage('chats'),
          studyPlans: quota.getUsagePercentage('studyPlans')
        }
      },
      subscription: subscription || null,
      availablePlans: ['free', 'basic', 'premium', 'enterprise']
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
