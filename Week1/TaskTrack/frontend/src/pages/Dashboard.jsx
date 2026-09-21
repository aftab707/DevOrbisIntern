import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext); 
  
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // States for Editing a task
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };

  useEffect(() => {
    if (user?.token) {
      fetchTasks();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks', config);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks", error);
      if (error.response && error.response.status === 401) {
        logout();
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title) return;
    setIsAdding(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/tasks',
        { title, description },
        config
      );
      setTasks([response.data, ...tasks]);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error("Error creating task", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, config);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'in-progress' : currentStatus === 'in-progress' ? 'completed' : 'pending';
    
    try {
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        { status: newStatus },
        config
      );
      setTasks(tasks.map((task) => (task._id === id ? response.data : task)));
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        { title: editTitle, description: editDescription },
        config
      );
      setTasks(tasks.map((task) => (task._id === id ? response.data : task)));
      setEditingTaskId(null);
    } catch (error) {
      console.error("Error saving edited task", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">Completed</span>;
      case 'in-progress':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">In Progress</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">Pending</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8 flex justify-between items-end border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage your tasks effectively.</p>
        </div>
      </div>
      
      {/* --- CREATE TASK FORM --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden transition-shadow hover:shadow-md">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a New Task
          </h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleCreateTask} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full md:w-1/3">
              <input 
                type="text" 
                placeholder="Task Title (Required)" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="w-full md:w-2/3">
              <input 
                type="text" 
                placeholder="Short Description (Optional)" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={isAdding || !title.trim()}
              className={`w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap ${(!title.trim() || isAdding) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isAdding ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </div>
      </div>

      {/* --- TASK LIST --- */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Your Current Tasks <span className="text-sm font-normal text-gray-500 ml-2">({tasks.length})</span></h3>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new task above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              
              {editingTaskId === task._id ? (
                <div className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Task title"
                  />
                  <textarea 
                    value={editDescription} 
                    onChange={(e) => setEditDescription(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] resize-y"
                    placeholder="Task description"
                  />
                  <div className="flex gap-2 justify-end mt-2">
                    <button onClick={() => setEditingTaskId(null)} className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors">
                      Cancel
                    </button>
                    <button onClick={() => handleSaveEdit(task._id)} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-1 gap-3">
                      <h4 className={`text-lg font-semibold ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {task.title}
                      </h4>
                      {getStatusBadge(task.status)}
                    </div>
                    {task.description && (
                      <p className={`text-sm ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 mt-2 md:mt-0">
                    <button 
                      onClick={() => handleUpdateStatus(task._id, task.status)}
                      title="Toggle Status"
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => startEditing(task)}
                      title="Edit Task"
                      className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors border border-transparent hover:border-yellow-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task._id)}
                      title="Delete Task"
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
