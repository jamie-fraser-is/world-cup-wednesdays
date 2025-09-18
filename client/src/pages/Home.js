import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { TrophyIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const [currentCompetition, setCurrentCompetition] = useState(null);
  const [recentCompetitions, setRecentCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [currentResponse, recentResponse] = await Promise.all([
        axios.get('/api/competitions/current'),
        axios.get('/api/competitions?limit=5')
      ]);

      setCurrentCompetition(currentResponse.data.competition);
      setRecentCompetitions(recentResponse.data.competitions);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <TrophyIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          World Cup Wednesdays
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Fortnightly competitions to settle the great debates
        </p>
        <Link
          to="/register"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Join the Competition
        </Link>
      </div>

      {/* Current Competition */}
      {currentCompetition && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Current Competition</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentCompetition.status === 'accepting_entries' 
                ? 'bg-green-100 text-green-800'
                : currentCompetition.status === 'voting'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {currentCompetition.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {currentCompetition.title}
              </h3>
              <p className="text-gray-600 mb-4">{currentCompetition.topic}</p>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <UsersIcon className="h-4 w-4 mr-1" />
                <span>Host: {currentCompetition.host_name}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>
                  {currentCompetition.entry_deadline && 
                    `Entries close: ${new Date(currentCompetition.entry_deadline).toLocaleDateString()}`
                  }
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {currentCompetition.entry_count}
                </div>
                <div className="text-gray-600">Entries</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Link
              to={`/competition/${currentCompetition.id}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              View Competition
            </Link>
          </div>
        </div>
      )}

      {/* Recent Competitions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Competitions</h2>
        
        {recentCompetitions.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No competitions yet. Be the first to start one!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCompetitions.map((competition) => (
              <div key={competition.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 truncate">{competition.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    competition.status === 'completed' 
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {competition.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{competition.topic}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Host: {competition.host_name}</span>
                  <span>{competition.entry_count} entries</span>
                </div>
                {competition.winner_name && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    Winner: {competition.winner_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;