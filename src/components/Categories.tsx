import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  color: string
  created_at: string
}

export const Categories = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState({ name: '', color: '#666666' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      console.log('Fetching categories for user:', user?.id)
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error

      console.log('Fetched categories:', data)
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
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
      console.log('Adding category:', newCategory)
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name: newCategory.name.trim(),
            color: newCategory.color,
            user_id: user?.id
          }
        ])
        .select()

      if (error) throw error

      console.log('Category added:', data)
      setCategories([...categories, data[0]])
      setNewCategory({ name: '', color: '#666666' })
      toast.success('Category added successfully!')
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

      setCategories(categories.filter(cat => cat.id !== id))
      toast.success('Category deleted successfully!')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
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
    <div className="space-y-6 p-6">
      <div className="bg-dark-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Categories</h2>
        
        <form onSubmit={handleAddCategory} className="flex gap-4 mb-6">
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            placeholder="New category name"
            className="flex-1 bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
          />
          <input
            type="color"
            value={newCategory.color}
            onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
            className="w-12 h-10 rounded bg-dark-700 cursor-pointer"
          />
          <button
            type="submit"
            className="bg-rebel-red hover:bg-rebel-red-light text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add
          </button>
        </form>

        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-dark-400 text-center py-4">No categories yet. Add one to get started!</p>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between bg-dark-700 p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-white">{category.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-dark-400 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 