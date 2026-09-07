import React, { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import CandidateReviewModal from './CandidateReviewModal';
import { Users, Filter, Sparkles, RefreshCw, AlertCircle, Eye, CheckCircle2, XCircle, ArrowRight, Briefcase } from 'lucide-react';

const STAGES = [
  { key: '', label: 'All Candidates' },
  { key: 'APPLIED', label: '1. Applied' },
  { key: 'UNDER_REVIEW', label: '2. Under Review' },
  { key: 'SHORTLISTED', label: '3. Shortlisted' },
  { key: 'INTERVIEW_SCHEDULED', label: '4. Interview' },
  { key: 'HIRED', label: '5. Hired' },
  { key: 'REJECTED', label: 'Rejected' },
];

export default function HRPipelineManager() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPipelineData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pipeRes, statsRes, jobsRes] = await Promise.all([
        applicationService.getRecruiterPipeline({
          jobId: selectedJobId || null,
          status: selectedStage || null,
          page,
          size: 15,
        }),
        applicationService.getPipelineStats(),
        jobService.getMyJobs({ size: 100 }),
      ]);

      if (pipeRes && pipeRes.data) {
        setApplications(pipeRes.data.content || []);
        setTotalPages(pipeRes.data.totalPages || 1);
      }
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
      if (jobsRes && jobsRes.data) {
        setJobs(jobsRes.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load recruitment pipeline:', err);
      setError('Unable to load pipeline data. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, [selectedJobId, selectedStage, page]);

  const openReviewModal = (app) => {
    setSelectedApp(app);
    setReviewModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED': return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      case 'UNDER_REVIEW': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'SHORTLISTED': return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'INTERVIEW_SCHEDULED': return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
      case 'HIRED': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'REJECTED': return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <section className="py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Recruiter Candidate Flow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recruitment Pipeline Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Screen candidates, inspect AI matching scores, review cover pitches, and advance recruitment stages.
          </p>
        </div>

        <button
          onClick={fetchPipelineData}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 transition"
          title="Refresh Pipeline"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Funnel Metrics Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          <div className="p-3.5 rounded-2xl glass-card border border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Applied</p>
            <p className="text-xl font-bold text-white mt-1">{stats.totalApplications}</p>
          </div>
          <div className="p-3.5 rounded-2xl glass-card border border-blue-500/20 bg-blue-500/5">
            <p className="text-[10px] uppercase font-bold text-blue-400">New (Applied)</p>
            <p className="text-xl font-bold text-blue-300 mt-1">{stats.appliedCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl glass-card border border-amber-500/20 bg-amber-500/5">
            <p className="text-[10px] uppercase font-bold text-amber-400">Under Review</p>
            <p className="text-xl font-bold text-amber-300 mt-1">{stats.underReviewCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl glass-card border border-purple-500/20 bg-purple-500/5">
            <p className="text-[10px] uppercase font-bold text-purple-400">Shortlisted</p>
            <p className="text-xl font-bold text-purple-300 mt-1">{stats.shortlistedCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl glass-card border border-indigo-500/20 bg-indigo-500/5">
            <p className="text-[10px] uppercase font-bold text-indigo-400">Interviews</p>
            <p className="text-xl font-bold text-indigo-300 mt-1">{stats.interviewScheduledCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl glass-card border border-emerald-500/20 bg-emerald-500/5">
            <p className="text-[10px] uppercase font-bold text-emerald-400">Hired</p>
            <p className="text-xl font-bold text-emerald-300 mt-1">{stats.hiredCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl glass-card border border-purple-500/30 bg-purple-500/10">
            <p className="text-[10px] uppercase font-bold text-purple-300">Avg AI Match</p>
            <p className="text-xl font-bold text-purple-200 mt-1">{stats.averageMatchScore}%</p>
          </div>
        </div>
      )}

      {/* Filter Row: Stage Tabs + Job Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-slate-800 mb-6">
        {/* Stage Filter Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((st) => (
            <button
              key={st.key}
              onClick={() => { setSelectedStage(st.key); setPage(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedStage === st.key
                  ? 'bg-brand-500/20 border border-brand-500 text-white shadow-sm'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 border border-slate-750'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Job Requisition Filter Dropdown */}
        <div className="w-full md:w-72">
          <select
            value={selectedJobId}
            onChange={(e) => { setSelectedJobId(e.target.value); setPage(0); }}
            className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="">All Job Requisitions</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                #{j.id} - {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Candidate Pipeline Table / List */}
      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Candidate Profile</th>
                <th className="px-4 py-3.5">Requisition</th>
                <th className="px-4 py-3.5 text-center">AI Match Score</th>
                <th className="px-4 py-3.5">Current Stage</th>
                <th className="px-4 py-3.5">Applied Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 text-brand-400 animate-spin mx-auto mb-2" />
                    <span>Loading candidate pipeline...</span>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-white">No candidate applications found in this stage</p>
                    <p className="text-xs text-slate-500 mt-1">Try selecting "All Candidates" or another job requisition.</p>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-850/50 transition">
                    
                    {/* Candidate */}
                    <td className="px-6 py-4">
                      <div
                        onClick={() => openReviewModal(app)}
                        className="font-bold text-white hover:text-brand-300 transition cursor-pointer text-sm"
                      >
                        {app.candidateName}
                      </div>
                      <div className="text-[11px] text-slate-400">{app.candidateHeadline || 'Candidate'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{app.candidateEmail}</div>
                    </td>

                    {/* Job Requisition */}
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-200">{app.jobTitle}</div>
                      <div className="text-[11px] text-slate-400">{app.jobDepartment || 'Engineering'}</div>
                    </td>

                    {/* Match Score */}
                    <td className="px-4 py-4 text-center">
                      {app.matchScore !== null ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono font-bold text-xs">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>{Math.round(app.matchScore)}%</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">N/A</span>
                      )}
                    </td>

                    {/* Stage Badge */}
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getStatusBadge(app.status)}`}>
                        {app.status?.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 font-mono text-[11px] text-slate-400">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openReviewModal(app)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition shadow-sm"
                      >
                        <span>Screen Candidate</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Review Modal */}
      <CandidateReviewModal
        application={selectedApp}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onUpdated={fetchPipelineData}
      />
    </section>
  );
}
