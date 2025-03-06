import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { useLocation } from 'react-router-dom'
import { TaskForm } from './TaskForm'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

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
  const [isAddTaskExpanded, setIsAddTaskExpanded] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskType | null>(null)
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

  const handleEditTask = (task: TaskType) => {
    setEditingTask(task)
    setIsAddTaskExpanded(true)
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
    setIsAddTaskExpanded(false)
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rebel-red to-rebel-red-light bg-clip-text text-transparent">
            Your Missions
          </h1>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-3 py-2 bg-dark-800/50 border border-dark-700/50 rounded-lg text-white 
                       focus:ring-2 focus:ring-rebel-red focus:border-transparent backdrop-blur-sm
                       transition-all duration-200"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            <button
              onClick={() => setIsAddTaskExpanded(!isAddTaskExpanded)}
              className="flex items-center space-x-2 px-4 py-2 bg-dark-800/50 text-rebel-red border border-rebel-red/20 
                       rounded-lg backdrop-blur-sm hover:bg-rebel-red hover:text-white 
                       transition-all duration-300 group"
            >
              {isAddTaskExpanded ? (
                <>
                  <XMarkIcon className="w-5 h-5" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  <span>New Mission</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isAddTaskExpanded && (
          <div className="mb-8 bg-dark-800/30 backdrop-blur-sm rounded-lg p-6 border border-dark-700/50
                         shadow-lg shadow-rebel-red/5">
            <TaskForm
              onSubmit={handleAddTask}
              onCancel={handleCancelEdit}
              initialData={editingTask}
              availableCategories={categories}
            />
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No missions found. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div
                key={task.id}
                className="group bg-dark-800/30 backdrop-blur-sm rounded-lg p-6 border border-dark-700/50
                         hover:border-rebel-red/20 transition-all duration-300
                         hover:shadow-lg hover:shadow-rebel-red/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => handleUpdateTask(task.id, { completed: e.target.checked })}
                        className="form-checkbox h-5 w-5 text-rebel-red border-dark-700/50 rounded 
                                 focus:ring-rebel-red focus:ring-offset-dark-900 transition-all duration-200"
                      />
                      <h3 className={`text-lg font-medium transition-all duration-200
                                  ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                        {task.title}
                      </h3>
                    </div>
                    
                    <div className="mt-2 ml-8">
                      <p className={`text-sm transition-all duration-200
                                 ${task.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                        {task.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {task.categories?.map(categoryId => {
                          const category = categories.find(c => c.id === categoryId)
                          return category ? (
                            <span
                              key={category.id}
                              className="px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200"
                              style={{ 
                                backgroundColor: `${category.color}15`,
                                color: task.completed ? `${category.color}88` : category.color,
                                border: `1px solid ${category.color}33`
                              }}
                            >
                              {category.name}
                            </span>
                          ) : null
                        })}

                        {task.due_date && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                        ${task.completed 
                                          ? 'bg-dark-700/30 text-gray-500' 
                                          : 'bg-rebel-red/10 text-rebel-red'}`}>
                            Due {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}

                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                      ${task.completed 
                                        ? 'bg-dark-700/30 text-gray-500' 
                                        : 'bg-dark-700/50 text-gray-400'}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-1 text-dark-400 hover:text-rebel-red transition-colors"
                      title="Edit mission"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDuplicateTask(task)}
                      className="p-1 text-dark-400 hover:text-rebel-red transition-colors"
                      title="Duplicate mission"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-dark-400 hover:text-rebel-red transition-colors"
                      title="Delete mission"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 