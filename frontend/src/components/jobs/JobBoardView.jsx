import React, { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService';
import JobCard from './JobCard';
import JobFilterBar from './JobFilterBar';
import JobDetailModal from './JobDetailModal';
import { Briefcase, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

const INITIAL_FILTERS = {
  keyword: '',
  jobType: '',
  department: '',
  location: '',
  minExperience: null,
  maxExperience: null,
  status: 'OPEN',
  page: 0,
  size: 9,
  sortBy: 'createdAt',
  sortDir: 'desc',
};

export default function JobBoardView({ onApplyPrompt }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [jobs, setJobs] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected Job for modal
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await jobService.getAllJobs(filters);
      if (res && res.data) {
        setJobs(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch open jobs:', err);
      setError('Unable to load job openings. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <section id="job-board" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Career Opportunities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Explore Open Requisitions
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Discover active tech roles with transparent salary ranges, remote options, and required skill criteria.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-brand-300 font-semibold">
              {totalElements} Requisitions Active
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <JobFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
            <p className="text-xs font-medium">Filtering open positions...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center glass-card rounded-3xl border border-slate-800 p-8">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Matching Requisitions Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords, clearing selected filters, or checking back later.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-semibold transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Jobs Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={setSelectedJob}
                  onApply={(j) => onApplyPrompt(j)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center space-x-3 text-xs">
                <button
                  disabled={filters.page === 0}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <span className="text-slate-400 font-mono">
                  Page {filters.page + 1} of {totalPages}
                </span>
                <button
                  disabled={filters.page >= totalPages - 1}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* Full Details Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onApplyPrompt={(j) => {
          setSelectedJob(null);
          if (onApplyPrompt) onApplyPrompt(j);
        }}
      />
    </section>
  );
}
