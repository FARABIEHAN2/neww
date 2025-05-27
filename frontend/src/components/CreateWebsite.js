import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CreateWebsite = () => {
  const { backendUrl } = useAuth();
  const [formData, setFormData] = useState({
    pagename: '',
    title: '',
    short_description: '',
    long_description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validatePagename = (pagename) => {
    // Check for valid URL format (letters, numbers, hyphens only)
    const pagenameRegex = /^[a-zA-Z0-9-]+$/;
    return pagenameRegex.test(pagename);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate pagename format
    if (!validatePagename(formData.pagename)) {
      setError('Page name can only contain letters, numbers, and hyphens');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${backendUrl}/api/pages`, formData);
      setSuccess(`Page created successfully! Visit it at /${formData.pagename}`);
      setFormData({
        pagename: '',
        title: '',
        short_description: '',
        long_description: ''
      });
    } catch (error) {
      setError(error.response?.data?.detail || 'Error creating page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Website</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-banner">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Name (URL)
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 text-sm mr-2">yoursite.com/</span>
            <input
              type="text"
              name="pagename"
              required
              value={formData.pagename}
              onChange={handleChange}
              className="input-field"
              placeholder="my-awesome-page"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Only letters, numbers, and hyphens allowed
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Title
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter page title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description
          </label>
          <input
            type="text"
            name="short_description"
            required
            value={formData.short_description}
            onChange={handleChange}
            className="input-field"
            placeholder="Brief description of your page"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Long Description / Content
          </label>
          <textarea
            name="long_description"
            required
            value={formData.long_description}
            onChange={handleChange}
            rows="8"
            className="input-field"
            placeholder="Detailed content for your page..."
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50"
        >
          {loading ? 'Creating Page...' : 'Create Page'}
        </button>
      </form>
    </div>
  );
};

export default CreateWebsite;