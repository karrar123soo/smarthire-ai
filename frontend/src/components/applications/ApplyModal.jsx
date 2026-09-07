import React, { useState } from 'react';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { X, Send, Sparkles, CheckCircle2, AlertCircle, Building, MapPin, DollarSign } from 'lucide-react';

export default function ApplyModal({ job, isOpen, onClose, onApplied }) {
  const { user } = useAuth();
  const [candidateNotes, setCandidateNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !job) return null;

  const candidateSkills = user?.skills || [];
  const requiredSkills = job.requiredSkills || [];

  const matchedSkills = requiredSkills.filter(s =>
    candidateSkills.some(cs => cs.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = requiredSkills.filter(s =>
    !candidateSkills.some(cs => cs.toLowerCase() === s.toLowerCase())
  );

  const matchPct = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await applicationService.applyToJob(job.id, candidateNotes);
      if (onApplied) onApplied(job);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit application');
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

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-brand-500/10 text-brand-300 text-xs font-semibold uppercase mb-2 border border-brand-500/20">
            <Send className="w-3.5 h-3.5" />
            <span>Job Application Submission</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Apply for {job.title}
          </h2>
          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
            <span>{job.companyName || 'TechNova Solutions'}</span>
            <span>•</span>
            <span>{job.location || 'Remote'}</span>
          </div>
        </div>

        {/* AI Skill Alignment Card */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-850/80 border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Automated Skill Match: {matchPct}%</span>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {matchedSkills.length}/{requiredSkills.length} Skills Matched
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${matchPct}%` }}
            />
          </div>

          {/* Matched & Missing Chips */}
          <div className="pt-2 text-[11px] space-y-1.5">
            {matchedSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 mr-1">Matched:</span>
                {matchedSkills.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                    ✓ {s}
                  </span>
                ))}
              </div>
            )}
            {missingSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 mr-1">Missing:</span>
                {missingSkills.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Cover Pitch & Notes to Recruiter (Optional)
            </label>
            <textarea
              rows={4}
              value={candidateNotes}
              onChange={(e) => setCandidateNotes(e.target.value)}
              placeholder="Highlight relevant projects, architectural experience, or why you are a great fit for this team..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            Applying as <span className="font-semibold text-white">{user?.fullName}</span> ({user?.email}) with profile headline <span className="text-brand-300">"{user?.headline || 'Engineer'}"</span>.
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
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
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting Application...' : 'Confirm & Submit Application'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
