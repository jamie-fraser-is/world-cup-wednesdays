import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const Competition = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, joinCompetition } = useSocket();
  const [competition, setCompetition] = useState(null);
  const [entries, setEntries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [userEntry, setUserEntry] = useState(null);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [entryForm, setEntryForm] = useState({
    selection: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchCompetitionData();
    if (socket) {
      joinCompetition(id);
      
      socket.on('vote-update', handleVoteUpdate);
      socket.on('match-finalized', handleMatchFinalized);
      
      return () => {
        socket.off('vote-update');
        socket.off('match-finalized');
      };
    }
  }, [id, socket]);

  const fetchCompetitionData = async () => {
    try {
      const [competitionResponse, entryResponse, votesResponse] = await Promise.all([
        axios.get(`/api/competitions/${id}`),
        axios.get(`/api/entries/my-entry/${id}`),
        axios.get(`/api/voting/my-votes/${id}`)
      ]);

      setCompetition(competitionResponse.data.competition);
      setEntries(competitionResponse.data.entries);
      setMatches(competitionResponse.data.matches);
      setUserEntry(entryResponse.data.entry);
      setUserVotes(votesResponse.data.votes);
    } catch (error) {
      console.error('Fetch competition data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = (data) => {
    setMatches(prevMatches => 
      prevMatches.map(match => 
        match.id === data.matchId 
          ? { ...match, ...data }
          : match
      )
    );
  };

  const handleMatchFinalized = (data) => {
    setMatches(prevMatches => 
      prevMatches.map(match => 
        match.id === data.matchId 
          ? { ...match, winner_id: data.winnerId, is_tie: data.isTie, coin_flip_winner: data.coinFlipWinner, status: 'completed' }
          : match
      )
    );
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/entries', {
        competitionId: id,
        selection: entryForm.selection,
        imageUrl: entryForm.imageUrl
      });
      
      setUserEntry(response.data.entry);
      setEntryForm({ selection: '', imageUrl: '' });
      fetchCompetitionData(); // Refresh data
    } catch (error) {
      console.error('Submit entry error:', error);
      alert(error.response?.data?.message || 'Failed to submit entry');
    }
  };

  const handleVote = async (matchId, entryId) => {
    try {
      await axios.post('/api/voting/vote', { matchId, entryId });
      setUserVotes(prev => ({ ...prev, [matchId]: entryId }));
    } catch (error) {
      console.error('Vote error:', error);
      alert(error.response?.data?.message || 'Failed to cast vote');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Competition not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Competition Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{competition.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            competition.status === 'accepting_entries' 
              ? 'bg-green-100 text-green-800'
              : competition.status === 'voting'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {competition.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4">{competition.topic}</p>
        <div className="text-sm text-gray-500">
          Host: {competition.host_name} • {entries.length} entries
        </div>
      </div>

      {/* Entry Form */}
      {competition.status === 'accepting_entries' && !userEntry && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-8 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-600 rounded-full p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Submit Your Entry</h2>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Competition Topic:</h3>
            <p className="text-gray-600 italic">"{competition.topic}"</p>
          </div>
          
          <form onSubmit={handleEntrySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Selection *
              </label>
              <input
                type="text"
                value={entryForm.selection}
                onChange={(e) => setEntryForm({...entryForm, selection: e.target.value})}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What's your choice for this competition?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={entryForm.imageUrl}
                onChange={(e) => setEntryForm({...entryForm, imageUrl: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg (optional visual)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add an image to make your entry more appealing to voters!
              </p>
            </div>
            
            {entryForm.imageUrl && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview:</label>
                <img 
                  src={entryForm.imageUrl} 
                  alt="Preview" 
                  className="w-32 h-20 object-cover rounded-lg border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Deadline:</span> {new Date(competition.entry_deadline).toLocaleString()}
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                Submit Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User's Entry */}
      {userEntry && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-4">Your Entry</h2>
          <div className="flex items-center space-x-4">
            {userEntry.image_url && (
              <img 
                src={userEntry.image_url} 
                alt={userEntry.selection}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-green-700">{userEntry.selection}</h3>
              <p className="text-green-600">Good luck!</p>
            </div>
          </div>
        </div>
      )}

      {/* Entries List */}
      {entries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            All Entries ({entries.length})
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {entries.map((entry) => (
              <div key={entry.id} className="group bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                {entry.image_url && (
                  <div className="aspect-w-3 aspect-h-2 bg-gray-200">
                    <img 
                      src={entry.image_url} 
                      alt={entry.selection}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {entry.selection}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {entry.is_ai_generated ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          🤖 AI Generated
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          👤 {entry.user_name}
                        </span>
                      )}
                    </p>
                    {entry.bracket_position && (
                      <span className="text-xs text-gray-500 font-mono">
                        #{entry.bracket_position}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tournament Bracket */}
      {matches.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Tournament Bracket</h2>
          
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="flex space-x-8">
                {Array.from(new Set(matches.map(m => m.round_number))).sort().map(round => {
                  const roundMatches = matches.filter(m => m.round_number === round);
                  const roundName = round === 1 ? 'Round of 16' : 
                                   round === 2 ? 'Quarterfinals' :
                                   round === 3 ? 'Semifinals' : 'Final';
                  
                  return (
                    <div key={round} className="flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                        {roundName}
                      </h3>
                      
                      <div className="space-y-6">
                        {roundMatches.map((match) => (
                          <div key={match.id} className="w-64">
                            {match.entry1_id && match.entry2_id ? (
                              <div className="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
                                {/* Match Header */}
                                <div className="bg-gray-100 px-4 py-2 text-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    Match {match.match_number}
                                  </span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {match.total_votes} votes cast
                                  </div>
                                </div>
                                
                                {/* Entry 1 */}
                                <div 
                                  className={`p-4 cursor-pointer transition-all duration-200 ${
                                    userVotes[match.id] === match.entry1_id 
                                      ? 'bg-blue-100 border-l-4 border-blue-500' 
                                      : 'hover:bg-gray-100'
                                  } ${match.winner_id === match.entry1_id ? 'bg-green-100 border-l-4 border-green-500' : ''}`}
                                  onClick={() => competition.status === 'voting' && match.status === 'voting' && handleVote(match.id, match.entry1_id)}
                                >
                                  <div className="flex items-center space-x-3">
                                    {entries.find(e => e.id === match.entry1_id)?.image_url && (
                                      <img 
                                        src={entries.find(e => e.id === match.entry1_id)?.image_url}
                                        alt={match.entry1_selection}
                                        className="w-12 h-8 object-cover rounded"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">
                                        {match.entry1_selection}
                                      </div>
                                      {entries.find(e => e.id === match.entry1_id)?.is_ai_generated && (
                                        <div className="text-xs text-purple-600">AI Generated</div>
                                      )}
                                    </div>
                                    {userVotes[match.id] === match.entry1_id && (
                                      <div className="text-blue-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* VS Divider */}
                                <div className="bg-gray-200 py-1">
                                  <div className="text-center text-xs font-bold text-gray-600">VS</div>
                                </div>
                                
                                {/* Entry 2 */}
                                <div 
                                  className={`p-4 cursor-pointer transition-all duration-200 ${
                                    userVotes[match.id] === match.entry2_id 
                                      ? 'bg-blue-100 border-l-4 border-blue-500' 
                                      : 'hover:bg-gray-100'
                                  } ${match.winner_id === match.entry2_id ? 'bg-green-100 border-l-4 border-green-500' : ''}`}
                                  onClick={() => competition.status === 'voting' && match.status === 'voting' && handleVote(match.id, match.entry2_id)}
                                >
                                  <div className="flex items-center space-x-3">
                                    {entries.find(e => e.id === match.entry2_id)?.image_url && (
                                      <img 
                                        src={entries.find(e => e.id === match.entry2_id)?.image_url}
                                        alt={match.entry2_selection}
                                        className="w-12 h-8 object-cover rounded"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">
                                        {match.entry2_selection}
                                      </div>
                                      {entries.find(e => e.id === match.entry2_id)?.is_ai_generated && (
                                        <div className="text-xs text-purple-600">AI Generated</div>
                                      )}
                                    </div>
                                    {userVotes[match.id] === match.entry2_id && (
                                      <div className="text-blue-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {match.is_tie && (
                                  <div className="bg-yellow-50 px-4 py-2 text-center">
                                    <div className="text-xs text-yellow-700 font-medium">
                                      🪙 Decided by coin flip
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-64 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                  <div className="text-sm font-medium">TBD</div>
                                  <div className="text-xs">Awaiting previous round</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Voting Instructions */}
          {competition.status === 'voting' && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600 mt-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Voting Instructions</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Click on your preferred choice in each match. You can only vote during active round periods (see schedule above). 
                    You can change your vote anytime during the active voting window. Vote counts are hidden until the round ends to keep voting fair!
                  </p>
                  {roundSchedules.length > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      💡 Check the schedule above to see which rounds are currently active for voting.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Competition;