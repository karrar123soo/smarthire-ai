import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Building, MapPin, DollarSign, Clock, CheckCircle2, Globe, ArrowRight, UserCheck, Sparkles, Send } from 'lucide-react';

export default function JobDetailModal({ job, isOpen, onClose, onApplyPrompt }) {
  const { user, role, isAuthenticated } = useAuth();

  if (!isOpen || !job) return null;

  const candidateSkills = user?.skills || [];
  const requiredSkills = job.requiredSkills || [];

  // Calculate quick matching preview for candidate
  const matchedSkills = requiredSkills.filter(s =>
    candidateSkills.some(cs => cs.toLowerCase() === s.toLowerCase())
  );
  const matchPct = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 100;

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive Compensation';
    const fmt = (num) => `$${Math.round(num / 1000)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)} USD / year`;
    if (min) return `From ${fmt(min)} USD / year`;
    return `Up to ${fmt(max)} USD / year`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl glass-card border border-slate-750 bg-slate-900/95 p-6 sm:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-brand-400 font-mono uppercase tracking-wider">
                {job.companyName || 'TechNova Solutions'}
              </span>
              {job.department && (
                <span className="text-xs text-slate-500">• {job.department}</span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.location || 'Remote'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.experienceYearsRequired ? `${job.experienceYearsRequired}+ yrs experience` : 'Any experience'}</span>
              </div>
              <div className="flex items-center space-x-1 font-mono text-emerald-400 font-medium">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
              </div>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-500/15 text-brand-300 border border-brand-500/30">
            {job.jobType?.replace('_', ' ')}
          </span>
        </div>

        {/* Candidate Skill Match Preview Banner */}
        {isAuthenticated && role === 'ROLE_CANDIDATE' && requiredSkills.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-850/80 border border-purple-500/30 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI Candidate Skill Alignment: {matchPct}% Match</span>
              </div>
              <p className="text-[11px] text-slate-400">
                You have {matchedSkills.length} of {requiredSkills.length} required skills in your profile
              </p>
            </div>

            <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden flex-shrink-0">
              <div
                className="bg-gradient-to-r from-purple-500 to-brand-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${matchPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Full Job Description */}
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed mb-8">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">Role Overview & Responsibilities</h4>
            <div className="whitespace-pre-line text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              {job.description}
            </div>
          </div>

          {/* Required Skills Section */}
          {requiredSkills.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Required Technical Skills & Competencies</h4>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, index) => {
                  const isMatched = candidateSkills.some(cs => cs.toLowerCase() === skill.toLowerCase());
                  return (
                    <span
                      key={index}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-mono border ${
                        isMatched
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-850 text-slate-300 border-slate-750'
                      }`}
                    >
                      {isMatched && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      <span>{skill}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recruiter & Company Info */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <p className="text-slate-400">Hiring Organization</p>
              <p className="font-semibold text-white">{job.companyName || 'TechNova Solutions'}</p>
            </div>
            {job.companyWebsite && (
              <a
                href={job.companyWebsite}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-brand-400 hover:text-brand-300 font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Visit Website</span>
              </a>
            )}
          </div>
        </div>

        {/* Modal Bottom CTA */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Requisition ID: #{job.id} • Posted {new Date(job.createdAt).toLocaleDateString()}
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Close
            </button>

            <button
              onClick={() => onApplyPrompt(job)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-brand-500/25 transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply for Position</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
