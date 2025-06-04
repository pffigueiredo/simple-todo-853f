import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput } from '../schema';
import { createTask } from '../handlers/create_task';
import { deleteAllTasks } from '../handlers/delete_all_tasks';

// Test input for creating tasks
const testTask1: CreateTaskInput = {
  title: 'Test Task 1'
};

const testTask2: CreateTaskInput = {
  title: 'Test Task 2'
};

const testTask3: CreateTaskInput = {
  title: 'Test Task 3'
};

describe('deleteAllTasks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete all tasks from empty database', async () => {
    const deletedCount = await deleteAllTasks();
    
    expect(deletedCount).toEqual(0);
    
    // Verify database is still empty
    const tasks = await db.select().from(tasksTable).execute();
    expect(tasks).toHaveLength(0);
  });

  it('should delete all tasks when tasks exist', async () => {
    // Create some test tasks first
    await createTask(testTask1);
    await createTask(testTask2);
    await createTask(testTask3);
    
    // Verify tasks were created
    const tasksBefore = await db.select().from(tasksTable).execute();
    expect(tasksBefore).toHaveLength(3);
    
    // Delete all tasks
    const deletedCount = await deleteAllTasks();
    
    expect(deletedCount).toEqual(3);
    
    // Verify all tasks are deleted
    const tasksAfter = await db.select().from(tasksTable).execute();
    expect(tasksAfter).toHaveLength(0);
  });

  it('should handle multiple delete operations correctly', async () => {
    // Create some tasks
    await createTask(testTask1);
    await createTask(testTask2);
    
    // First deletion
    const deletedCount1 = await deleteAllTasks();
    expect(deletedCount1).toEqual(2);
    
    // Second deletion on empty database
    const deletedCount2 = await deleteAllTasks();
    expect(deletedCount2).toEqual(0);
    
    // Verify database is empty
    const tasks = await db.select().from(tasksTable).execute();
    expect(tasks).toHaveLength(0);
  });
});