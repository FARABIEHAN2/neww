import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const OwnerPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suspendingPage, setSuspendingPage] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  
  const { ownerLogin, backendUrl } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated as owner
    const token = localStorage.getItem('token');
    if (token) {
      fetchPages();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await ownerLogin(password);
    
    if (result.success) {
      setIsAuthenticated(true);
      fetchPages();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const fetchPages = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/owner/pages`);
      setPages(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setIsAuthenticated(false);
      }
      console.error('Error fetching pages:', error);
    }
  };

  const handleSuspend = async (pageId) => {
    if (!suspensionReason.trim()) {
      alert('Please provide a suspension reason');
      return;
    }

    try {
      await axios.post(`${backendUrl}/api/owner/suspend`, {
        page_id: pageId,
        reason: suspensionReason
      });
      setSuspendingPage(null);
      setSuspensionReason('');
      fetchPages();
      alert('Page suspended successfully');
    } catch (error) {
      alert('Error suspending page');
    }
  };

  const handleUnsuspend = async (pageId) => {
    try {
      await axios.post(`${backendUrl}/api/owner/unsuspend/${pageId}`);
      fetchPages();
      alert('Page unsuspended successfully');
    } catch (error) {
      alert('Error unsuspending page');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-2">👑 Owner Panel</h2>
            <p className="text-purple-200">Enter the owner password to access the admin panel</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-2xl p-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter owner password"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Access Owner Panel'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate('/login')}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">👑 Owner Panel</h1>
        <p className="text-purple-200 text-lg">Platform Administration & Management</p>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Platform Pages</h2>
          <div className="text-sm text-gray-600">
            Total Pages: <span className="font-semibold">{pages.length}</span>
          </div>
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">No pages found on the platform.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pages.map((page) => (
              <div key={page.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{page.title}</h3>
                      <span className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded">
                        @{page.username}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{page.short_description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>URL: /{page.pagename}</span>
                      <span>Views: {page.view_count}</span>
                      <span>Created: {new Date(page.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {page.is_maintenance && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          🚧 Maintenance
                        </span>
                      )}
                      {page.is_suspended && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          🚫 Suspended
                        </span>
                      )}
                    </div>
                    {page.is_suspended && page.suspension_reason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <strong>Suspension Reason:</strong> {page.suspension_reason}
                      </div>
                    )}
                  </div>
                </div>

                {suspendingPage === page.id ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Suspend Page</h4>
                    <textarea
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      placeholder="Enter suspension reason..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows="3"
                    />
                    <div className="flex space-x-3 mt-3">
                      <button
                        onClick={() => handleSuspend(page.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-200"
                      >
                        Confirm Suspension
                      </button>
                      <button
                        onClick={() => setSuspendingPage(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/${page.pagename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition duration-200"
                    >
                      View Page
                    </a>
                    {page.is_suspended ? (
                      <button
                        onClick={() => handleUnsuspend(page.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition duration-200"
                      >
                        Unsuspend
                      </button>
                    ) : (
                      <button
                        onClick={() => setSuspendingPage(page.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition duration-200"
                      >
                        Suspend Page
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">Owner Panel Features:</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• View all pages created by all users on the platform</li>
            <li>• Suspend pages with custom reasons (sends notification to user)</li>
            <li>• Unsuspend previously suspended pages</li>
            <li>• Monitor platform activity and user engagement</li>
            <li>• Access comprehensive page analytics and user information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OwnerPanel;