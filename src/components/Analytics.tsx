import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

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
      console.log('Fetching analytics for user:', user?.id)

      // Fetch task completion stats
      const { data: taskData, error: taskError } = await supabase
        .from('task_completion_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (taskError) throw taskError
      console.log('Task stats:', taskData)
      setTaskStats(taskData)

      // Fetch category usage stats
      const { data: categoryData, error: categoryError } = await supabase
        .from('category_usage_stats')
        .select('*')
        .eq('user_id', user?.id)

      if (categoryError) throw categoryError
      console.log('Category stats:', categoryData)
      setCategoryStats(categoryData)

      // Fetch activity stats
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity_stats')
        .select('*')
        .eq('user_id', user?.id)
        .order('activity_date', { ascending: false })
        .limit(7)

      if (activityError) throw activityError
      console.log('Activity stats:', activityData)
      setActivityStats(activityData)

    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rebel-red"></div>
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
                  className="bg-rebel-red h-2 rounded-full"
                  style={{
                    width: `${(category.completed_count / category.task_count) * 100}%`
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