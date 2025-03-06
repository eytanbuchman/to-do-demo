import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { useLocation } from 'react-router-dom'

interface Category {
  id: string
  name: string
  color: string
}

interface TaskType {
  id: string
  title: string
  description: string
  completed: boolean
  due_date?: string
  priority: string
  tags: string[]
  is_recurring: boolean
  recurrence_pattern?: string
  subtasks: any[]
  categories?: string[]
  created_at: string
}

export const TaskList = () => {
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    fetchCategories()
    fetchTasks()
    
    // Check if we were navigated here with a selected category
    const locationState = location.state as { selectedCategory?: string }
    if (locationState?.selectedCategory) {
      setSelectedCategory(locationState.selectedCategory)
    }
  }, [location])

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      console.log('Categories fetched:', data)
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      console.log('Fetching tasks...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      let query = supabase
        .from('todos')
        .select(`
          *,
          task_categories!inner (
            category_id
          )
        `)
        .eq('user_id', user.id)

      if (selectedCategory) {
        query = query
          .eq('task_categories.category_id', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data to include category IDs
      const tasksWithCategories = data.map(task => ({
        ...task,
        categories: task.task_categories.map((tc: any) => tc.category_id)
      }))

      console.log('Tasks fetched:', tasksWithCategories)
      setTasks(tasksWithCategories)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (task: Partial<TaskType>) => {
    try {
      setLoading(true)
      console.log('Adding task:', task)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { categories, ...taskData } = task
      const newTask = {
        ...taskData,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      // Insert the task
      const { data, error } = await supabase
        .from('todos')
        .insert([newTask])
        .select()

      if (error) throw error
      console.log('Task added:', data)

      // If there are categories, create the relationships
      if (categories && categories.length > 0 && data) {
        const categoryRelations = categories.map(categoryId => ({
          task_id: data[0].id,
          category_id: categoryId
        }))

        const { error: relationError } = await supabase
          .from('task_categories')
          .insert(categoryRelations)

        if (relationError) throw relationError
      }

      // Add the new task to the state
      const taskWithCategories = {
        ...data[0],
        categories: categories || []
      }
      setTasks([...tasks, taskWithCategories])
      
      toast.success('Task added successfully')
    } catch (error) {
      console.error('Error adding task:', error)
      toast.error('Failed to add task')
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicateTask = (task: TaskType) => {
    // Open TaskForm with pre-filled data
    const duplicatedTask = {
      ...task,
      title: `Copy of ${task.title}`,
      completed: false,
      created_at: new Date().toISOString()
    }
    // Emit an event that TaskForm can listen to
    const event = new CustomEvent('duplicate-task', { detail: duplicatedTask })
    window.dispatchEvent(event)
  }

  const handleUpdateTask = async (id: string, updates: Partial<TaskType>) => {
    try {
      setLoading(true)
      console.log('Updating task:', id, updates)

      const { error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setTasks(tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ))

      console.log('Task updated successfully')
      toast.success('Task updated successfully')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      setLoading(true)
      console.log('Deleting task:', id)

      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTasks(tasks.filter(task => task.id !== id))
      console.log('Task deleted successfully')
      toast.success('Task deleted successfully')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rebel-red"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                       focus:ring-2 focus:ring-rebel-red focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No tasks found. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div
                key={task.id}
                className="bg-dark-800/50 backdrop-blur-sm rounded-lg p-6 border border-dark-700 
                         hover:border-rebel-red/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
                    <p className="text-gray-400 mb-4">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {task.categories?.map(categoryId => {
                        const category = categories.find(c => c.id === categoryId)
                        return category ? (
                          <span
                            key={category.id}
                            className="px-2 py-1 rounded text-sm"
                            style={{ 
                              backgroundColor: `${category.color}33`,
                              color: category.color,
                              border: `1px solid ${category.color}66`
                            }}
                          >
                            {category.name}
                          </span>
                        ) : null
                      })}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Priority: {task.priority}</span>
                      {task.due_date && (
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDuplicateTask(task)}
                      className="text-dark-400 hover:text-rebel-red transition-colors"
                      title="Duplicate task"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-dark-400 hover:text-rebel-red transition-colors"
                      title="Delete task"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dark-700">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => handleUpdateTask(task.id, { completed: e.target.checked })}
                      className="form-checkbox h-4 w-4 text-rebel-red border-dark-700 rounded 
                               focus:ring-rebel-red focus:ring-offset-dark-900"
                    />
                    <span className="text-gray-300">Mark as completed</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 