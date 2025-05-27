import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ManageWebsites = () => {
  const { backendUrl } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/pages`);
      setPages(response.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page.id);
    setEditFormData({
      title: page.title,
      short_description: page.short_description,
      long_description: page.long_description,
      is_maintenance: page.is_maintenance
    });
  };

  const handleCancelEdit = () => {
    setEditingPage(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (pageId) => {
    try {
      await axios.put(`${backendUrl}/api/pages/${pageId}`, editFormData);
      setEditingPage(null);
      fetchPages();
    } catch (error) {
      alert('Error updating page');
    }
  };

  const handleDelete = async (pageId, pagename) => {
    if (window.confirm(`Are you sure you want to delete "${pagename}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`${backendUrl}/api/pages/${pageId}`);
        fetchPages();
      } catch (error) {
        alert('Error deleting page');
      }
    }
  };

  const toggleMaintenance = async (pageId, currentStatus) => {
    try {
      await axios.put(`${backendUrl}/api/pages/${pageId}`, {
        is_maintenance: !currentStatus
      });
      fetchPages();
    } catch (error) {
      alert('Error updating maintenance status');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Your Websites</h2>
      
      {pages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">You haven't created any pages yet.</p>
          <p className="text-gray-500">Click on the "Create Website" tab to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pages.map((page) => (
            <div key={page.id} className="border border-gray-200 rounded-lg p-6">
              {editingPage === page.id ? (
                // Edit Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData(prev => ({...prev, title: e.target.value}))}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={editFormData.short_description}
                      onChange={(e) => setEditFormData(prev => ({...prev, short_description: e.target.value}))}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Long Description
                    </label>
                    <textarea
                      value={editFormData.long_description}
                      onChange={(e) => setEditFormData(prev => ({...prev, long_description: e.target.value}))}
                      rows="6"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.is_maintenance}
                      onChange={(e) => setEditFormData(prev => ({...prev, is_maintenance: e.target.checked}))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Maintenance Mode
                    </label>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleSaveEdit(page.id)}
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{page.title}</h3>
                      <p className="text-gray-600 mt-1">{page.short_description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>URL: /{page.pagename}</span>
                        <span>Views: {page.view_count}</span>
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
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/${page.pagename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition duration-200"
                    >
                      View Page
                    </a>
                    <button
                      onClick={() => handleEdit(page)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleMaintenance(page.id, page.is_maintenance)}
                      className={`px-4 py-2 rounded text-sm transition duration-200 ${
                        page.is_maintenance 
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {page.is_maintenance ? 'Disable Maintenance' : 'Enable Maintenance'}
                    </button>
                    <button
                      onClick={() => handleDelete(page.id, page.pagename)}
                      className="btn-danger"
                    >
                      Delete
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

export default ManageWebsites;