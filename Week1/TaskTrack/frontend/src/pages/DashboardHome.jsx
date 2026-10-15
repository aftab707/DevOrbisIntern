import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { label: 'Pending',     badge: 'bg-gray-100 text-gray-600 border-gray-200',   dot: 'bg-gray-400'   },
  'in-progress':{ label: 'In Progress', badge: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500'   },
  completed:   { label: 'Completed',   badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

const PRIORITY_CONFIG = {
  high:   { label: 'High',   dot: 'bg-red-500',   badge: 'bg-red-50 text-red-700 border-red-200'         },
  medium: { label: 'Medium', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200'   },
  low:    { label: 'Low',    dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Dashboard HOME page ───────────────────────────────────────────────────────
const DashboardHome = () => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = { headers: { Authorization: `Bearer ${user?.token}` } };

  useEffect(() => {
    if (user?.token) {
      setLoading(true);
      axios.get('http://localhost:5000/api/tasks', config)
        .then(res => setTasks(res.data))
        .catch(err => { if (err.response?.status === 401) logout(); })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line
  }, [user]);

  const total      = tasks.length;
  const pending    = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const completed  = tasks.filter(t => t.status === 'completed').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Recent 5 tasks
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Overdue tasks (has dueDate, not completed, date < today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter(t => t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < today);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Here's your productivity overview for today.</p>
        </div>
        <Link
          to="/tasks"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View All Tasks
        </Link>
      </header>

      <main className="flex-1 p-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Tasks"  value={total}      color="gray"   subtitle="All tasks"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <StatCard title="Pending"     value={pending}    color="gray"   subtitle="Not started"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard title="In Progress" value={inProgress} color="indigo" subtitle="Active tasks"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
          <StatCard title="Completed"   value={completed}  color="green"  subtitle={`${completionRate}% done`}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* Progress Bar + Overdue Warning */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Progress */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Overall Progress</p>
                <p className="text-xs text-gray-400 mt-0.5">{completed} of {total} tasks completed</p>
              </div>
              <span className="text-3xl font-bold text-indigo-600">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            {/* Mini breakdown */}
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />{pending} Pending</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />{inProgress} In Progress</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{completed} Done</span>
            </div>
          </div>

          {/* Overdue alert */}
          <div className={`bg-white rounded-2xl border shadow-sm p-6 flex flex-col justify-center ${overdue.length > 0 ? 'border-red-100' : 'border-gray-100'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${overdue.length > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
              {overdue.length > 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className={`text-lg font-bold ${overdue.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {overdue.length > 0 ? `${overdue.length} Overdue` : 'All on track!'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {overdue.length > 0 ? 'Tasks past their due date' : 'No overdue tasks right now'}
            </p>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Recent Activity</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 5 tasks added</p>
            </div>
            <Link to="/tasks" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">No tasks yet</p>
              <Link to="/tasks" className="mt-3 text-sm text-indigo-600 font-medium hover:text-indigo-700">Create your first task →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentTasks.map(task => (
                <div key={task._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.status === 'completed' ? 'bg-emerald-500' :
                      task.status === 'in-progress' ? 'bg-indigo-500' : 'bg-gray-300'
                    }`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <PriorityBadge priority={task.priority || 'medium'} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardHome;
