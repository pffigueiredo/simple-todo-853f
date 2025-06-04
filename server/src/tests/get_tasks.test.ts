
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { getTasks } from '../handlers/get_tasks';

describe('getTasks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no tasks exist', async () => {
    const result = await getTasks();

    expect(result).toEqual([]);
  });

  it('should return all tasks', async () => {
    // Create test tasks
    await db.insert(tasksTable)
      .values([
        { title: 'First Task', completed: false },
        { title: 'Second Task', completed: true },
        { title: 'Third Task', completed: false }
      ])
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(3);
    expect(result[0].title).toBeDefined();
    expect(result[0].completed).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
  });

  it('should return tasks ordered by created_at descending', async () => {
    // Create tasks with slight delay to ensure different timestamps
    await db.insert(tasksTable)
      .values({ title: 'First Task', completed: false })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(tasksTable)
      .values({ title: 'Second Task', completed: true })
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(tasksTable)
      .values({ title: 'Third Task', completed: false })
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('Third Task');
    expect(result[1].title).toEqual('Second Task');
    expect(result[2].title).toEqual('First Task');
    
    // Verify ordering by checking timestamps
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should return tasks with all required fields', async () => {
    await db.insert(tasksTable)
      .values({ title: 'Test Task', completed: true })
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(1);
    const task = result[0];
    
    expect(typeof task.id).toBe('number');
    expect(typeof task.title).toBe('string');
    expect(typeof task.completed).toBe('boolean');
    expect(task.created_at).toBeInstanceOf(Date);
    expect(task.title).toEqual('Test Task');
    expect(task.completed).toBe(true);
  });
});
