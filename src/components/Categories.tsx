import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Task from './Task'
import toast from 'react-hot-toast'

interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  due_date?: string
}

const Categories = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<{ [key: string]: Task[] }>({})

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks for categories...')
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('category')

      if (error) throw error

      console.log('Fetched tasks:', data)
      setTasks(data || [])
      
      // Group tasks by category
      const groupedTasks = (data || []).reduce((acc: { [key: string]: Task[] }, task: Task) => {
        const category = task.category || 'Uncategorized'
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(task)
        return acc
      }, {})

      console.log('Grouped tasks:', groupedTasks)
      setCategories(groupedTasks)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchTasks()
      toast.success('Task deleted successfully!')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleUpdate = async (updatedTask: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', updatedTask.id)

      if (error) throw error

      fetchTasks()
      toast.success('Task updated successfully!')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Task Categories</h1>
      {Object.entries(categories).length === 0 ? (
        <div className="text-gray-400 text-center">No tasks found. Start by adding a task with a category!</div>
      ) : (
        Object.entries(categories).map(([category, categoryTasks]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-rebel-red mb-4">{category}</h2>
            <div className="space-y-4">
              {categoryTasks.map(task => (
                <Task
                  key={task.id}
                  task={task}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Categories 