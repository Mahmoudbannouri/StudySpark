// helpers/studyPlanHelper.js

/**
 * Generate tasks for a study plan based on user preferences.
 * This is a placeholder for the AI logic.
 * @param {Object} preferences 
 * @param {Array} preferences.documents - List of document objects {id, name, examDate?}
 * @param {Array} preferences.freeDays - Array of strings e.g. ["Monday","Tuesday"]
 * @param {Object} preferences.dailyHours - { "Monday": "14:00-17:00", ... }
 * @param {Number} preferences.sessionDuration - Hours per session
 * @returns {Array} tasks - List of tasks { title, documentId, startTime, endTime, type, completed }
 */
export function generateTasks(preferences) {
  const tasks = [];
  const now = new Date();

  // Iterate over documents
  preferences.documents.forEach((doc, docIndex) => {
    // Iterate over free days
    preferences.freeDays.forEach((day, dayIndex) => {
      // Calculate start/end time based on dailyHours and sessionDuration
      const [startStr, endStr] = preferences.dailyHours[day].split('-');
      const startHour = parseInt(startStr.split(':')[0], 10);
      const startMinute = parseInt(startStr.split(':')[1], 10);

      const startTime = new Date(now);
      startTime.setDate(now.getDate() + dayIndex);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + preferences.sessionDuration);

      tasks.push({
        title: doc.name, // AI will eventually generate smarter titles
        documentId: doc.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        type: 'study',
        completed: false
      });
    });
  });

  return tasks;
}
