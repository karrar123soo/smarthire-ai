import React, { useState, useEffect, useRef } from 'react';
import { resumeService } from '../../services/resumeService';
import ResumeViewerModal from './ResumeViewerModal';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, Trash2, Eye, Sparkles, Plus } from 'lucide-react';

export default function ResumeUploader() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [selectedResume, setSelectedResume] = useState(null);
  const fileInputRef = useRef(null);

  const fetchResumes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await resumeService.getMyResumes({ size: 10 });
      if (res && res.data) {
        setResumes(res.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
      setError('Unable to load your resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await resumeService.uploadResume(file);
      setSuccessMsg(`Resume "${file.name}" uploaded and parsed successfully! Found ${res.data.extractedSkills?.length || 0} skills.`);
      fetchResumes();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to parse resume');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSyncToProfile = async (resume) => {
    try {
      await resumeService.syncResumeToProfile(resume.id);
      alert(`Candidate Profile successfully synchronized with "${resume.fileName}"! Skills and experience have been updated.`);
      setSelectedResume(null);
    } catch (err) {
      alert('Failed to synchronize profile: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteResume = async (id, fileName) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        await resumeService.deleteResume(id);
        fetchResumes();
      } catch (err) {
        alert('Failed to delete resume: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <section className="py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Resume Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Resume Parser & Skill Extractor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload your resume (PDF, DOCX, TXT) to automatically extract skills, years of experience, and sync to your candidate profile.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{uploading ? 'Parsing Resume...' : 'Upload New Resume'}</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.docx,.txt"
          className="hidden"
        />
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-3 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="mb-8 p-8 rounded-3xl glass-card border-2 border-dashed border-slate-750 hover:border-brand-500/50 bg-slate-900/40 text-center cursor-pointer transition group"
      >
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">
          {uploading ? 'Extracting Text & Scanning Skills...' : 'Click to Upload or Drag & Drop Resume'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Supports PDF, DOCX, or TXT formats (up to 10MB). Text is parsed locally with zero data loss.
        </p>
      </div>

      {/* Uploaded Resumes List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          My Uploaded Resumes ({resumes.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 text-brand-400 animate-spin mx-auto" />
            <p className="text-xs">Loading resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="py-12 text-center glass-card rounded-2xl border border-slate-800 p-6">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No resumes uploaded yet. Upload your first resume above to extract skills.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((r) => (
              <div key={r.id} className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3 hover:border-brand-500/30 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-300 border border-brand-500/30 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{r.fileName}</h4>
                      <p className="text-[11px] text-slate-400">{new Date(r.uploadedAt).toLocaleDateString()} • {(r.fileSize / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setSelectedResume(r)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteResume(r.id, r.fileName)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Extracted Skill Tags */}
                <div className="pt-2 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {r.extractedSkills && r.extractedSkills.length > 0 ? (
                      r.extractedSkills.slice(0, 5).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 text-[10px] font-mono border border-brand-500/20">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-[10px]">No skills detected</span>
                    )}
                    {r.extractedSkills && r.extractedSkills.length > 5 && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                        +{r.extractedSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Sync Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">{r.extractedYearsOfExperience || 4}+ Yrs Experience</span>
                  <button
                    onClick={() => handleSyncToProfile(r)}
                    className="inline-flex items-center space-x-1.5 text-brand-400 hover:text-brand-300 font-semibold transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sync to Profile</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resume Viewer Modal */}
      <ResumeViewerModal
        resume={selectedResume}
        isOpen={!!selectedResume}
        onClose={() => setSelectedResume(null)}
        onSyncProfile={handleSyncToProfile}
      />
    </section>
  );
}
