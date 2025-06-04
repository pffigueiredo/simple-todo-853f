
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type GetTaskInput, type Task } from '../schema';
import { eq } from 'drizzle-orm';

export const getTask = async (input: GetTaskInput): Promise<Task> => {
  try {
    const result = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, input.id))
      .execute();

    if (result.length === 0) {
      throw new Error(`Task with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Get task failed:', error);
    throw error;
  }
};
