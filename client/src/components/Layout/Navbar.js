import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TrophyIcon, UserIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <TrophyIcon className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">World Cup Wednesdays</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link 
              to="/leaderboard" 
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ChartBarIcon className="h-5 w-5" />
              <span>Leaderboard</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">{user.displayName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;