import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { X, User, Briefcase, Lock, CheckCircle, AlertCircle, Save, Building, MapPin, GraduationCap, Globe } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, role, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Candidate state
  const [candidateForm, setCandidateForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    headline: '',
    summary: '',
    yearsOfExperience: 0,
    location: '',
    education: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    skills: '',
  });

  // HR state
  const [hrForm, setHrForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    department: '',
    designation: '',
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (isOpen && user) {
      loadProfileData();
    }
  }, [isOpen, user]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      if (role === 'ROLE_CANDIDATE') {
        const res = await authService.getCandidateProfile();
        if (res && res.data) {
          const d = res.data;
          setCandidateForm({
            fullName: d.fullName || user.fullName || '',
            phoneNumber: d.phoneNumber || user.phoneNumber || '',
            headline: d.headline || '',
            summary: d.summary || '',
            yearsOfExperience: d.yearsOfExperience || 0,
            location: d.location || '',
            education: d.education || '',
            linkedinUrl: d.linkedinUrl || '',
            githubUrl: d.githubUrl || '',
            portfolioUrl: d.portfolioUrl || '',
            skills: d.skills ? d.skills.join(', ') : '',
          });
        }
      } else if (role === 'ROLE_HR') {
        const res = await authService.getHRProfile();
        if (res && res.data) {
          const d = res.data;
          setHrForm({
            fullName: d.fullName || user.fullName || '',
            phoneNumber: d.phoneNumber || user.phoneNumber || '',
            companyName: d.companyName || '',
            companyWebsite: d.companyWebsite || '',
            companyDescription: d.companyDescription || '',
            department: d.department || '',
            designation: d.designation || '',
          });
        }
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const payload = {
        ...candidateForm,
        yearsOfExperience: parseInt(candidateForm.yearsOfExperience, 10) || 0,
        skills: candidateForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      };
      await authService.updateCandidateProfile(payload);
      setMsg({ type: 'success', text: 'Candidate profile updated successfully!' });
      await refreshProfile();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleHRSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await authService.updateHRProfile(hrForm);
      setMsg({ type: 'success', text: 'HR Recruiter profile updated successfully!' });
      await refreshProfile();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl glass-card border border-slate-750 bg-slate-900/95 p-6 sm:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{user.fullName}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-mono">{user.email}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {role === 'ROLE_HR' ? 'HR Recruiter' : 'Candidate'}
                </span>
              </div>
            </div>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-850 border border-slate-750">
            <button
              onClick={() => { setActiveTab('profile'); setMsg({ type: '', text: '' }); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'profile' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => { setActiveTab('security'); setMsg({ type: '', text: '' }); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'security' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Security
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {msg.text && (
          <div className={`mb-6 p-3.5 rounded-xl text-xs flex items-center space-x-2.5 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}>
            {msg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Tab 1: Profile Form */}
        {activeTab === 'profile' && (
          role === 'ROLE_CANDIDATE' ? (
            <form onSubmit={handleCandidateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={candidateForm.fullName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, fullName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={candidateForm.phoneNumber}
                    onChange={(e) => setCandidateForm({ ...candidateForm, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={candidateForm.headline}
                  onChange={(e) => setCandidateForm({ ...candidateForm, headline: e.target.value })}
                  placeholder="e.g. Senior Full-Stack Java Engineer"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Professional Summary</label>
                <textarea
                  rows={3}
                  value={candidateForm.summary}
                  onChange={(e) => setCandidateForm({ ...candidateForm, summary: e.target.value })}
                  placeholder="Tell recruiters about your core expertise, achievements, and career goals..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    value={candidateForm.yearsOfExperience}
                    onChange={(e) => setCandidateForm({ ...candidateForm, yearsOfExperience: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={candidateForm.location}
                    onChange={(e) => setCandidateForm({ ...candidateForm, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA (Remote)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={candidateForm.skills}
                  onChange={(e) => setCandidateForm({ ...candidateForm, skills: e.target.value })}
                  placeholder="Java, Spring Boot, React, MySQL, AWS, Docker"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={candidateForm.linkedinUrl}
                    onChange={(e) => setCandidateForm({ ...candidateForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">GitHub URL</label>
                  <input
                    type="text"
                    value={candidateForm.githubUrl}
                    onChange={(e) => setCandidateForm({ ...candidateForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Portfolio</label>
                  <input
                    type="text"
                    value={candidateForm.portfolioUrl}
                    onChange={(e) => setCandidateForm({ ...candidateForm, portfolioUrl: e.target.value })}
                    placeholder="https://myportfolio.dev"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving Changes...' : 'Save Candidate Profile'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleHRSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={hrForm.fullName}
                    onChange={(e) => setHrForm({ ...hrForm, fullName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={hrForm.phoneNumber}
                    onChange={(e) => setHrForm({ ...hrForm, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={hrForm.companyName}
                    onChange={(e) => setHrForm({ ...hrForm, companyName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company Website</label>
                  <input
                    type="text"
                    value={hrForm.companyWebsite}
                    onChange={(e) => setHrForm({ ...hrForm, companyWebsite: e.target.value })}
                    placeholder="https://company.example.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={hrForm.department}
                    onChange={(e) => setHrForm({ ...hrForm, department: e.target.value })}
                    placeholder="Engineering Talent Acquisition"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={hrForm.designation}
                    onChange={(e) => setHrForm({ ...hrForm, designation: e.target.value })}
                    placeholder="Lead Technical Recruiter"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company Overview</label>
                <textarea
                  rows={3}
                  value={hrForm.companyDescription}
                  onChange={(e) => setHrForm({ ...hrForm, companyDescription: e.target.value })}
                  placeholder="Describe your organization mission, engineering culture, and perks..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving Changes...' : 'Save Recruiter Profile'}</span>
              </button>
            </form>
          )
        )}

        {/* Tab 2: Security / Password Form */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
