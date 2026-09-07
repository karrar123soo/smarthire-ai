import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { interviewService } from '../../services/interviewService';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import InterviewFeedbackModal from './InterviewFeedbackModal';
import {
  Calendar,
  Clock,
  Video,
  User,
  Building2,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function InterviewCalendarView() {
  const { user, role } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedInterviewForFeedback, setSelectedInterviewForFeedback] = useState(null);

  const fetchInterviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await interviewService.getMyInterviews({
        status: statusFilter || null,
        page,
        size: 10,
      });
      if (res && res.data) {
        setInterviews(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
      setError('Unable to load interviews. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter, page]);

  const handleCancelInterview = async (interviewId) => {
    const reason = window.prompt('Enter reason for cancelling interview (optional):');
    if (reason === null) return; // User clicked Cancel

    try {
      await interviewService.cancelInterview(interviewId, reason);
      fetchInterviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel interview');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'COMPLETED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'RESCHEDULED':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getCountdownLabel = (dtString) => {
    const interviewDate = new Date(dtString);
    const now = new Date();
    const diffMs = interviewDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return { text: 'Past', color: 'text-slate-500 bg-slate-800/80 border-slate-700' };
    }
    if (diffDays <= 0) {
      return { text: 'Today!', color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40 animate-pulse' };
    }
    if (diffDays === 1) {
      return { text: 'Tomorrow', color: 'text-amber-300 bg-amber-500/20 border-amber-500/40' };
    }
    return { text: `In ${diffDays} days`, color: 'text-brand-300 bg-brand-500/20 border-brand-500/40' };
  };

  return (
    <section className="py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Smart Interview Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interview Schedule & Scorecards
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {role === 'ROLE_HR'
              ? 'Coordinate technical interviews, launch meetings, and log multi-factor competency scorecards.'
              : 'View your scheduled interview sessions, meeting links, and recruiter feedback.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchInterviews}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 p-1.5 rounded-2xl glass-card border border-slate-800 mb-6 w-fit">
        {[
          { key: '', label: 'All Rounds' },
          { key: 'SCHEDULED', label: 'Upcoming / Scheduled' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'CANCELLED', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(0); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              statusFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Interview Cards List */}
      {loading ? (
        <div className="py-20 text-center glass-card rounded-3xl p-8 border border-slate-800">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-semibold">Loading interview schedules...</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="py-16 text-center glass-card rounded-3xl p-8 border border-slate-800 max-w-lg mx-auto">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Interviews Found</h3>
          <p className="text-xs text-slate-400">
            {statusFilter
              ? `There are no interviews with status "${statusFilter}".`
              : role === 'ROLE_HR'
              ? 'No interviews have been scheduled yet. You can schedule interviews directly from the Candidate Pipeline!'
              : 'You do not have any scheduled interviews currently.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((item) => {
            const countdown = getCountdownLabel(item.interviewDateTime);
            const isHr = role === 'ROLE_HR';

            return (
              <div
                key={item.id}
                className="glass-card border border-slate-800 rounded-3xl p-5 sm:p-6 hover:border-slate-700 transition flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Row: Type & Countdown */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        {item.interviewType?.replace('_', ' ')}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${countdown.color}`}>
                      {countdown.text}
                    </span>
                  </div>

                  {/* Title & Job */}
                  <h3 className="text-base font-bold text-white mb-0.5">
                    {item.jobTitle}
                  </h3>
                  <div className="text-xs text-slate-400 mb-4 flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.companyName || 'SmartHire AI Partner'} &bull; {item.jobDepartment || 'Engineering'}</span>
                  </div>

                  {/* Details Grid */}
                  <div className="p-3.5 rounded-2xl bg-slate-850/70 border border-slate-800/80 space-y-2 text-xs text-slate-300 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{new Date(item.interviewDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({item.durationMinutes} mins)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {isHr ? (
                          <>Candidate: <strong className="text-white">{item.candidateName}</strong> ({item.candidateEmail})</>
                        ) : (
                          <>Interviewer: <strong className="text-white">{item.interviewerName || 'Lead Technical Recruiter'}</strong></>
                        )}
                      </span>
                    </div>

                    {item.meetingLink && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-[11px] text-slate-400">Meeting Room:</span>
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-mono font-semibold"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Virtual Room</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Feedback summary if completed */}
                  {item.rating && (
                    <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-300 flex items-center space-x-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>Evaluation Scorecard</span>
                        </span>
                        <span className="font-mono font-bold text-amber-400">{item.rating} / 10</span>
                      </div>
                      {item.feedback && (
                        <p className="text-slate-300 text-[11px] italic line-clamp-2">
                          "{item.feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  {item.meetingLink && item.status === 'SCHEDULED' ? (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs inline-flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meeting</span>
                    </a>
                  ) : <div />}

                  <div className="flex items-center space-x-2">
                    {/* HR Scorecard Button */}
                    {isHr && item.status === 'SCHEDULED' && (
                      <button
                        onClick={() => {
                          setSelectedInterviewForFeedback(item);
                          setFeedbackModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition flex items-center space-x-1"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Log Scorecard</span>
                      </button>
                    )}

                    {/* HR Cancel Button */}
                    {isHr && item.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleCancelInterview(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="space-x-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded bg-slate-850 hover:bg-slate-800 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded bg-slate-850 hover:bg-slate-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Feedback Scorecard Modal */}
      <InterviewFeedbackModal
        interview={selectedInterviewForFeedback}
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onFeedbackSubmitted={fetchInterviews}
      />
    </section>
  );
}
