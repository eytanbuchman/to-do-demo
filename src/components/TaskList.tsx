import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Task from './Task'
import { TaskForm } from './TaskForm'
import { toast } from 'react-hot-toast'

interface TaskType {
  id: string
  title: string
  description: string
  completed: boolean
  priority: string
  tags: string[]
  due_date?: string
  is_recurring: boolean
  recurrence_pattern?: string
  subtasks: any[]
  created_at: string
}

export const TaskList = () => {
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    priority: '',
    tag: '',
    status: ''
  })
  const [tags, setTags] = useState<string[]>([])

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks with filters:', filters)
      let query = supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.status === 'completed') {
        query = query.eq('completed', true)
      } else if (filters.status === 'active') {
        query = query.eq('completed', false)
      }
      if (filters.tag) {
        query = query.contains('tags', [filters.tag])
      }

      const { data, error } = await query
      if (error) throw error

      console.log('Fetched tasks:', data)
      const typedData = data as TaskType[]
      setTasks(typedData || [])

      // Extract unique tags from tasks
      const allTags = (typedData || []).reduce((acc: string[], task) => {
        return [...acc, ...(task.tags || [])]
      }, [])
      const uniqueTags = [...new Set(allTags)]
      setTags(uniqueTags)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const handleAddTask = async (task: Omit<TaskType, 'id' | 'created_at'>) => {
    try {
      console.log('Adding task:', task)
      const newTask = {
        ...task,
        created_at: new Date().toISOString()
      }
      const { data, error } = await supabase
        .from('todos')
        .insert([newTask])
        .select()

      if (error) throw error

      console.log('Task added:', data)
      setTasks([data[0], ...tasks])
      toast.success('Task added successfully!')
    } catch (error) {
      console.error('Error adding task:', error)
      toast.error('Failed to add task')
    }
  }

  const handleUpdateTask = async (updatedTask: TaskType) => {
    try {
      console.log('Updating task:', updatedTask)
      const { error } = await supabase
        .from('todos')
        .update(updatedTask)
        .eq('id', updatedTask.id)

      if (error) throw error

      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task))
      toast.success('Task updated successfully!')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      console.log('Deleting task:', id)
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTasks(tasks.filter(task => task.id !== id))
      toast.success('Task deleted successfully!')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rebel-red"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filters.tag}
          onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
          className="bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
        >
          <option value="">All Tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <TaskForm onSubmit={handleAddTask} />

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-dark-400">No tasks found. Add one to get started!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <Task
              key={task.id}
              task={task}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
            />
          ))
        )}
      </div>
    </div>
  )
} 