// controllers/studyPlanController.js
import StudyPlan from '../models/StudyPlan.js';
import Document from '../models/Document.js'; // ✅ import it!
import { generateTasks } from '../utils/studyPlannerHelper.js';
import { Op } from "sequelize";
export async function createOrUpdateStudyPlan(req, res) {
  try {
    console.log("📩 Incoming request body:", req.body);
    console.log("👤 Authenticated user:", req.user);

    const userId = req.user.id;
    let { documentsIds, freeDays, dailyHours, sessionDuration, examDates } = req.body;
    console.log(documentsIds);
    // Validate documentsIds
    if (!documentsIds || !Array.isArray(documentsIds) || documentsIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one document.' });
    }

    // Convert IDs to numbers (avoid string/number mismatch)
    documentsIds = documentsIds.map(Number);

    // Fetch documents with extractedText
    const documents = await Document.findAll({
      where: {
        userId,
        id: { [Op.in]: documentsIds } // <-- fetch all documents matching IDs
      },
      attributes: ['id', 'name', 'extractedText']
    });

    if (!documents.length) {
      return res.status(404).json({ message: 'No valid documents found for this user.' });
    }

    // Call AI helper to generate tasks
    const tasks = await generateTasks({
      documentsIds,
      freeDays,
      dailyHours,
      sessionDuration,
      examDates,
      userId
    });

    console.log("📝 Generated tasks:", tasks);

    // Check if a study plan already exists
    let plan = await StudyPlan.findOne({ where: { userId } });

    if (plan) {
      // Update existing plan
      plan.set({
        documents: documents.map(d => d.id),
        freeDays,
        dailyHours,
        sessionDuration,
        tasks,
        examDates
      });
      await plan.save();
    } else {
      // Create new plan
      plan = await StudyPlan.create({
        userId,
        documents: documents.map(d => d.id),
        freeDays,
        dailyHours,
        sessionDuration,
        tasks,
        examDates
      });
    }

    return res.json(plan);

  } catch (error) {
    console.error('❌ Error in createOrUpdateStudyPlan:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}



/**
 * Get the study plan for the logged-in user
 */
export async function getStudyPlan(req, res) {
  try {
    const userId = req.user.id;

    const plan = await StudyPlan.findOne({ where: { userId } });
    if (!plan) return res.status(404).json({ error: 'No study plan found.' });

    return res.json(plan);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}
