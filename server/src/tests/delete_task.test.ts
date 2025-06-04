
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type DeleteTaskInput } from '../schema';
import { deleteTask } from '../handlers/delete_task';
import { eq } from 'drizzle-orm';

// Test input
const testDeleteInput: DeleteTaskInput = {
  id: 1
};

describe('deleteTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing task', async () => {
    // Create a task first
    const result = await db.insert(tasksTable)
      .values({
        title: 'Task to delete',
        completed: false
      })
      .returning()
      .execute();

    const taskId = result[0].id;

    // Delete the task
    await deleteTask({ id: taskId });

    // Verify task is deleted
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .execute();

    expect(tasks).toHaveLength(0);
  });

  it('should throw error when deleting non-existent task', async () => {
    // Try to delete a task that doesn't exist
    await expect(deleteTask({ id: 999 })).rejects.toThrow(/not found/i);
  });

  it('should not affect other tasks when deleting', async () => {
    // Create multiple tasks
    const result1 = await db.insert(tasksTable)
      .values({
        title: 'Task 1',
        completed: false
      })
      .returning()
      .execute();

    const result2 = await db.insert(tasksTable)
      .values({
        title: 'Task 2',
        completed: true
      })
      .returning()
      .execute();

    const task1Id = result1[0].id;
    const task2Id = result2[0].id;

    // Delete only the first task
    await deleteTask({ id: task1Id });

    // Verify first task is deleted
    const deletedTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, task1Id))
      .execute();

    expect(deletedTask).toHaveLength(0);

    // Verify second task still exists
    const remainingTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, task2Id))
      .execute();

    expect(remainingTask).toHaveLength(1);
    expect(remainingTask[0].title).toEqual('Task 2');
    expect(remainingTask[0].completed).toBe(true);
  });
});
