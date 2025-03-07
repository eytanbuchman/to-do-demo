import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { BeakerIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

interface TaskStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_rate: number
  overdue_tasks: number
}

interface CategoryStats {
  category_name: string
  task_count: number
  completed_count: number
}

interface ActivityStats {
  activity_date: string
  tasks_created: number
  tasks_completed: number
}

export const Analytics = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [activityStats, setActivityStats] = useState<ActivityStats[]>([])

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching analytics for user:', user?.id)

      // Fetch basic task stats directly from todos table
      const { data: todos, error: todosError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user?.id)

      if (todosError) throw todosError

      // Calculate task stats
      const total = todos.length
      const completed = todos.filter(t => t.completed).length
      const overdue = todos.filter(t => {
        if (!t.completed && t.due_date) {
          return new Date(t.due_date) < new Date()
        }
        return false
      }).length

      const taskStatsData = {
        total_tasks: total,
        completed_tasks: completed,
        pending_tasks: total - completed,
        completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        overdue_tasks: overdue
      }
      setTaskStats(taskStatsData)

      // Fetch category stats
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*, task_categories!inner(task_id)')
        .eq('user_id', user?.id)

      if (categoriesError) throw categoriesError

      const categoryStatsData = await Promise.all(
        categories.map(async (category) => {
          const { data: taskCount } = await supabase
            .from('task_categories')
            .select('todos!inner(*)', { count: 'exact' })
            .eq('category_id', category.id)

          const { data: completedCount } = await supabase
            .from('task_categories')
            .select('todos!inner(*)', { count: 'exact' })
            .eq('category_id', category.id)
            .eq('todos.completed', true)

          return {
            category_name: category.name,
            task_count: taskCount?.length || 0,
            completed_count: completedCount?.length || 0
          }
        })
      )
      setCategoryStats(categoryStatsData)

      // Calculate activity stats for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date.toISOString().split('T')[0]
      })

      const activityStatsData = await Promise.all(
        last7Days.map(async (date) => {
          const nextDate = new Date(date)
          nextDate.setDate(nextDate.getDate() + 1)

          const { data: created } = await supabase
            .from('todos')
            .select('*', { count: 'exact' })
            .eq('user_id', user?.id)
            .gte('created_at', date)
            .lt('created_at', nextDate.toISOString())

          const { data: completed } = await supabase
            .from('todos')
            .select('*', { count: 'exact' })
            .eq('user_id', user?.id)
            .eq('completed', true)
            .gte('created_at', date)
            .lt('created_at', nextDate.toISOString())

          return {
            activity_date: date,
            tasks_created: created?.length || 0,
            tasks_completed: completed?.length || 0
          }
        })
      )
      setActivityStats(activityStatsData)

    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load analytics')
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-rebel-red">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-rebel-red text-white rounded-lg hover:bg-rebel-red-light transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton loading states */}
        <div className="bg-dark-800 rounded-lg p-6 animate-pulse">
          <div className="h-6 w-32 bg-dark-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-dark-700 rounded-lg p-4">
                <div className="h-4 w-20 bg-dark-600 rounded mb-2"></div>
                <div className="h-6 w-16 bg-dark-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-800 rounded-lg p-6 animate-pulse">
          <div className="h-6 w-40 bg-dark-700 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-dark-700 rounded-lg p-4">
                <div className="h-4 w-full bg-dark-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!taskStats || taskStats.total_tasks === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-rebel-red/20 rounded-full animate-pulse"></div>
            <div className="relative bg-dark-800 rounded-full p-4">
              <BeakerIcon className="w-16 h-16 text-rebel-red" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Data to Analyze Yet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Your rebellion is just beginning! Create some missions and complete them to unlock powerful insights.
          </p>
          <Link
            to="/tasks"
            className="inline-flex items-center px-6 py-3 bg-rebel-red text-white font-semibold rounded-lg 
                     hover:bg-rebel-red-light shadow-lg hover:shadow-rebel-red/20 
                     transition-all duration-300 hover:transform hover:-translate-y-1"
          >
            <ArrowRightIcon className="w-5 h-5 mr-2" />
            Start Creating Missions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Task Overview */}
      <div className="bg-dark-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Task Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-700 rounded-lg p-4">
            <h3 className="text-dark-400 text-sm font-medium">Completion Rate</h3>
            <p className="text-2xl font-bold text-white">{taskStats?.completion_rate}%</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-4">
            <h3 className="text-dark-400 text-sm font-medium">Total Tasks</h3>
            <p className="text-2xl font-bold text-white">{taskStats?.total_tasks}</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-4">
            <h3 className="text-dark-400 text-sm font-medium">Overdue Tasks</h3>
            <p className="text-2xl font-bold text-white">{taskStats?.overdue_tasks}</p>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-dark-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Category Performance</h2>
        <div className="space-y-4">
          {categoryStats.map((category) => (
            <div key={category.category_name} className="bg-dark-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-medium">{category.category_name}</h3>
                <span className="text-dark-400 text-sm">
                  {category.completed_count} / {category.task_count} completed
                </span>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-2">
                <div
                  className="bg-rebel-red h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(category.completed_count / (category.task_count || 1)) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-dark-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activityStats.map((activity) => (
            <div key={activity.activity_date} className="bg-dark-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-white font-medium">
                    {new Date(activity.activity_date).toLocaleDateString()}
                  </h3>
                  <p className="text-dark-400 text-sm">
                    Created: {activity.tasks_created} | Completed: {activity.tasks_completed}
                  </p>
                </div>
                <div className="text-rebel-red">
                  {activity.tasks_completed > activity.tasks_created ? '↑' : '↓'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics 