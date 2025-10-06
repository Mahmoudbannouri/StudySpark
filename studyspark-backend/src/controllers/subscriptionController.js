import User from '../models/userModel.js';
import Quota from '../models/Quota.js';

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
    duration: null // unlimited
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    quotas: {
      summaries: 100,
      flashcards: 200,
      quizzes: 50,
      chats: 500,
      studyPlans: 20,
      maxUploads: 50
    },
    duration: 7 // 7 days (per week)
  },
  vip: {
    name: 'VIP',
    price: 29.99,
    quotas: {
      summaries: 1000,
      flashcards: 2000,
      quizzes: 500,
      chats: 10000,
      studyPlans: 100,
      maxUploads: 500
    },
    duration: 7 // 7 days (per week)
  }
};

/**
 * Get available subscription plans
 */
export const getSubscriptionPlans = (req, res) => {
  res.json({
    plans: SUBSCRIPTION_PLANS
  });
};

/**
 * Get user's current subscription
 */
export const getMySubscription = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [Quota]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const plan = SUBSCRIPTION_PLANS[user.subscriptionTier];

    res.json({
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
      plan: plan,
      quota: user.Quota
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Subscribe to a plan (upgrade/downgrade)
 */
export const subscribe = async (req, res) => {
  try {
    const { tier } = req.body; // 'free', 'pro', or 'vip'

    if (!['free', 'pro', 'vip'].includes(tier)) {
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

    // Update user subscription
    user.subscriptionTier = tier;
    user.subscriptionStartDate = now;
    user.subscriptionEndDate = endDate;
    user.subscriptionStatus = 'active';
    await user.save();

    // Update quota based on new plan
    if (user.Quota) {
      await user.Quota.update({
        summaries: plan.quotas.summaries,
        flashcards: plan.quotas.flashcards,
        quizzes: plan.quotas.quizzes,
        chats: plan.quotas.chats,
        studyPlans: plan.quotas.studyPlans,
        maxUploads: plan.quotas.maxUploads,
        usedUploads: 0, // Reset on subscription change
        resetDate: now
      });
    } else {
      // Create quota if doesn't exist
      await Quota.create({
        userId: user.id,
        summaries: plan.quotas.summaries,
        flashcards: plan.quotas.flashcards,
        quizzes: plan.quotas.quizzes,
        chats: plan.quotas.chats,
        studyPlans: plan.quotas.studyPlans,
        maxUploads: plan.quotas.maxUploads,
        usedUploads: 0,
        resetDate: now
      });
    }

    res.json({
      message: `Successfully subscribed to ${plan.name} plan!`,
      tier: tier,
      endDate: endDate,
      quota: plan.quotas
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Cancel subscription (downgrade to free)
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

    // Downgrade to free
    user.subscriptionTier = 'free';
    user.subscriptionStatus = 'cancelled';
    user.subscriptionEndDate = new Date(); // End immediately
    await user.save();

    // Update quota to free tier
    if (user.Quota) {
      await user.Quota.update({
        summaries: freePlan.quotas.summaries,
        flashcards: freePlan.quotas.flashcards,
        quizzes: freePlan.quotas.quizzes,
        chats: freePlan.quotas.chats,
        studyPlans: freePlan.quotas.studyPlans,
        maxUploads: freePlan.quotas.maxUploads
      });
    }

    res.json({
      message: 'Subscription cancelled. You are now on the Free plan.',
      tier: 'free',
      quota: freePlan.quotas
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Check and expire subscriptions (cron job endpoint)
 */
export const checkExpiredSubscriptions = async (req, res) => {
  try {
    const now = new Date();

    // Find all users with expired subscriptions
    const expiredUsers = await User.findAll({
      where: {
        subscriptionEndDate: {
          [sequelize.Op.lte]: now
        },
        subscriptionStatus: 'active'
      },
      include: [Quota]
    });

    const freePlan = SUBSCRIPTION_PLANS.free;

    for (const user of expiredUsers) {
      // Downgrade to free
      user.subscriptionTier = 'free';
      user.subscriptionStatus = 'expired';
      await user.save();

      // Update quota
      if (user.Quota) {
        await user.Quota.update({
          summaries: freePlan.quotas.summaries,
          flashcards: freePlan.quotas.flashcards,
          quizzes: freePlan.quotas.quizzes,
          chats: freePlan.quotas.chats,
          studyPlans: freePlan.quotas.studyPlans,
          maxUploads: freePlan.quotas.maxUploads
        });
      }
    }

    res.json({
      message: `${expiredUsers.length} subscriptions expired and downgraded to free`,
      count: expiredUsers.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
