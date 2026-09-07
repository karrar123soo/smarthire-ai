import React, { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';
import ApplicationCard from './ApplicationCard';
import { Briefcase, RefreshCw, Send, AlertCircle, ArrowRight } from 'lucide-react';

export default function MyApplicationsView({ onExploreJobs }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMyApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await applicationService.getMyApplications({ page, size: 10 });
      if (res && res.data) {
        setApplications(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load candidate applications:', err);
      setError('Unable to load your applications. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, [page]);

  const handleWithdraw = async (applicationId, jobTitle) => {
    if (window.confirm(`Are you sure you want to withdraw your application for "${jobTitle}"?`)) {
      try {
        await applicationService.withdrawApplication(applicationId);
        fetchMyApplications();
      } catch (err) {
        alert('Failed to withdraw application: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <section className="py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Send className="w-4 h-4" />
            <span>Candidate Application Tracker</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Job Applications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track your recruitment stages, view recruiter feedback, and monitor your AI skill match scores.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMyApplications}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 transition"
            title="Refresh Applications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onExploreJobs}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition"
          >
            <Briefcase className="w-4 h-4" />
            <span>Browse More Jobs</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-xs">Loading your submitted applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-3xl border border-slate-800 p-8 max-w-md mx-auto">
          <Send className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Active Applications</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            You haven't applied to any job requisitions yet. Explore our open positions and submit your profile.
          </p>
          <button
            onClick={onExploreJobs}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition"
          >
            <span>Explore Open Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onWithdraw={handleWithdraw}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-3 text-xs">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 disabled:opacity-40 transition"
              >
                Previous
              </button>
              <span className="text-slate-400 font-mono">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
