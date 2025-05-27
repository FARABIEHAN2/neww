import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CreateWebsite from '../components/CreateWebsite';
import ManageWebsites from '../components/ManageWebsites';
import Notifications from '../components/Notifications';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');

  const tabs = [
    { id: 'create', label: 'Create Website', icon: '➕' },
    { id: 'manage', label: 'Manage Websites', icon: '🛠️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  return (
    <div className="page-container">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-purple-200 text-lg">
          Build and manage your amazing pages
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition duration-200 ${
                activeTab === tab.id ? 'tab-active' : 'tab-inactive'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="fade-in">
        {activeTab === 'create' && <CreateWebsite />}
        {activeTab === 'manage' && <ManageWebsites />}
        {activeTab === 'notifications' && <Notifications />}
      </div>
    </div>
  );
};

export default Dashboard;