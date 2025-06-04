import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit3, Plus, CheckCircle2, Circle } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeSwitcher } from '@/components/theme-switcher';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../../server/src/schema';

function AppContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editTitle, setEditTitle] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      const result = await trpc.getTasks.query();
      setTasks(result);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsLoading(true);
    try {
      const createInput: CreateTaskInput = { title: newTaskTitle.trim() };
      const newTask = await trpc.createTask.mutate(createInput);
      setTasks((prev: Task[]) => [...prev, newTask]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updateInput: UpdateTaskInput = {
        id: task.id,
        completed: !task.completed
      };
      const updatedTask = await trpc.updateTask.mutate(updateInput);
      setTasks((prev: Task[]) =>
        prev.map((t: Task) => (t.id === task.id ? updatedTask : t))
      );
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
  };

  const handleSaveEdit = async () => {
    if (!editingTask || !editTitle.trim()) return;

    try {
      const updateInput: UpdateTaskInput = {
        id: editingTask.id,
        title: editTitle.trim()
      };
      const updatedTask = await trpc.updateTask.mutate(updateInput);
      setTasks((prev: Task[]) =>
        prev.map((t: Task) => (t.id === editingTask.id ? updatedTask : t))
      );
      setEditingTask(null);
      setEditTitle('');
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await trpc.deleteTask.mutate({ id: taskId });
      setTasks((prev: Task[]) => prev.filter((t: Task) => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const completedTasks = tasks.filter((task: Task) => task.completed);
  const pendingTasks = tasks.filter((task: Task) => !task.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <ThemeSwitcher />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            ✅ My Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Stay organized and get things done!</p>
        </div>

        {/* Add New Task Form */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-100">
              <Plus className="w-5 h-5 text-blue-600" />
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="flex gap-2">
              <Input
                placeholder="What needs to be done? 🤔"
                value={newTaskTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewTaskTitle(e.target.value)
                }
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !newTaskTitle.trim()}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isLoading ? 'Adding...' : 'Add Task'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tasks Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{tasks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-green-50/80 dark:bg-green-900/30 backdrop-blur-sm border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks.length}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Completed</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-orange-50/80 dark:bg-orange-900/30 backdrop-blur-sm border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingTasks.length}</div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Pending</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <Card className="text-center py-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0">
            <CardContent>
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No tasks yet!</p>
              <p className="text-gray-400 dark:text-gray-500">Add your first task above to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Circle className="w-5 h-5 text-orange-500" />
                  Pending Tasks ({pendingTasks.length})
                </h2>
                {pendingTasks.map((task: Task) => (
                  <Card key={task.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task)}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        
                        {editingTask?.id === task.id ? (
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={editTitle}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setEditTitle(e.target.value)
                              }
                              className="flex-1"
                              onKeyDown={(e: React.KeyboardEvent) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              autoFocus
                            />
                            <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className={`flex-1 ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                              {task.title}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartEdit(task)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{task.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 ml-7">
                        Created: {task.created_at.toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Completed Tasks ({completedTasks.length})
                </h2>
                {completedTasks.map((task: Task) => (
                  <Card key={task.id} className="bg-green-50/60 dark:bg-green-900/30 backdrop-blur-sm border-green-200/50 dark:border-green-800/50 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task)}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        
                        {editingTask?.id === task.id ? (
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={editTitle}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setEditTitle(e.target.value)
                              }
                              className="flex-1"
                              onKeyDown={(e: React.KeyboardEvent) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              autoFocus
                            />
                            <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 line-through text-gray-500 dark:text-gray-400">
                              {task.title}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartEdit(task)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{task.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 ml-7">
                        Created: {task.created_at.toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppContent />
    </ThemeProvider>
  );
}

export default App;