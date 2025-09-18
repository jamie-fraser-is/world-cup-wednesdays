import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  UsersIcon, 
  TrophyIcon, 
  PlusIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [newCompetition, setNewCompetition] = useState({
    title: '',
    topic: '',
    hostId: '',
    entryDeadline: ''
  });

  useEffect(() => {
    if (user?.is_admin) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersResponse, competitionsResponse] = await Promise.all([
        axios.get('/api/users/leaderboard'),
        axios.get('/api/competitions')
      ]);
      
      setUsers(usersResponse.data.leaderboard);
      setCompetitions(competitionsResponse.data.competitions);
    } catch (error) {
      console.error('Fetch admin data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompetition = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/competitions', newCompetition);
      setNewCompetition({ title: '', topic: '', hostId: '', entryDeadline: '' });
      fetchData();
      alert('Competition created successfully!');
    } catch (error) {
      console.error('Create competition error:', error);
      alert('Failed to create competition');
    }
  };

  const selectRandomHost = async () => {
    try {
      const response = await axios.post('/api/competitions/select-host');
      setNewCompetition(prev => ({
        ...prev,
        hostId: response.data.selectedHost.id
      }));
    } catch (error) {
      console.error('Select host error:', error);
      alert('Failed to select random host');
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
        <p className="text-gray-600">Manage users, competitions, and system settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UsersIcon className="h-5 w-5 inline mr-2" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('competitions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'competitions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrophyIcon className="h-5 w-5 inline mr-2" />
            Competition Management
          </button>
        </nav>
      </div>

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Registered Users</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <UsersIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.display_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.total_wins} wins / {user.total_competitions} competitions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                      {user.is_admin && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Competition Management Tab */}
      {activeTab === 'competitions' && (
        <div className="space-y-8">
          {/* Create New Competition */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Competition</h2>
            
            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Competition Title
                  </label>
                  <input
                    type="text"
                    value={newCompetition.title}
                    onChange={(e) => setNewCompetition({...newCompetition, title: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Best Pizza Topping"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entry Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={newCompetition.entryDeadline}
                    onChange={(e) => setNewCompetition({...newCompetition, entryDeadline: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic Description
                </label>
                <textarea
                  value={newCompetition.topic}
                  onChange={(e) => setNewCompetition({...newCompetition, topic: e.target.value})}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what participants should submit..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Host Selection
                </label>
                <div className="flex space-x-2">
                  <select
                    value={newCompetition.hostId}
                    onChange={(e) => setNewCompetition({...newCompetition, hostId: e.target.value})}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a host...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.display_name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={selectRandomHost}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Random
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Competition
              </button>
            </form>
          </div>

          {/* Existing Competitions */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">All Competitions</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {competitions.map((competition) => (
                <div key={competition.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {competition.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{competition.topic}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Host: {competition.host_name}</span>
                        <span>Entries: {competition.entry_count}</span>
                        <span>Created: {new Date(competition.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        competition.status === 'accepting_entries' 
                          ? 'bg-green-100 text-green-800'
                          : competition.status === 'voting'
                          ? 'bg-blue-100 text-blue-800'
                          : competition.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {competition.status.replace('_', ' ').toUpperCase()}
                      </span>
                      
                      <button className="text-blue-600 hover:text-blue-900">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;