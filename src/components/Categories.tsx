import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface Category {
  id: string
  name: string
  color: string
  user_id: string
  task_count: {
    total: number
    incomplete: number
  }
}

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState({ name: '', color: '#ff4444' })
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      console.log('Fetching categories...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // First get the categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)

      if (categoriesError) throw categoriesError

      // Then get the task counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          // Get total tasks
          const { count: totalCount } = await supabase
            .from('task_categories')
            .select('*', { count: 'exact' })
            .eq('category_id', category.id)

          // Get incomplete tasks
          const { count: incompleteCount } = await supabase
            .from('task_categories')
            .select('task_categories.*, todos!inner(completed)', { count: 'exact' })
            .eq('category_id', category.id)
            .eq('todos.completed', false)

          return {
            ...category,
            task_count: {
              total: totalCount || 0,
              incomplete: incompleteCount || 0
            }
          }
        })
      )

      console.log('Categories with counts:', categoriesWithCounts)
      setCategories(categoriesWithCounts)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      console.log('Adding new category:', newCategory)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name: newCategory.name,
            color: newCategory.color,
            user_id: user.id
          }
        ])
        .select()

      if (error) throw error

      console.log('Category added successfully:', data)
      setCategories([...categories, { ...data[0], task_count: { total: 0, incomplete: 0 } }])
      setNewCategory({ name: '', color: '#ff4444' })
      toast.success('Category added successfully')
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error('Failed to add category')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      setLoading(true)
      console.log('Deleting category:', id)

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCategories(categories.filter(category => category.id !== id))
      console.log('Category deleted successfully')
      toast.success('Category deleted successfully')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    navigate('/tasks', { state: { selectedCategory: categoryId } })
  }

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rebel-red"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Categories</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="bg-dark-800/50 backdrop-blur-sm rounded-lg p-6 border border-dark-700 
                       hover:border-rebel-red/50 transition-all duration-300 cursor-pointer
                       hover:transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteCategory(category.id)
                  }}
                  className="text-dark-400 hover:text-rebel-red transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="text-sm text-gray-400">
                <p>{category.task_count.incomplete} incomplete / {category.task_count.total} total tasks</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddCategory} className="bg-dark-800/30 rounded-lg p-6 border border-dark-700">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Category</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-rebel-red focus:border-transparent"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                className="w-full h-10 px-1 bg-dark-800 border border-dark-700 rounded-lg 
                         focus:ring-2 focus:ring-rebel-red focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-rebel-red text-white rounded-lg 
                       hover:bg-rebel-red-light focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-rebel-red disabled:opacity-50 
                       transition-colors duration-200"
            >
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 