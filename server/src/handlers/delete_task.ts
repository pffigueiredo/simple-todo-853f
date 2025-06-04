
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type DeleteTaskInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteTask = async (input: DeleteTaskInput): Promise<void> => {
  try {
    // Delete the task by ID
    const result = await db.delete(tasksTable)
      .where(eq(tasksTable.id, input.id))
      .execute();

    // Check if any rows were affected (task existed)
    if (result.rowCount === 0) {
      throw new Error(`Task with id ${input.id} not found`);
    }
  } catch (error) {
    console.error('Task deletion failed:', error);
    throw error;
  }
};
