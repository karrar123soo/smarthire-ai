import React, { useState, useEffect } from 'react';
import { resumeService } from '../../services/resumeService';
import { X, FileText, CheckCircle2, Award, Briefcase, GraduationCap, Calendar, RefreshCw } from 'lucide-react';

export default function ResumeViewerModal({ resume: initialResume, resumeId, isOpen, onClose, onSyncProfile }) {
  const [resume, setResume] = useState(initialResume);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialResume) {
      setResume(initialResume);
    } else if (resumeId && isOpen) {
      setLoading(true);
      setError('');
      resumeService.getResumeById(resumeId)
        .then((res) => {
          if (res && res.data) {
            setResume(res.data);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch resume by ID:', err);
          setError('Unable to load resume details.');
        })
        .finally(() => setLoading(false));
    }
  }, [initialResume, resumeId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl glass-card border border-slate-750 bg-slate-900/95 p-6 sm:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-200">Loading resume profile...</p>
          </div>
        ) : error || !resume ? (
          <div className="py-12 text-center text-rose-300 text-xs">
            <p>{error || 'No resume data available.'}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{resume.fileName}</h2>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                  <span>{resume.fileType || 'PDF Document'}</span>
                  <span>•</span>
                  <span>{(resume.fileSize / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Extracted Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-850/70 border border-slate-800 mb-6 text-xs">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-brand-400" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Experience</span>
                  <span className="text-white font-bold">{resume.extractedYearsOfExperience || 4}+ Years</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Education</span>
                  <span className="text-white font-bold truncate max-w-[150px]">{resume.extractedEducation || 'B.S. CS'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Parsed Skills</span>
                  <span className="text-emerald-300 font-bold">{resume.extractedSkills ? resume.extractedSkills.length : 0} Identified</span>
                </div>
              </div>
            </div>

            {/* Extracted Skills Chips */}
            <div className="mb-6 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Extracted Skills Catalog</h4>
              <div className="flex flex-wrap gap-1.5">
                {resume.extractedSkills && resume.extractedSkills.length > 0 ? (
                  resume.extractedSkills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-brand-500/15 text-brand-300 border border-brand-500/30 text-xs font-mono">
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No skills extracted</span>
                )}
              </div>
            </div>

            {/* Raw Text Excerpt */}
            <div className="mb-6 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Parsed Document Text</h4>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                {resume.rawTextPreview || 'No preview text available'}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Close
              </button>

              {onSyncProfile && (
                <button
                  onClick={() => onSyncProfile(resume)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-brand-500/25 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sync All to Candidate Profile</span>
                </button>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
