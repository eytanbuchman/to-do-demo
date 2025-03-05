import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Task from './Task'
import TaskForm from './TaskForm'
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

interface Filters {
  status: string
  priority: string
  category: string
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    status: '',
    priority: '',
    category: ''
  })
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks...')
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('Fetched tasks:', data)
      setTasks(data || [])
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set((data || []).map((task: Task) => task.category)))
      console.log('Unique categories:', uniqueCategories)
      setCategories(uniqueCategories.filter(Boolean))
      
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

      setTasks(tasks.filter(task => task.id !== id))
      toast.success('Task deleted successfully!')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task))
  }

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    console.log('Updating filter:', filterType, value)
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const filteredTasks = tasks.filter(task => {
    const statusMatch = !filters.status || task.status === filters.status
    const priorityMatch = !filters.priority || task.priority === filters.priority
    const categoryMatch = !filters.category || task.category === filters.category
    return statusMatch && priorityMatch && categoryMatch
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <TaskForm onTaskAdded={fetchTasks} />
      </div>

      <div className="mb-8 p-4 bg-dark-800 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Filter Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="bg-dark-700 text-white p-2 rounded"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="bg-dark-700 text-white p-2 rounded"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="bg-dark-700 text-white p-2 rounded"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-gray-400 text-center">No tasks found. Try adjusting your filters or add a new task!</div>
        ) : (
          filteredTasks.map(task => (
            <Task
              key={task.id}
              task={task}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default TaskList 