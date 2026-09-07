import React, { useState } from 'react';
import { interviewService } from '../../services/interviewService';
import { X, Calendar, Clock, Video, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const INTERVIEW_TYPES = [
  { value: 'TECHNICAL', label: 'Technical Interview' },
  { value: 'HR', label: 'HR Screening' },
  { value: 'BEHAVIORAL', label: 'Behavioral Round' },
  { value: 'MANAGERIAL', label: 'Managerial Discussion' },
  { value: 'FINAL_ROUND', label: 'Executive Final Round' },
];

const DURATION_OPTIONS = [
  { value: 30, label: '30 Minutes' },
  { value: 45, label: '45 Minutes (Standard)' },
  { value: 60, label: '60 Minutes (Deep Dive)' },
  { value: 90, label: '90 Minutes (Panel/Live Coding)' },
];

export default function ScheduleInterviewModal({ application, isOpen, onClose, onScheduled }) {
  // Default to tomorrow 10:00 AM
  const getTomorrowDefault = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [interviewDateTime, setInterviewDateTime] = useState(getTomorrowDefault());
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [interviewType, setInterviewType] = useState('TECHNICAL');
  const [meetingLink, setMeetingLink] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !application) return null;

  const handleGenerateLink = () => {
    const randomCode = Math.random().toString(36).substring(2, 5) + '-' +
      Math.random().toString(36).substring(2, 6) + '-' +
      Math.random().toString(36).substring(2, 5);
    setMeetingLink(`https://meet.google.com/${randomCode}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        applicationId: application.id || application.applicationId,
        interviewDateTime: interviewDateTime,
        durationMinutes: parseInt(durationMinutes, 10),
        interviewType,
        meetingLink: meetingLink.trim() || undefined,
        customNotes: customNotes.trim() || undefined,
      };

      await interviewService.scheduleInterview(payload);
      if (onScheduled) onScheduled();
      onClose();
    } catch (err) {
      console.error('Schedule interview error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl glass-card border border-slate-750 bg-slate-900/95 p-6 sm:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-5 border-b border-slate-800 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Schedule Interview Round</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Candidate: <span className="text-white font-semibold">{application.candidateName}</span> &bull; {application.jobTitle}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Interview Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Round Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INTERVIEW_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setInterviewType(type.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                    interviewType === type.value
                      ? 'bg-indigo-500/20 border-indigo-500 text-white ring-1 ring-indigo-500/40'
                      : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-white'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date and Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date & Time (Future) *
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={interviewDateTime}
                  onChange={(e) => setInterviewDateTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration *
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {DURATION_OPTIONS.map((dur) => (
                  <option key={dur.value} value={dur.value}>
                    {dur.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Meeting Link with generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Meeting Room URL
              </label>
              <button
                type="button"
                onClick={handleGenerateLink}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto Generate Google Meet</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij or Zoom link"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Agenda & Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Agenda & Candidate Instructions
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Please be prepared to review your recent Spring Boot microservices project and take part in a short pair coding exercise..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Scheduling...' : 'Schedule & Notify Candidate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
