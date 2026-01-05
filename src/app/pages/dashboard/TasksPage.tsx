import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckSquare, Plus, Trash2, Edit2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Review customer feedback',
      description: 'Go through all customer reviews from last week',
      completed: false,
      priority: 'high',
      dueDate: '2024-01-20',
    },
    {
      id: '2',
      title: 'Update product descriptions',
      description: 'Update descriptions for new product line',
      completed: true,
      priority: 'medium',
      dueDate: '2024-01-18',
    },
    {
      id: '3',
      title: 'Prepare monthly report',
      description: 'Compile sales and analytics data for January',
      completed: false,
      priority: 'low',
      dueDate: '2024-01-25',
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: '',
      completed: false,
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    toast.success('Task added');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast.success('Task deleted');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600';
      case 'low':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tasks</h2>
          <p className="text-gray-600">Manage your tasks and to-dos</p>
        </div>

        {/* Add Task */}
        <Card className="p-4 bg-white border-gray-200 mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <Button onClick={addTask} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </Card>

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-blue-600 text-white' : ''}
          >
            All ({tasks.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'bg-blue-600 text-white' : ''}
          >
            Active ({tasks.filter((t) => !t.completed).length})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'bg-blue-600 text-white' : ''}
          >
            Completed ({tasks.filter((t) => t.completed).length})
          </Button>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card className="p-12 bg-white border-gray-200 text-center">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Add a new task to get started</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={`p-4 bg-white border-gray-200 ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      task.completed
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    {task.completed && <CheckSquare className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1">
                    <h3
                      className={`font-semibold text-gray-900 mb-1 ${
                        task.completed ? 'line-through' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

