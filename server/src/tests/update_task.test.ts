
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskInput } from '../schema';
import { updateTask } from '../handlers/update_task';
import { eq } from 'drizzle-orm';

describe('updateTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update task title', async () => {
    // Create a task first using direct database insert
    const insertResult = await db.insert(tasksTable)
      .values({
        title: 'Original Title',
        completed: false
      })
      .returning()
      .execute();
    
    const createdTask = insertResult[0];

    // Update the title
    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      title: 'Updated Title'
    };

    const result = await updateTask(updateInput);

    expect(result.id).toEqual(createdTask.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.completed).toEqual(false); // Should remain unchanged
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update task completed status', async () => {
    // Create a task first using direct database insert
    const insertResult = await db.insert(tasksTable)
      .values({
        title: 'Test Task',
        completed: false
      })
      .returning()
      .execute();
    
    const createdTask = insertResult[0];

    // Update the completed status
    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      completed: true
    };

    const result = await updateTask(updateInput);

    expect(result.id).toEqual(createdTask.id);
    expect(result.title).toEqual('Test Task'); // Should remain unchanged
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update both title and completed status', async () => {
    // Create a task first using direct database insert
    const insertResult = await db.insert(tasksTable)
      .values({
        title: 'Original Task',
        completed: false
      })
      .returning()
      .execute();
    
    const createdTask = insertResult[0];

    // Update both fields
    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      title: 'Updated Task',
      completed: true
    };

    const result = await updateTask(updateInput);

    expect(result.id).toEqual(createdTask.id);
    expect(result.title).toEqual('Updated Task');
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated task to database', async () => {
    // Create a task first using direct database insert
    const insertResult = await db.insert(tasksTable)
      .values({
        title: 'Database Test Task',
        completed: false
      })
      .returning()
      .execute();
    
    const createdTask = insertResult[0];

    // Update the task
    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      title: 'Updated Database Task',
      completed: true
    };

    await updateTask(updateInput);

    // Verify in database
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toEqual('Updated Database Task');
    expect(tasks[0].completed).toEqual(true);
    expect(tasks[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when task not found', async () => {
    const updateInput: UpdateTaskInput = {
      id: 999, // Non-existent ID
      title: 'This should fail'
    };

    await expect(updateTask(updateInput)).rejects.toThrow(/Task with id 999 not found/i);
  });
});
