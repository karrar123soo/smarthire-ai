import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import QuickDemoLogin from './QuickDemoLogin';
import { X, Lock, Mail, User, Phone, Briefcase, UserCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', initialRole = 'ROLE_CANDIDATE' }) {
  const { login, register, error, setError } = useAuth();
  
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [role, setRole] = useState(initialRole); // 'ROLE_CANDIDATE' | 'ROLE_HR'
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    headline: '',
    yearsOfExperience: 3,
    skills: 'Java, Spring Boot, React, MySQL',
    companyName: '',
    department: 'Engineering Recruitment',
    designation: 'Talent Acquisition Partner',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError('');

    try {
      if (mode === 'login') {
        const res = await login(formData.email, formData.password);
        if (res.success) {
          onClose();
        } else {
          setLocalError(res.error || 'Failed to login');
        }
      } else {
        // Register mode
        const payload = {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          role: role,
          headline: role === 'ROLE_CANDIDATE' ? formData.headline : undefined,
          yearsOfExperience: role === 'ROLE_CANDIDATE' ? parseInt(formData.yearsOfExperience, 10) : undefined,
          skills: role === 'ROLE_CANDIDATE' ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          companyName: role === 'ROLE_HR' ? formData.companyName : undefined,
          department: role === 'ROLE_HR' ? formData.department : undefined,
          designation: role === 'ROLE_HR' ? formData.designation : undefined,
        };

        const res = await register(payload);
        if (res.success) {
          onClose();
        } else {
          setLocalError(res.error || 'Failed to register');
        }
      }
    } catch (err) {
      setLocalError(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl glass-card border border-slate-750 bg-slate-900/95 p-6 sm:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-1.5 rounded-xl bg-slate-850 border border-slate-750 mb-4">
            <button
              onClick={() => { setMode('login'); setLocalError(''); }}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${
                mode === 'login' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setLocalError(''); }}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${
                mode === 'register' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back to SmartHire AI' : 'Join SmartHire AI Recruitment'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Access candidate matching, job requisitions, and interview pipelines'
              : 'Set up your role-based recruiting or job application profile'}
          </p>
        </div>

        {/* 1-Click Demo Logins */}
        {mode === 'login' && (
          <div className="mb-6">
            <QuickDemoLogin onLoggedIn={onClose} />
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-3 bg-slate-900 text-[11px] uppercase tracking-wider text-slate-500">
                Or Sign In With Email
              </span>
            </div>
          </div>
        )}

        {/* Role Selector (Register Mode) */}
        {mode === 'register' && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('ROLE_CANDIDATE')}
                className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition ${
                  role === 'ROLE_CANDIDATE'
                    ? 'border-purple-500/80 bg-purple-500/10 text-white'
                    : 'border-slate-800 bg-slate-850/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <UserCheck className={`w-4 h-4 ${role === 'ROLE_CANDIDATE' ? 'text-purple-400' : ''}`} />
                <div>
                  <div className="text-xs font-bold">Candidate</div>
                  <div className="text-[10px] text-slate-400">Seeking Opportunities</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('ROLE_HR')}
                className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition ${
                  role === 'ROLE_HR'
                    ? 'border-indigo-500/80 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-850/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Briefcase className={`w-4 h-4 ${role === 'ROLE_HR' ? 'text-indigo-400' : ''}`} />
                <div>
                  <div className="text-xs font-bold">HR Recruiter</div>
                  <div className="text-[10px] text-slate-400">Hiring Talent</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {(localError || error) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Jordan Miller"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          {/* Conditional Registration Fields */}
          {mode === 'register' && role === 'ROLE_CANDIDATE' && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                Candidate Profile Details
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Professional Headline</label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g. Senior Java / React Engineer"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Years of Exp</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    min={0}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="Java, Spring Boot, React"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'register' && role === 'ROLE_HR' && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                Recruiter Organization Details
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Cloud Corp"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <span>{submitting ? 'Authenticating...' : mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
