
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type GetTaskInput } from '../schema';
import { getTask } from '../handlers/get_task';

describe('getTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should retrieve a task by id', async () => {
    // Create a test task first
    const insertResult = await db.insert(tasksTable)
      .values({
        title: 'Test Task',
        completed: false
      })
      .returning()
      .execute();

    const createdTask = insertResult[0];
    const input: GetTaskInput = { id: createdTask.id };

    const result = await getTask(input);

    expect(result.id).toEqual(createdTask.id);
    expect(result.title).toEqual('Test Task');
    expect(result.completed).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should retrieve a completed task', async () => {
    // Create a completed test task
    const insertResult = await db.insert(tasksTable)
      .values({
        title: 'Completed Task',
        completed: true
      })
      .returning()
      .execute();

    const createdTask = insertResult[0];
    const input: GetTaskInput = { id: createdTask.id };

    const result = await getTask(input);

    expect(result.id).toEqual(createdTask.id);
    expect(result.title).toEqual('Completed Task');
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw error when task does not exist', async () => {
    const input: GetTaskInput = { id: 9999 };

    await expect(getTask(input)).rejects.toThrow(/not found/i);
  });
});
