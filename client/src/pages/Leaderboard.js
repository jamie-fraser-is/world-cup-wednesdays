import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrophyIcon, UserIcon } from '@heroicons/react/24/outline';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/users/leaderboard');
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Fetch leaderboard error:', error);
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <TrophyIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">Top performers in World Cup Wednesdays</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">No competition data available yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Rankings</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {leaderboard.map((user, index) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.display_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.display_name}</h3>
                        <p className="text-sm text-gray-600">
                          {user.total_competitions} competitions • {user.times_hosted} times hosted
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{user.total_wins}</div>
                        <div className="text-xs text-gray-600">Wins</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-800">
                          {user.win_rate}%
                        </div>
                        <div className="text-xs text-gray-600">Win Rate</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-medium text-gray-600">
                          {user.total_votes_cast}
                        </div>
                        <div className="text-xs text-gray-600">Votes Cast</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;