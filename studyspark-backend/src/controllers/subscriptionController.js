import User from '../models/userModel.js';
import Quota from '../models/Quota.js';
import Subscription from '../models/Subscription.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

// Subscription tier configurations
const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    quotas: {
      summaries: 10,
      flashcards: 20,
      quizzes: 5,
      chats: 50,
      studyPlans: 2,
      maxUploads: 5
    },
    duration: null, // unlimited
    features: {
      basicSummaries: true,
      basicFlashcards: true,
      basicQuizzes: true,
      chatSupport: false,
      advancedAnalytics: false,
      prioritySupport: false
    }
  },
  basic: {
    name: 'Basic',
    price: 9.99,
    quotas: {
      summaries: 50,
      flashcards: 100,
      quizzes: 25,
      chats: 200,
      studyPlans: 10,
      maxUploads: 25
    },
    duration: 30, // 30 days
    features: {
      basicSummaries: true,
      basicFlashcards: true,
      basicQuizzes: true,
      chatSupport: true,
      advancedAnalytics: false,
      prioritySupport: false
    }
  },
  premium: {
    name: 'Premium',
    price: 19.99,
    quotas: {
      summaries: 200,
      flashcards: 500,
      quizzes: 100,
      chats: 1000,
      studyPlans: 50,
      maxUploads: 100
    },
    duration: 30, // 30 days
    features: {
      basicSummaries: true,
      basicFlashcards: true,
      basicQuizzes: true,
      chatSupport: true,
      advancedAnalytics: true,
      prioritySupport: false,
      customStudyPlans: true
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 49.99,
    quotas: {
      summaries: -1, // unlimited
      flashcards: -1,
      quizzes: -1,
      chats: -1,
      studyPlans: -1,
      maxUploads: -1
    },
    duration: 30, // 30 days
    features: {
      basicSummaries: true,
      basicFlashcards: true,
      basicQuizzes: true,
      chatSupport: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customStudyPlans: true,
      apiAccess: true,
      dedicatedSupport: true
    }
  }
};

/**
 * Get available subscription plans
 * GET /api/subscriptions/plans
 */
export const getSubscriptionPlans = (req, res) => {
  res.json({
    plans: SUBSCRIPTION_PLANS
  });
};

/**
 * Get user's current subscription
 * GET /api/subscriptions/my-subscription
 */
export const getMySubscription = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [Quota]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get subscription record if exists
    const subscription = await Subscription.findOne({
      where: {
        userId: user.id,
        status: 'active'
      },
      order: [['createdAt', 'DESC']]
    });

    const plan = SUBSCRIPTION_PLANS[user.subscriptionTier];

    res.json({
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
      plan: plan,
      quota: user.Quota,
      subscription: subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Subscribe to a plan (upgrade/downgrade)
 * POST /api/subscriptions/subscribe
 */
export const subscribe = async (req, res) => {
  try {
    const { tier, paymentMethod, transactionId } = req.body;

    if (!['free', 'basic', 'premium', 'enterprise'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid subscription tier' });
    }

    const user = await User.findByPk(req.user.id, {
      include: [Quota]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const plan = SUBSCRIPTION_PLANS[tier];
    const now = new Date();
    const endDate = plan.duration ? new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000) : null;

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Cancel previous active subscription if exists
      await Subscription.update(
        { status: 'cancelled', cancelledAt: now },
        {
          where: {
            userId: user.id,
            status: 'active'
          },
          transaction
        }
      );

      // Create new subscription record
      const subscription = await Subscription.create({
        userId: user.id,
        plan: tier,
        status: 'active',
        startDate: now,
        endDate: endDate,
        price: plan.price,
        features: plan.features,
        paymentMethod: paymentMethod || null,
        transactionId: transactionId || null,
        autoRenew: false
      }, { transaction });

      // Update user subscription
      user.subscriptionTier = tier;
      user.subscriptionStartDate = now;
      user.subscriptionEndDate = endDate;
      user.subscriptionStatus = 'active';
      await user.save({ transaction });

      // Update quota based on new plan
      const quotaValues = {
        summaries: plan.quotas.summaries === -1 ? 999999 : plan.quotas.summaries,
        flashcards: plan.quotas.flashcards === -1 ? 999999 : plan.quotas.flashcards,
        quizzes: plan.quotas.quizzes === -1 ? 999999 : plan.quotas.quizzes,
        chats: plan.quotas.chats === -1 ? 999999 : plan.quotas.chats,
        studyPlans: plan.quotas.studyPlans === -1 ? 999999 : plan.quotas.studyPlans,
        maxUploads: plan.quotas.maxUploads === -1 ? 999999 : plan.quotas.maxUploads,
        usedUploads: 0,
        usedSummaries: 0,
        usedFlashcards: 0,
        usedQuizzes: 0,
        usedChats: 0,
        usedStudyPlans: 0,
        resetDate: now
      };

      if (user.Quota) {
        await user.Quota.update(quotaValues, { transaction });
      } else {
        await Quota.create({
          userId: user.id,
          ...quotaValues
        }, { transaction });
      }

      await transaction.commit();

      res.json({
        message: `Successfully subscribed to ${plan.name} plan!`,
        subscription: subscription,
        tier: tier,
        endDate: endDate,
        quota: plan.quotas
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Cancel subscription (downgrade to free)
 * POST /api/subscriptions/cancel
 */
export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [Quota]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const freePlan = SUBSCRIPTION_PLANS.free;
    const now = new Date();

    const transaction = await sequelize.transaction();

    try {
      // Update subscription record
      await Subscription.update(
        { status: 'cancelled', cancelledAt: now },
        {
          where: {
            userId: user.id,
            status: 'active'
          },
          transaction
        }
      );

      // Downgrade to free
      user.subscriptionTier = 'free';
      user.subscriptionStatus = 'cancelled';
      user.subscriptionEndDate = now;
      await user.save({ transaction });

      // Update quota to free tier
      if (user.Quota) {
        await user.Quota.update({
          summaries: freePlan.quotas.summaries,
          flashcards: freePlan.quotas.flashcards,
          quizzes: freePlan.quotas.quizzes,
          chats: freePlan.quotas.chats,
          studyPlans: freePlan.quotas.studyPlans,
          maxUploads: freePlan.quotas.maxUploads
        }, { transaction });
      }

      await transaction.commit();

      res.json({
        message: 'Subscription cancelled. You are now on the Free plan.',
        tier: 'free',
        quota: freePlan.quotas
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Check and expire subscriptions (cron job endpoint)
 * POST /api/subscriptions/check-expired
 */
export const checkExpiredSubscriptions = async (req, res) => {
  try {
    const now = new Date();

    // Find all users with expired subscriptions
    const expiredUsers = await User.findAll({
      where: {
        subscriptionEndDate: {
          [Op.lte]: now
        },
        subscriptionStatus: 'active'
      },
      include: [Quota]
    });

    const freePlan = SUBSCRIPTION_PLANS.free;
    let expiredCount = 0;

    for (const user of expiredUsers) {
      const transaction = await sequelize.transaction();

      try {
        // Update subscription record
        await Subscription.update(
          { status: 'expired' },
          {
            where: {
              userId: user.id,
              status: 'active'
            },
            transaction
          }
        );

        // Downgrade to free
        user.subscriptionTier = 'free';
        user.subscriptionStatus = 'expired';
        await user.save({ transaction });

        // Update quota
        if (user.Quota) {
          await user.Quota.update({
            summaries: freePlan.quotas.summaries,
            flashcards: freePlan.quotas.flashcards,
            quizzes: freePlan.quotas.quizzes,
            chats: freePlan.quotas.chats,
            studyPlans: freePlan.quotas.studyPlans,
            maxUploads: freePlan.quotas.maxUploads
          }, { transaction });
        }

        await transaction.commit();
        expiredCount++;
      } catch (error) {
        await transaction.rollback();
        console.error(`Error expiring subscription for user ${user.id}:`, error);
      }
    }

    res.json({
      message: `${expiredCount} subscriptions expired and downgraded to free`,
      count: expiredCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all subscriptions (Admin only)
 * GET /api/subscriptions/all
 */
export const getAllSubscriptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const status = req.query.status; // filter by status

    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: subscriptions } = await Subscription.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'fullname', 'email', 'subscriptionTier', 'subscriptionStatus']
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Get statistics
    const totalActive = await Subscription.count({ where: { status: 'active' } });
    const totalExpired = await Subscription.count({ where: { status: 'expired' } });
    const totalCancelled = await Subscription.count({ where: { status: 'cancelled' } });

    res.json({
      subscriptions,
      statistics: {
        totalActive,
        totalExpired,
        totalCancelled,
        total: count
      },
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update user subscription (Admin only)
 * PUT /api/subscriptions/user/:userId
 */
export const updateUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { tier, duration, notes } = req.body;

    if (!['free', 'basic', 'premium', 'enterprise'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid subscription tier' });
    }

    const user = await User.findByPk(userId, {
      include: [Quota]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const plan = SUBSCRIPTION_PLANS[tier];
    const now = new Date();
    const customDuration = duration || plan.duration;
    const endDate = customDuration ? new Date(now.getTime() + customDuration * 24 * 60 * 60 * 1000) : null;

    const transaction = await sequelize.transaction();

    try {
      // Cancel previous active subscription
      await Subscription.update(
        { status: 'cancelled', cancelledAt: now },
        {
          where: {
            userId: user.id,
            status: 'active'
          },
          transaction
        }
      );

      // Create new subscription record
      const subscription = await Subscription.create({
        userId: user.id,
        plan: tier,
        status: 'active',
        startDate: now,
        endDate: endDate,
        price: plan.price,
        features: plan.features,
        notes: notes || `Admin updated subscription to ${plan.name}`
      }, { transaction });

      // Update user subscription
      user.subscriptionTier = tier;
      user.subscriptionStartDate = now;
      user.subscriptionEndDate = endDate;
      user.subscriptionStatus = 'active';
      await user.save({ transaction });

      // Auto-update quotas based on new plan
      const quotaValues = {
        summaries: plan.quotas.summaries === -1 ? 999999 : plan.quotas.summaries,
        flashcards: plan.quotas.flashcards === -1 ? 999999 : plan.quotas.flashcards,
        quizzes: plan.quotas.quizzes === -1 ? 999999 : plan.quotas.quizzes,
        chats: plan.quotas.chats === -1 ? 999999 : plan.quotas.chats,
        studyPlans: plan.quotas.studyPlans === -1 ? 999999 : plan.quotas.studyPlans,
        maxUploads: plan.quotas.maxUploads === -1 ? 999999 : plan.quotas.maxUploads,
        resetDate: now
      };

      if (user.Quota) {
        await user.Quota.update(quotaValues, { transaction });
      } else {
        await Quota.create({
          userId: user.id,
          ...quotaValues,
          usedUploads: 0,
          usedSummaries: 0,
          usedFlashcards: 0,
          usedQuizzes: 0,
          usedChats: 0,
          usedStudyPlans: 0
        }, { transaction });
      }

      await transaction.commit();

      res.json({
        message: `Successfully updated subscription for user ${user.fullname} to ${plan.name} plan`,
        subscription: subscription,
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionEndDate: user.subscriptionEndDate
        },
        quota: quotaValues
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get subscription statistics (Admin only)
 * GET /api/subscriptions/statistics
 */
export const getSubscriptionStatistics = async (req, res) => {
  try {
    // Count by plan type
    const planCounts = await User.findAll({
      attributes: [
        'subscriptionTier',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['subscriptionTier']
    });

    const countByPlan = {
      free: 0,
      basic: 0,
      premium: 0,
      enterprise: 0
    };

    planCounts.forEach(item => {
      countByPlan[item.subscriptionTier] = parseInt(item.dataValues.count);
    });

    // Count by status
    const statusCounts = await User.findAll({
      attributes: [
        'subscriptionStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['subscriptionStatus']
    });

    const countByStatus = {};
    statusCounts.forEach(item => {
      countByStatus[item.subscriptionStatus] = parseInt(item.dataValues.count);
    });

    // Calculate revenue metrics
    const activeSubscriptions = await Subscription.findAll({
      where: { status: 'active' },
      attributes: ['plan', 'price']
    });

    let monthlyRevenue = 0;
    let annualRevenue = 0;

    activeSubscriptions.forEach(sub => {
      const price = parseFloat(sub.price);
      monthlyRevenue += price;
      annualRevenue += price * 12;
    });

    // Get total subscriptions created
    const totalSubscriptions = await Subscription.count();

    // Get expired subscriptions
    const expiredSubscriptions = await Subscription.count({
      where: { status: 'expired' }
    });

    // Calculate conversion rate (non-free users / total users)
    const totalUsers = await User.count();
    const paidUsers = totalUsers - countByPlan.free;
    const conversionRate = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(2) : 0;

    // Get recent subscriptions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSubscriptions = await Subscription.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Get expiring soon (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringSoon = await User.count({
      where: {
        subscriptionEndDate: {
          [Op.between]: [new Date(), sevenDaysFromNow]
        },
        subscriptionStatus: 'active'
      }
    });

    res.json({
      planDistribution: countByPlan,
      statusDistribution: countByStatus,
      revenue: {
        monthly: parseFloat(monthlyRevenue.toFixed(2)),
        annual: parseFloat(annualRevenue.toFixed(2)),
        currency: 'USD'
      },
      metrics: {
        totalUsers,
        paidUsers,
        freeUsers: countByPlan.free,
        conversionRate: parseFloat(conversionRate),
        totalSubscriptions,
        expiredSubscriptions,
        recentSubscriptions,
        expiringSoon
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
