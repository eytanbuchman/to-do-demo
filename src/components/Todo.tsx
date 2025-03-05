import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { TaskForm } from './TaskForm';
import { TaskItem } from './TaskItem';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description?: string;
  due_date?: string;
  tags: string[];
}

interface Filters {
  priority: string;
  status: string;
  dueDate: string;
}

export const Todo: React.FC = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    priority: '',
    status: '',
    dueDate: '',
  });

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      console.log('Fetching todos for user:', user?.id);
      let query = supabase
        .from('todos')
        .select('*')
        .eq('user_id', user?.id);

      // Apply filters
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.status === 'completed') {
        query = query.eq('completed', true);
      } else if (filters.status === 'active') {
        query = query.eq('completed', false);
      }
      if (filters.dueDate === 'today') {
        const today = new Date().toISOString().split('T')[0];
        query = query.eq('due_date', today);
      } else if (filters.dueDate === 'week') {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        query = query.lte('due_date', nextWeek.toISOString());
      } else if (filters.dueDate === 'overdue') {
        const today = new Date().toISOString();
        query = query.lt('due_date', today);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Fetched todos:', data);
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Failed to load missions');
    }
  };

  const addTodo = async (title: string) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            title,
            user_id: user?.id,
            completed: false,
            priority: 'MEDIUM',
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Added todo:', data);
      setTodos([data, ...todos]);
      toast.success('Mission created');
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Failed to create mission');
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed } : todo
      ));
      
      toast.success(completed ? 'Mission accomplished!' : 'Mission reactivated');
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast.error('Failed to update mission');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTodos(todos.filter(todo => todo.id !== id));
      toast.success('Mission aborted');
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete mission');
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Your Missions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Mission</span>
        </button>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          onSubmit={(title) => {
            addTodo(title);
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Task List */}
      <div className="space-y-4">
        {todos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-400">No missions yet. Time to start your rebellion!</p>
          </div>
        ) : (
          todos.map(todo => (
            <TaskItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </div>
    </div>
  );
}; 