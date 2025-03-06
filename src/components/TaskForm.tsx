import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  color: string
}

interface TaskFormProps {
  onSubmit: (task: {
    title: string;
    description: string;
    due_date?: string;
    priority: 'low' | 'medium' | 'high';
    tags: string[];
    is_recurring: boolean;
    recurrence_pattern?: string;
    categories?: string[];
    user_id: string;
  }) => void;
  initialData?: {
    title?: string;
    description?: string;
    due_date?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    is_recurring?: boolean;
    recurrence_pattern?: string;
    categories?: Category[];
  };
  isEditing?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialData, isEditing = false }) => {
  const { user } = useAuth()
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')
  const [priority, setPriority] = useState(initialData?.priority || 'medium')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [isRecurring, setIsRecurring] = useState(initialData?.is_recurring || false)
  const [recurrencePattern, setRecurrencePattern] = useState(initialData?.recurrence_pattern || '')
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categories?.map((c: Category) => c.id) || [])
  const [categoryInput, setCategoryInput] = useState('')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (categoryInput) {
      const filtered = categories.filter(cat => 
        cat.name.toLowerCase().includes(categoryInput.toLowerCase()) &&
        !selectedCategories.includes(cat.id)
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories([])
    }
  }, [categoryInput, categories, selectedCategories])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user?.id)

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      toast.error('User not authenticated')
      return
    }
    
    const taskData = {
      title,
      description,
      due_date: dueDate,
      priority,
      tags,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern || undefined : undefined,
      categories: selectedCategories,
      user_id: user.id
    }
    onSubmit(taskData)
    if (!isEditing) {
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
      setTags([])
      setIsRecurring(false)
      setRecurrencePattern('')
      setSelectedCategories([])
      setCategoryInput('')
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategories(prev => [...prev, categoryId])
    setCategoryInput('')
  }

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories(prev => prev.filter(id => id !== categoryId))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark-400 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
          placeholder="Task title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-400 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
          rows={3}
          placeholder="Task description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-400 mb-1">
          Due Date
        </label>
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-400 mb-1">
          Priority
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-400 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tags.join(', ')}
          onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
          className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
          placeholder="Enter tags separated by commas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-400 mb-1">
          Categories
        </label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCategories.map(catId => {
              const category = categories.find(c => c.id === catId)
              return category ? (
                <span
                  key={category.id}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                  style={{ backgroundColor: category.color + '40' }}
                >
                  {category.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(category.id)}
                    className="text-dark-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ) : null
            })}
          </div>
          <div className="relative">
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
              placeholder="Type to search categories"
            />
            {filteredCategories.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-dark-800 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredCategories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category.id)}
                    className="w-full text-left px-4 py-2 hover:bg-dark-700 text-white"
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="bg-dark-700 text-rebel-red rounded focus:ring-rebel-red"
          />
          <span className="text-sm font-medium text-dark-400">Recurring Task</span>
        </label>
      </div>

      {isRecurring && (
        <div>
          <label className="block text-sm font-medium text-dark-400 mb-1">
            Recurrence Pattern
          </label>
          <select
            value={recurrencePattern}
            onChange={(e) => setRecurrencePattern(e.target.value)}
            className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
          >
            <option value="">Select a pattern</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-rebel-red hover:bg-rebel-red-light text-white px-6 py-2 rounded-lg transition-colors"
        >
          {isEditing ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}

export default TaskForm 