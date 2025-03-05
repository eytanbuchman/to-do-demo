import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { TodoItem } from '../types/todo';
import { TaskForm } from './TaskForm';
import { TaskItem } from './TaskItem';

export const Todo: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('Fetching missions for rebel:', user.id);
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      console.log('Fetching missions from base');
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching missions:', error);
        toast.error('Mission data retrieval failed!');
        return;
      }

      console.log('Missions retrieved successfully:', data);
      setTodos(data || []);
    } catch (error) {
      console.error('Unexpected error fetching missions:', error);
      toast.error('System malfunction during data retrieval!');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (task: Partial<TodoItem>) => {
    if (!user) return;

    try {
      console.log('Deploying new mission:', task);
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            ...task,
            user_id: user.id,
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error deploying mission:', error);
        toast.error('Mission deployment failed!');
        return;
      }

      console.log('Mission deployed successfully:', data);
      setTodos([data, ...todos]);
      toast.success('Mission deployed! 🚀');
    } catch (error) {
      console.error('Unexpected error deploying mission:', error);
      toast.error('System malfunction during deployment!');
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      console.log('Updating mission status:', { id, completed });
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', id);

      if (error) {
        console.error('Error updating mission:', error);
        toast.error('Mission status update failed!');
        return;
      }

      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
      console.log('Mission status updated');
      if (!completed) {
        toast.success('Mission accomplished! 🎯');
      }
    } catch (error) {
      console.error('Unexpected error updating mission:', error);
      toast.error('System glitch during status update!');
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
    try {
      const task = todos.find(t => t.id === taskId);
      if (!task) return;

      const updatedSubtasks = task.subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !completed } : st
      );

      const { error } = await supabase
        .from('todos')
        .update({ subtasks: updatedSubtasks })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating objective:', error);
        toast.error('Objective status update failed!');
        return;
      }

      setTodos(todos.map(todo =>
        todo.id === taskId ? { ...todo, subtasks: updatedSubtasks } : todo
      ));
      
      if (!completed) {
        toast.success('Objective completed! 🎯');
      }
    } catch (error) {
      console.error('Unexpected error updating objective:', error);
      toast.error('System glitch during objective update!');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      console.log('Terminating mission:', id);
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error terminating mission:', error);
        toast.error('Mission termination failed!');
        return;
      }

      setTodos(todos.filter(todo => todo.id !== id));
      console.log('Mission terminated successfully');
      toast.success('Mission terminated! 💥');
    } catch (error) {
      console.error('Unexpected error terminating mission:', error);
      toast.error('System malfunction during termination!');
    }
  };

  if (!user) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-semibold text-dark-900 mb-4">
          Welcome to TaskRebel HQ
        </h2>
        <p className="text-dark-600 mb-8">
          Join the rebellion against boring productivity! Sign in to start your missions.
        </p>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <TaskForm onSubmit={addTodo} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-dark-400">
            Retrieving mission data...
          </div>
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-dark-500">
            No active missions. Time to start the rebellion!
          </p>
        </div>
      ) : (
        <ul className="space-y-4 mt-8">
          {todos.map((todo) => (
            <TaskItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onToggleSubtask={toggleSubtask}
            />
          ))}
        </ul>
      )}
    </div>
  );
}; 