import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Sparkles,
  Calendar,
  Send,
  Award,
  FileText,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const [listRes, countRes] = await Promise.all([
        notificationService.getNotifications({ page: 0, size: 20 }),
        notificationService.getUnreadCount(),
      ]);

      if (listRes && listRes.data) {
        setNotifications(listRes.data.content || []);
      }
      if (countRes && typeof countRes.data === 'number') {
        setUnreadCount(countRes.data);
        if (onUnreadCountChange) onUnreadCountChange(countRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Unable to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      if (onUnreadCountChange) onUnreadCountChange(newCount);
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  if (!isOpen) return null;

  const getIconForType = (type) => {
    switch (type) {
      case 'APPLICATION_STATUS_CHANGED':
      case 'APPLICATION_SUBMITTED':
        return <Send className="w-4 h-4 text-blue-400" />;
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_RESCHEDULED':
        return <Calendar className="w-4 h-4 text-indigo-400" />;
      case 'INTERVIEW_FEEDBACK':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'RESUME_PARSED':
        return <FileText className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-brand-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white font-mono text-[10px] font-black">
                      {unreadCount} new
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-400">Real-time alerts & pipeline updates</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actions Bar */}
          {notifications.length > 0 && (
            <div className="px-5 py-2.5 bg-slate-850/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Recent Activity</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1 transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all as read</span>
                </button>
              )}
            </div>
          )}

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 text-brand-400 animate-spin mx-auto mb-2" />
                <p className="text-xs font-medium">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <Bell className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-200">No notifications yet</h4>
                <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition relative flex items-start space-x-3 ${
                    n.isRead
                      ? 'bg-slate-850/40 border-slate-800/60 text-slate-400'
                      : 'bg-slate-850 border-brand-500/30 text-slate-200 shadow-md shadow-brand-500/5'
                  }`}
                >
                  {/* Type Icon */}
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0 mt-0.5">
                    {getIconForType(n.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className={`text-xs font-bold truncate ${n.isRead ? 'text-slate-300' : 'text-white'}`}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-3 mb-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </span>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-0.5"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
