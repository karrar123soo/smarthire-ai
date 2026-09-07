import React from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Building, Sparkles, ArrowRight } from 'lucide-react';

export default function JobCard({ job, onViewDetails, onApply }) {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive';
    const fmt = (num) => `$${Math.round(num / 1000)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max)}`;
  };

  const getJobTypeColor = (type) => {
    switch (type) {
      case 'FULL_TIME': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'CONTRACT': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'REMOTE': return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'INTERNSHIP': return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-card relative group hover:-translate-y-1 hover:border-brand-500/40 transition duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: Company & Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-bold text-xs">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">{job.companyName || 'Enterprise Tech'}</p>
              {job.department && (
                <p className="text-[10px] text-slate-400">{job.department}</p>
              )}
            </div>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getJobTypeColor(job.jobType)}`}>
            {job.jobType?.replace('_', ' ')}
          </span>
        </div>

        {/* Job Title */}
        <h3
          onClick={() => onViewDetails(job)}
          className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors cursor-pointer leading-snug mb-2"
        >
          {job.title}
        </h3>

        {/* Job Description Excerpt */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {job.description}
        </p>

        {/* Key Metadata Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mb-4">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location || 'Remote'}</span>
          </div>

          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.experienceYearsRequired ? `${job.experienceYearsRequired}+ yrs exp` : 'Entry level'}</span>
          </div>

          <div className="flex items-center space-x-1 font-mono text-emerald-400 font-medium">
            <DollarSign className="w-3.5 h-3.5" />
            <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
          </div>
        </div>

        {/* Required Skills Chips */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800/80 mb-4">
            {job.requiredSkills.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-850 text-slate-300 border border-slate-750 font-mono"
              >
                {skill}
              </span>
            ))}
            {job.requiredSkills.length > 5 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                +{job.requiredSkills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-800/40">
        <span className="text-[10px] text-slate-500 font-mono">
          Posted {new Date(job.createdAt).toLocaleDateString()}
        </span>

        <button
          onClick={() => onViewDetails(job)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-300 hover:text-white hover:bg-brand-500/20 border border-brand-500/30 transition"
        >
          <span>View Requisition</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
