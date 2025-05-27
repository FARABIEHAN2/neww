import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const PublicPage = () => {
  const { pagename } = useParams();
  const { user, backendUrl, isAuthenticated } = useAuth();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    fetchPage();
    fetchFeedback();
  }, [pagename]);

  const fetchPage = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/public/page/${pagename}`);
      setPage(response.data);
    } catch (error) {
      setError('Page not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    if (!page) return;
    try {
      const response = await axios.get(`${backendUrl}/api/feedback/${page.id}`);
      setFeedbackList(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setSubmittingFeedback(true);
    try {
      await axios.post(`${backendUrl}/api/feedback`, {
        page_id: page.id,
        message: feedback
      });
      setFeedback('');
      fetchFeedback();
      alert('Feedback submitted successfully!');
    } catch (error) {
      alert('Error submitting feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container text-center">
        <div className="bg-white rounded-xl shadow-lg p-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
          <p className="text-gray-600 text-lg">
            The page "{pagename}" doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (page.is_suspended) {
    return (
      <div className="page-container">
        <div className="suspended-banner">
          <h2 className="text-xl font-bold mb-2">🚫 Page Suspended</h2>
          <p>This page has been suspended by the administrator.</p>
          {page.suspension_reason && (
            <p className="mt-2"><strong>Reason:</strong> {page.suspension_reason}</p>
          )}
        </div>
      </div>
    );
  }

  if (page.is_maintenance) {
    return (
      <div className="page-container">
        <div className="maintenance-banner">
          <h2 className="text-xl font-bold mb-2">🚧 Under Maintenance</h2>
          <p>This page is currently under maintenance. Please check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{page.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{page.short_description}</p>
          <div className="text-sm text-gray-500">
            Views: <span className="font-semibold">{page.view_count}</span>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {page.long_description}
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      {isAuthenticated && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Feedback</h3>
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {showFeedback ? 'Hide Feedback' : 'Show Feedback'}
            </button>
          </div>
          
          <form onSubmit={submitFeedback} className="mb-6">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about this page..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="3"
            />
            <button
              type="submit"
              disabled={submittingFeedback || !feedback.trim()}
              className="mt-3 btn-primary disabled:opacity-50"
            >
              {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>

          {showFeedback && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Recent Feedback:</h4>
              {feedbackList.length > 0 ? (
                feedbackList.map((fb) => (
                  <div key={fb.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-purple-600">{fb.username}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{fb.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No feedback yet. Be the first to share your thoughts!</p>
              )}
            </div>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <div className="text-center bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600">
            <a href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in
            </a>{' '}
            to leave feedback and interact with this page!
          </p>
        </div>
      )}
    </div>
  );
};

export default PublicPage;