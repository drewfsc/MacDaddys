'use client';

import { useState, useEffect } from 'react';
import { Feedback } from '@/lib/types';

export default function FeedbackManagement() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (data.success) {
        setFeedback(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });
      await fetchFeedback();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendReply = async () => {
    if (!selectedFeedback || !replyText.trim()) return;
    setSending(true);

    try {
      await fetch('/api/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFeedback._id,
          replyMessage: replyText,
          read: true,
        }),
      });

      // In a real app, you'd also send an email here
      alert('Reply saved! In production, this would email the customer.');

      setReplyText('');
      setSelectedFeedback(null);
      await fetchFeedback();
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const archiveFeedback = async (id: string) => {
    try {
      await fetch('/api/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, archived: true }),
      });
      await fetchFeedback();
      if (selectedFeedback?._id?.toString() === id) {
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Error archiving feedback:', error);
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm('Permanently delete this feedback?')) return;

    try {
      await fetch(`/api/feedback?id=${id}`, { method: 'DELETE' });
      await fetchFeedback();
      if (selectedFeedback?._id?.toString() === id) {
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const filteredFeedback = feedback.filter((f) => {
    if (filter === 'unread' && f.read) return false;
    if (filter === 'replied' && !f.replied) return false;
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    return true;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'compliment':
        return 'bg-green-100 text-green-800';
      case 'complaint':
        return 'bg-red-100 text-red-800';
      case 'suggestion':
        return 'bg-blue-100 text-blue-800';
      case 'question':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 font-headline text-xl animate-pulse">
          Loading feedback...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-[#1a1a1a]">Customer Feedback</h1>
        <div className="text-sm text-gray-500">
          {feedback.filter((f) => !f.read).length} unread
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm font-headline tracking-wider ${
              filter === 'all'
                ? 'bg-[#C41E3A] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded text-sm font-headline tracking-wider ${
              filter === 'unread'
                ? 'bg-[#C41E3A] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            UNREAD
          </button>
          <button
            onClick={() => setFilter('replied')}
            className={`px-3 py-1 rounded text-sm font-headline tracking-wider ${
              filter === 'replied'
                ? 'bg-[#C41E3A] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            REPLIED
          </button>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1 rounded border border-gray-200 text-sm"
        >
          <option value="all">All Types</option>
          <option value="compliment">Compliments</option>
          <option value="complaint">Complaints</option>
          <option value="suggestion">Suggestions</option>
          <option value="question">Questions</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-headline tracking-wider">
              MESSAGES ({filteredFeedback.length})
            </h2>
          </div>

          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredFeedback.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No feedback matching your filters
              </div>
            ) : (
              filteredFeedback.map((item) => (
                <div
                  key={item._id?.toString()}
                  onClick={() => {
                    setSelectedFeedback(item);
                    if (!item.read) {
                      markAsRead(item._id!.toString());
                    }
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedFeedback?._id === item._id ? 'bg-blue-50' : ''
                  } ${!item.read ? 'bg-yellow-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {!item.read && (
                        <span className="w-2 h-2 bg-[#C41E3A] rounded-full"></span>
                      )}
                      <span className="font-headline">{item.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </div>
                    {item.replied && (
                      <span className="text-xs text-green-600">Replied</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{item.message}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Feedback Detail / Reply */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {selectedFeedback ? (
            <>
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="font-headline tracking-wider">FEEDBACK DETAILS</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => archiveFeedback(selectedFeedback._id!.toString())}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => deleteFeedback(selectedFeedback._id!.toString())}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="p-4">
                {/* Customer Info */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-headline text-lg">{selectedFeedback.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(selectedFeedback.type)}`}>
                      {selectedFeedback.type}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{selectedFeedback.email}</p>
                  {selectedFeedback.phone && (
                    <p className="text-gray-600 text-sm">{selectedFeedback.phone}</p>
                  )}
                  {selectedFeedback.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= selectedFeedback.rating!
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    Submitted: {formatDate(selectedFeedback.createdAt)}
                  </p>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <h4 className="font-headline text-sm text-gray-500 mb-2">MESSAGE</h4>
                  <div className="bg-gray-50 rounded p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedFeedback.message}
                    </p>
                  </div>
                </div>

                {/* Previous Reply */}
                {selectedFeedback.replied && selectedFeedback.replyMessage && (
                  <div className="mb-6">
                    <h4 className="font-headline text-sm text-gray-500 mb-2">YOUR REPLY</h4>
                    <div className="bg-green-50 rounded p-4 border border-green-200">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedFeedback.replyMessage}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        Sent: {selectedFeedback.repliedAt && formatDate(selectedFeedback.repliedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                {!selectedFeedback.replied && (
                  <div>
                    <h4 className="font-headline text-sm text-gray-500 mb-2">
                      SEND A REPLY
                    </h4>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
                      rows={4}
                      placeholder="Type your reply here..."
                    />
                    <button
                      onClick={sendReply}
                      disabled={sending || !replyText.trim()}
                      className="mt-2 w-full bg-[#C41E3A] text-white font-headline tracking-wider py-2 rounded hover:bg-[#a01830] transition-colors disabled:opacity-50"
                    >
                      {sending ? 'SENDING...' : 'SEND REPLY'}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
              <div>
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <p>Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
