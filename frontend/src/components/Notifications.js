import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Notifications = () => {
  const { backendUrl } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${backendUrl}/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'feedback':
        return '💬';
      case 'suspension':
        return '🚫';
      default:
        return '🔔';
    }
  };

  const getNotificationStyle = (type, isRead) => {
    const baseClasses = 'p-4 rounded-lg border-l-4 transition duration-200 cursor-pointer ';
    
    if (!isRead) {
      switch (type) {
        case 'feedback':
          return baseClasses + 'bg-blue-50 border-blue-500 hover:bg-blue-100';
        case 'suspension':
          return baseClasses + 'bg-red-50 border-red-500 hover:bg-red-100';
        default:
          return baseClasses + 'notification-unread hover:bg-purple-100';
      }
    } else {
      return baseClasses + 'notification-read hover:bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h2>
      
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-600 text-lg">No notifications yet</p>
          <p className="text-gray-500">We'll notify you about feedback and important updates here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={getNotificationStyle(notification.type, notification.is_read)}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-800">
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleDateString()} at{' '}
                      {new Date(notification.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {notification.type === 'feedback' && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Feedback
                  </span>
                )}
                {notification.type === 'suspension' && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                    Suspension
                  </span>
                )}
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Click on unread notifications to mark them as read.
              You'll receive notifications when someone leaves feedback on your pages or if there are any administrative updates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;