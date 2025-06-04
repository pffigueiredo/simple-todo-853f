import { db } from '../db';
import { tasksTable } from '../db/schema';

export const deleteAllTasks = async (): Promise<number> => {
  try {
    // Delete all tasks from the table
    const result = await db.delete(tasksTable).execute();
    
    const deletedCount = result.rowCount || 0;
    console.log(`Scheduled job: Deleted ${deletedCount} tasks`);
    
    return deletedCount;
  } catch (error) {
    console.error('Scheduled task deletion failed:', error);
    throw error;
  }
};