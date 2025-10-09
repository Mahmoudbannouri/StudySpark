// controllers/studyPlanController.js
import StudyPlan from '../models/StudyPlan.js';
import Document from '../models/Document.js'; // ✅ import it!
import { generateTasks } from '../utils/studyPlannerHelper.js';

export async function createOrUpdateStudyPlan(req, res) {
  try {
    console.log("📩 Incoming request body:", req.body);
    console.log("👤 Authenticated user:", req.user);

    const userId = req.user.id;
    const { documentsIds, freeDays, dailyHours, sessionDuration, examDates } = req.body;

    if (!documentsIds || documentsIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one document.' });
    }

    // ✅ Corrected variable name and query
    const documents = await Document.findAll({
      where: { userId, id: documentsIds },
      attributes: ['id', 'name', 'extractedText']
    });

    if (!documents.length) {
      return res.status(404).json({ message: 'No valid documents found for this user.' });
    }

    // ✅ Pass examDates instead of examDate (you already send an object)
    const tasks = generateTasks({ documents, freeDays, dailyHours, sessionDuration, examDates });

    // ✅ Find existing plan for the user
    let plan = await StudyPlan.findOne({ where: { userId } });

    if (plan) {
      // Update existing
      plan.set({
        documents: documents.map(d => d.id),
        freeDays,
        dailyHours,
        sessionDuration,
        tasks
      });
      await plan.save();
    } else {
      // Create new
      plan = await StudyPlan.create({
        userId,
        documents: documents.map(d => d.id),
        freeDays,
        dailyHours,
        sessionDuration,
        tasks,
        examDate: examDates?.[documents[0].id] || null
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
