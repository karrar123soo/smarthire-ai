import React, { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import JobFormModal from './JobFormModal';
import { Briefcase, Plus, Edit2, Trash2, Users, CheckCircle, AlertTriangle, Clock, RefreshCw, Eye } from 'lucide-react';

export default function HRJobsManager({ onViewJobDetails }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, openJobs: 0, draftJobs: 0, closedJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHRJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const [jobsRes, statsRes] = await Promise.all([
        jobService.getMyJobs({ page, size: 10 }),
        jobService.getJobStats(),
      ]);

      if (jobsRes && jobsRes.data) {
        setJobs(jobsRes.data.content || []);
        setTotalPages(jobsRes.data.totalPages || 1);
      }
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to load HR jobs:', err);
      setError('Unable to load recruiter job requisitions. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRJobs();
  }, [page]);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobService.changeJobStatus(jobId, newStatus);
      fetchHRJobs();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (jobId, title) => {
    if (window.confirm(`Are you sure you want to delete requisition "${title}"?`)) {
      try {
        await jobService.deleteJob(jobId);
        fetchHRJobs();
      } catch (err) {
        alert('Failed to delete job: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const openCreateModal = () => {
    setJobToEdit(null);
    setFormModalOpen(true);
  };

  const openEditModal = (job) => {
    setJobToEdit(job);
    setFormModalOpen(true);
  };

  return (
    <section className="py-10">
      {/* Header and Action Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Recruiter Operations Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Job Requisition Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your open roles, track applicant volume, and update required technical skills.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchHRJobs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 transition"
            title="Refresh Requisitions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Requisition</span>
          </button>
        </div>
      </div>

      {/* Recruiter KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Requisitions</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalJobs || 0}</p>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Active & Open</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1">{stats.openJobs || 0}</p>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-amber-500/20 bg-amber-500/5">
          <p className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Draft Positions</p>
          <p className="text-2xl font-bold text-amber-300 mt-1">{stats.draftJobs || 0}</p>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Closed Roles</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">{stats.closedJobs || 0}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Jobs Table / List */}
      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Requisition Title</th>
                <th className="px-4 py-3.5">Type & Location</th>
                <th className="px-4 py-3.5">Experience</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Applicants</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-white">No job requisitions found</p>
                    <p className="text-xs text-slate-500 mt-1">Get started by creating your first job opening.</p>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-850/50 transition">
                    
                    {/* Title & Dept */}
                    <td className="px-6 py-4">
                      <div
                        onClick={() => onViewJobDetails && onViewJobDetails(job)}
                        className="font-bold text-white hover:text-brand-300 transition cursor-pointer text-sm"
                      >
                        {job.title}
                      </div>
                      <div className="text-[11px] text-slate-400">{job.department || 'General Engineering'}</div>
                    </td>

                    {/* Type & Location */}
                    <td className="px-4 py-4 font-mono text-[11px]">
                      <div>{job.jobType?.replace('_', ' ')}</div>
                      <div className="text-slate-400">{job.location || 'Remote'}</div>
                    </td>

                    {/* Experience */}
                    <td className="px-4 py-4">
                      <span className="text-slate-300">{job.experienceYearsRequired ? `${job.experienceYearsRequired}+ yrs` : 'Entry'}</span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-4 py-4">
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-slate-900 cursor-pointer focus:outline-none ${
                          job.status === 'OPEN'
                            ? 'text-emerald-300 border-emerald-500/30'
                            : job.status === 'DRAFT'
                            ? 'text-amber-300 border-amber-500/30'
                            : 'text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>

                    {/* Applicants */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px]">
                        <Users className="w-3 h-3 text-brand-400" />
                        <span>{job.applicantsCount || 0}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => onViewJobDetails && onViewJobDetails(job)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openEditModal(job)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-slate-800 transition"
                        title="Edit Requisition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(job.id, job.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Requisition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
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

      {/* Create / Edit Job Modal */}
      <JobFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        jobToEdit={jobToEdit}
        onSaved={fetchHRJobs}
      />
    </section>
  );
}
