import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout, isAuthenticated, backendUrl } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${backendUrl}/api/notifications/unread-count`);
          setUnreadCount(response.data.unread_count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
    };

    fetchUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, backendUrl]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg border-b-4 border-purple-600">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-purple-600">
            NOTEZ FUN 🎉
          </Link>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-purple-600 font-medium transition duration-200"
                >
                  Dashboard
                </Link>
                <div className="relative">
                  <span className="text-gray-700 font-medium">
                    {user?.username}
                  </span>
                  {unreadCount > 0 && (
                    <span className="notification-dot">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-purple-600 font-medium transition duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;