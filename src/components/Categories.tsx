import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

interface Category {
  id: string
  name: string
  color: string
  task_count: number
}

export const Categories = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState({ name: '', color: '#FF4444' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...')
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('category')

      if (tasksError) throw tasksError

      // Get unique categories and count
      const categoryCount = tasks.reduce((acc: Record<string, number>, task) => {
        if (task.category) {
          acc[task.category] = (acc[task.category] || 0) + 1
        }
        return acc
      }, {})

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')

      if (categoriesError) throw categoriesError

      const categoriesWithCount = categoriesData.map((cat) => ({
        ...cat,
        task_count: categoryCount[cat.name] || 0
      }))

      console.log('Categories fetched:', categoriesWithCount)
      setCategories(categoriesWithCount)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
      setLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      console.log('Adding new category:', newCategory)
      const { error } = await supabase
        .from('categories')
        .insert([{
          ...newCategory,
          user_id: user?.id
        }])

      if (error) throw error

      toast.success('Category added successfully!')
      setNewCategory({ name: '', color: '#FF4444' })
      fetchCategories()
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error('Failed to add category')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      console.log('Deleting category:', id)
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Category deleted successfully!')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-pulse text-dark-400">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-dark-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            placeholder="Category name"
            className="flex-1 bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rebel-red"
          />
          <input
            type="color"
            value={newCategory.color}
            onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <button
            type="submit"
            className="bg-rebel-red hover:bg-rebel-red-light text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-dark-800 rounded-lg p-6 flex items-center justify-between"
            style={{ borderLeft: `4px solid ${category.color}` }}
          >
            <div>
              <h3 className="text-lg font-semibold text-white">{category.name}</h3>
              <p className="text-dark-400">{category.task_count} tasks</p>
            </div>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="text-dark-400 hover:text-red-400 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center text-dark-400 mt-8">
          No categories yet. Add your first category above!
        </div>
      )}
    </div>
  )
} 