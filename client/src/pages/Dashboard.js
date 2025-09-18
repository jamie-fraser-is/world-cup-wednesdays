import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { TrophyIcon, CalendarIcon, PlusIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
    const [currentCompetition, setCurrentCompetition] = useState(null);
    const [userEntry, setUserEntry] = useState(null);
    const [myCompetitions, setMyCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const currentResponse = await axios.get('/api/competitions/current');
            const currentComp = currentResponse.data.competition;

            setCurrentCompetition(currentComp);

            if (currentComp) {
                // Get user's entry for current competition
                const entryResponse = await axios.get(`/api/entries/my-entry/${currentComp.id}`);
                setUserEntry(entryResponse.data.entry);
            }

            // Get user's competition history
            const profileResponse = await axios.get(`/api/users/${user.id}`);
            setMyCompetitions(profileResponse.data.recentCompetitions);
        } catch (error) {
            console.error('Fetch dashboard data error:', error);
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user.displayName}!
                </h1>
                <p className="text-gray-600">Here's what's happening in World Cup Wednesdays</p>
            </div>

            {/* Current Competition Section */}
            {currentCompetition ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Current Competition</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentCompetition.status === 'accepting_entries'
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
                            <div className="text-sm text-gray-500 mb-2">
                                Host: {currentCompetition.host_name}
                            </div>
                            {currentCompetition.entry_deadline && (
                                <div className="text-sm text-gray-500">
                                    Entry deadline: {new Date(currentCompetition.entry_deadline).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {userEntry ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-green-800 mb-2">Your Entry</h4>
                                    <div className="flex items-center space-x-3">
                                        {userEntry.image_url && (
                                            <img
                                                src={userEntry.image_url}
                                                alt={userEntry.selection}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        )}
                                        <span className="text-green-700 font-medium">{userEntry.selection}</span>
                                    </div>
                                </div>
                            ) : currentCompetition.status === 'accepting_entries' ? (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">Enter the Competition</h4>
                                    <p className="text-blue-700 text-sm mb-3">
                                        Submit your entry before the deadline!
                                    </p>
                                    <Link
                                        to={`/competition/${currentCompetition.id}`}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Submit Entry
                                    </Link>
                                </div>
                            ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-gray-600">You didn't enter this competition</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link
                            to={`/competition/${currentCompetition.id}`}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            View Competition Details
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
                    <TrophyIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">No Active Competition</h2>
                    <p className="text-gray-600">Check back soon for the next World Cup Wednesday!</p>
                </div>
            )}

            {/* My Competition History */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Competition History</h2>

                {myCompetitions.length === 0 ? (
                    <div className="text-center py-8">
                        <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">You haven't participated in any competitions yet.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myCompetitions.map((competition) => (
                            <div key={competition.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-800 truncate">{competition.title}</h3>
                                    {competition.won && (
                                        <TrophyIcon className="h-5 w-5 text-yellow-500" />
                                    )}
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{competition.topic}</p>

                                <div className="flex items-center space-x-2 mb-2">
                                    {competition.image_url && (
                                        <img
                                            src={competition.image_url}
                                            alt={competition.selection}
                                            className="w-8 h-8 object-cover rounded"
                                        />
                                    )}
                                    <span className="text-sm font-medium text-gray-700">{competition.selection}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{new Date(competition.created_at).toLocaleDateString()}</span>
                                    <span className={`px-2 py-1 rounded-full ${competition.won
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {competition.won ? 'Won' : 'Participated'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;