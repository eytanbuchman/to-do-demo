import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  tasksByCategory: Record<string, number>;
  tasksByPriority: Record<string, number>;
  tasksByStatus: Record<string, number>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, description }) => (
  <div className="bg-dark-800 rounded-lg p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-dark-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
        {description && (
          <p className="text-dark-400 text-sm mt-1">{description}</p>
        )}
      </div>
      <div className="text-rebel-red">{icon}</div>
    </div>
  </div>
);

const BarChart: React.FC<{ data: Record<string, number>, title: string }> = ({ data, title }) => {
  const maxValue = Math.max(...Object.values(data));
  
  return (
    <div className="bg-dark-800 rounded-lg p-6">
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-dark-400">{key}</span>
              <span className="text-dark-400">{value}</span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-rebel-red rounded-full transition-all duration-500"
                style={{ width: `${(value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Analytics: React.FC = () => {
  const [metrics, setMetrics] = useState<TaskMetrics>({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    tasksByCategory: {},
    tasksByPriority: {},
    tasksByStatus: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      console.log('Fetching analytics data...');
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*');

      if (error) throw error;

      // Calculate metrics
      const completedTasks = tasks.filter(task => task.status === 'done');
      const totalTasks = tasks.length;
      const completionRate = totalTasks ? (completedTasks.length / totalTasks) * 100 : 0;

      // Calculate average completion time (in days) for completed tasks
      const completionTimes = completedTasks
        .filter(task => task.completed_at && task.created_at)
        .map(task => {
          const created = new Date(task.created_at);
          const completed = new Date(task.completed_at);
          return (completed.getTime() - created.getTime()) / (1000 * 3600 * 24); // Convert to days
        });

      const averageCompletionTime = completionTimes.length
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

      // Group tasks by category
      const tasksByCategory = tasks.reduce((acc: Record<string, number>, task) => {
        const category = task.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // Group tasks by priority
      const tasksByPriority = tasks.reduce((acc: Record<string, number>, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {});

      // Group tasks by status
      const tasksByStatus = tasks.reduce((acc: Record<string, number>, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});

      setMetrics({
        totalTasks,
        completedTasks: completedTasks.length,
        completionRate,
        averageCompletionTime,
        tasksByCategory,
        tasksByPriority,
        tasksByStatus,
      });
      setLoading(false);
      console.log('Analytics data loaded:', metrics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-pulse text-dark-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Mission Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Missions"
          value={metrics.totalTasks}
          icon={<ChartBarIcon className="w-6 h-6" />}
        />
        <MetricCard
          title="Completed Missions"
          value={metrics.completedTasks}
          icon={<CheckCircleIcon className="w-6 h-6" />}
        />
        <MetricCard
          title="Completion Rate"
          value={`${metrics.completionRate.toFixed(1)}%`}
          icon={<TagIcon className="w-6 h-6" />}
        />
        <MetricCard
          title="Avg. Completion Time"
          value={`${metrics.averageCompletionTime.toFixed(1)} days`}
          icon={<ClockIcon className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BarChart data={metrics.tasksByCategory} title="Tasks by Category" />
        <BarChart data={metrics.tasksByPriority} title="Tasks by Priority" />
        <BarChart data={metrics.tasksByStatus} title="Tasks by Status" />
      </div>
    </div>
  );
}; 