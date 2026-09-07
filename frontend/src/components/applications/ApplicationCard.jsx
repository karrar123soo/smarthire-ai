import React from 'react';
import { Building, MapPin, Calendar, Sparkles, CheckCircle2, Clock, AlertCircle, XCircle, Trash2 } from 'lucide-react';

const STAGES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'];

export default function ApplicationCard({ application, onWithdraw }) {
  const getStageIndex = (status) => {
    switch (status) {
      case 'APPLIED': return 0;
      case 'UNDER_REVIEW': return 1;
      case 'SHORTLISTED': return 2;
      case 'INTERVIEW_SCHEDULED': return 3;
      case 'HIRED': return 4;
      case 'REJECTED': return -1;
      default: return 0;
    }
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

  const currentStageIndex = getStageIndex(application.status);

  return (
    <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4 hover:border-brand-500/30 transition">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-semibold text-brand-400">{application.companyName || 'Enterprise Tech'}</span>
            {application.jobDepartment && (
              <span className="text-xs text-slate-500">• {application.jobDepartment}</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white">{application.jobTitle}</h3>
          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{application.jobLocation || 'Remote'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Match Score */}
          {application.matchScore !== null && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{Math.round(application.matchScore)}% Match</span>
            </div>
          )}

          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadge(application.status)}`}>
            {application.status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Recruitment Pipeline Progress Stepper */}
      {application.status !== 'REJECTED' && (
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2">
            <span className={currentStageIndex >= 0 ? 'text-brand-300 font-bold' : ''}>1. Applied</span>
            <span className={currentStageIndex >= 1 ? 'text-amber-300 font-bold' : ''}>2. Review</span>
            <span className={currentStageIndex >= 2 ? 'text-purple-300 font-bold' : ''}>3. Shortlisted</span>
            <span className={currentStageIndex >= 3 ? 'text-indigo-300 font-bold' : ''}>4. Interview</span>
            <span className={application.status === 'HIRED' ? 'text-emerald-300 font-bold' : ''}>5. Offer / Hired</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{
                width:
                  application.status === 'HIRED'
                    ? '100%'
                    : currentStageIndex === 0
                    ? '20%'
                    : currentStageIndex === 1
                    ? '40%'
                    : currentStageIndex === 2
                    ? '65%'
                    : '85%',
              }}
            />
          </div>
        </div>
      )}

      {/* Rejection Notice */}
      {application.status === 'REJECTED' && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>Application was not moved forward for this position.</span>
        </div>
      )}

      {/* Candidate Notes Excerpt */}
      {application.candidateNotes && (
        <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-300 font-semibold block mb-0.5">Your Submission Note:</span>
          "{application.candidateNotes}"
        </div>
      )}

      {/* Recruiter Feedback / Notes */}
      {application.hrNotes && (
        <div className="text-xs text-indigo-300 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/20">
          <span className="font-semibold block mb-0.5 text-indigo-200">Recruiter Feedback:</span>
          "{application.hrNotes}"
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/40 text-xs">
        <span className="text-slate-500 font-mono text-[10px]">
          Ref #{application.id} • Last updated {new Date(application.updatedAt || application.appliedAt).toLocaleDateString()}
        </span>

        {application.status !== 'HIRED' && application.status !== 'REJECTED' && (
          <button
            onClick={() => onWithdraw(application.id, application.jobTitle)}
            className="inline-flex items-center space-x-1 text-slate-400 hover:text-rose-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Withdraw Application</span>
          </button>
        )}
      </div>

    </div>
  );
}
