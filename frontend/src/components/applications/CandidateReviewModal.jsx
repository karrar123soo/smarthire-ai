import React, { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';
import ScheduleInterviewModal from '../interviews/ScheduleInterviewModal';
import ResumeViewerModal from '../resume/ResumeViewerModal';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Save,
  MessageSquare,
  Calendar,
  FileText,
  ExternalLink
} from 'lucide-react';

const STAGE_OPTIONS = [
  { value: 'APPLIED', label: '1. Applied' },
  { value: 'UNDER_REVIEW', label: '2. Under Review' },
  { value: 'SHORTLISTED', label: '3. Shortlisted' },
  { value: 'INTERVIEW_SCHEDULED', label: '4. Interview Round' },
  { value: 'HIRED', label: '5. Offer / Hired' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function CandidateReviewModal({ application, isOpen, onClose, onUpdated }) {
  const [status, setStatus] = useState('APPLIED');
  const [hrNotes, setHrNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals inside review
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  useEffect(() => {
    if (application) {
      setStatus(application.status || 'APPLIED');
      setHrNotes(application.hrNotes || '');
    }
    setError('');
  }, [application, isOpen]);

  if (!isOpen || !application) return null;

  let matchDetails = { matchedSkills: [], missingSkills: [], matchPercentage: 0 };
  if (application.matchDetailsJson) {
    try {
      matchDetails = JSON.parse(application.matchDetailsJson);
    } catch (ignored) {}
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await applicationService.updateApplicationStatus(application.id, status, hrNotes);
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update candidate status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-2xl rounded-3xl glass-card border border-slate-750 bg-slate-900/95 p-6 sm:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-lg">
                {application.candidateName ? application.candidateName.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{application.candidateName}</h2>
                <p className="text-xs text-brand-300 font-medium">{application.candidateHeadline || 'Candidate'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Applied for <span className="text-white font-semibold">{application.jobTitle}</span></p>
              </div>
            </div>

            {/* Match Score Badge */}
            {application.matchScore !== null && (
              <div className="text-right flex-shrink-0">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>{Math.round(application.matchScore)}% Match</span>
                </div>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Candidate Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-850/60 border border-slate-800 text-xs text-slate-300 mb-6">
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{application.candidateEmail}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{application.candidatePhone || 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{application.candidateLocation || 'Remote'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{application.candidateYearsOfExperience || 0} Years Exp</span>
            </div>
            <div className="col-span-2 text-slate-400 font-mono text-[11px]">
              Applied: {new Date(application.appliedAt).toLocaleString()}
            </div>
          </div>

          {/* Quick Action Buttons (Schedule Interview & View Resume) */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Interview Round</span>
            </button>

            {application.resumeId && (
              <button
                type="button"
                onClick={() => setResumeModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Parsed Resume Profile</span>
              </button>
            )}
          </div>

          {/* AI Skill Breakdown */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">AI Skill Alignment Breakdown</h4>
            
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Matched Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {matchDetails.matchedSkills && matchDetails.matchedSkills.length > 0 ? (
                    matchDetails.matchedSkills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No direct keyword skill matches</span>
                  )}
                </div>
              </div>

              {matchDetails.missingSkills && matchDetails.missingSkills.length > 0 && (
                <div>
                  <span className="text-slate-400 block mb-1">Missing Requisition Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchDetails.missingSkills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Candidate Submission Pitch */}
          {application.candidateNotes && (
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Candidate Pitch / Cover Note</h4>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 whitespace-pre-line">
                "{application.candidateNotes}"
              </div>
            </div>
          )}

          {/* Recruiter Stage Transition & Feedback Form */}
          <form onSubmit={handleStatusUpdate} className="space-y-4 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                Advance Recruitment Stage *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition ${
                      status === opt.value
                        ? 'bg-brand-500/20 border-brand-500 text-white ring-1 ring-brand-500/40'
                        : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Internal Recruiter Notes & Candidate Feedback
              </label>
              <textarea
                rows={3}
                value={hrNotes}
                onChange={(e) => setHrNotes(e.target.value)}
                placeholder="e.g. Strong system architecture answers. Candidate shortlisted for round 1 technical interview..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-brand-500/25 transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Updating Stage...' : 'Save Stage & Notes'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Embedded Schedule Interview Modal */}
      <ScheduleInterviewModal
        application={application}
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onScheduled={() => {
          if (onUpdated) onUpdated();
          setStatus('INTERVIEW_SCHEDULED');
        }}
      />

      {/* Embedded Resume Viewer Modal */}
      {application.resumeId && (
        <ResumeViewerModal
          resumeId={application.resumeId}
          isOpen={resumeModalOpen}
          onClose={() => setResumeModalOpen(false)}
        />
      )}
    </>
  );
}
