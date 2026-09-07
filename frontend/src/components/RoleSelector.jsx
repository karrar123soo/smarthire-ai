import React, { useState } from 'react';
import { UserCheck, Briefcase, ChevronRight, CheckCircle, Award, Target, FileCheck, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RoleSelector({ onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('hr');
  const { isAuthenticated, quickDemoLogin } = useAuth();

  return (
    <section id="roles" className="py-20 bg-slate-900/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-brand-400 text-xs font-semibold uppercase tracking-wider">
            Tailored Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Dedicated Portals for Recruiters & Candidates
          </h2>
          <p className="text-slate-400 mt-4 text-base">
            Role-based authorization powered by Spring Security and JWT tokens.
          </p>

          {/* Toggle Pills */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:inline-flex sm:flex-row p-1.5 rounded-2xl sm:rounded-xl bg-slate-850 border border-slate-750 gap-1.5 sm:gap-0 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('hr')}
              className={`flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 rounded-xl sm:rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'hr'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>HR Recruiter Portal</span>
            </button>
            <button
              onClick={() => setActiveTab('candidate')}
              className={`flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 rounded-xl sm:rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'candidate'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Candidate Portal</span>
            </button>
          </div>
        </div>

        {/* Dynamic Card Display */}
        <div className="max-w-5xl mx-auto">
          {activeTab === 'hr' ? (
            <div className="p-5 sm:p-8 md:p-10 rounded-3xl glass-card border border-indigo-500/30 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase mb-4 border border-indigo-500/20">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Recruiter Operating System</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                    Complete Control Over Hiring Pipelines
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                    Post openings with required skill criteria, filter applications dynamically, inspect AI match scores, schedule interview rounds, and monitor hiring KPIs in real-time.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      'Post, edit, and archive job requisitions with required skills',
                      'Rank applicants by AI match score & missing skill breakdowns',
                      'Schedule Technical & HR rounds with feedback scorecards',
                      'Recruitment analytics: conversion funnel, total hires, pipeline load'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-3 text-xs text-slate-300">
                        <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:space-x-3">
                    <button
                      type="button"
                      onClick={() => onOpenAuth && onOpenAuth('register', 'ROLE_HR')}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition"
                    >
                      <span>Create Recruiter Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => quickDemoLogin && quickDemoLogin('hr')}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center transition"
                    >
                      <span>1-Click Demo HR</span>
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-300">Recruiter Dashboard Snapshot</span>
                    <span className="text-[11px] font-mono text-emerald-400">● LIVE DEMO PREVIEW</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Active Jobs</p>
                      <p className="text-xl font-bold text-white">12</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Total Applicants</p>
                      <p className="text-xl font-bold text-brand-400">148</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Shortlisted</p>
                      <p className="text-xl font-bold text-emerald-400">28</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Interviews</p>
                      <p className="text-xl font-bold text-purple-400">9</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-850 border border-slate-800 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-300 font-medium truncate pr-2">Senior Java Engineer</span>
                      <span className="text-xs font-bold text-emerald-400 flex-shrink-0">94% Match</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-8 md:p-10 rounded-3xl glass-card border border-purple-500/30 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-purple-500/10 text-purple-300 text-xs font-semibold uppercase mb-4 border border-purple-500/20">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Candidate Career Hub</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                    Fast-Track Your Job Search With AI
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                    Upload your resume, have your skills automatically recognized and cataloged, discover tailored jobs, apply with one click, and track interview invitations.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      'Instant resume upload with automatic skill vector extraction',
                      'Real-time job match percentage and skill gap breakdown',
                      'Application tracker with live status updates (Shortlisted / Interview / Offer)',
                      'Interview schedule with meeting link details and interviewer notes'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-3 text-xs text-slate-300">
                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:space-x-3">
                    <button
                      type="button"
                      onClick={() => onOpenAuth && onOpenAuth('register', 'ROLE_CANDIDATE')}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition"
                    >
                      <span>Create Candidate Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => quickDemoLogin && quickDemoLogin('candidate')}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center transition"
                    >
                      <span>1-Click Demo Candidate</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-300">Candidate Profile Snapshot</span>
                    <span className="text-[11px] font-mono text-purple-400">● AI PARSED</span>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                    <p className="text-xs font-semibold text-white">Extracted Skills</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['Java 17', 'Spring Boot', 'MySQL', 'React', 'Docker', 'REST API', 'Hibernate'].map((s, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-850 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Full-Stack Java Lead Application</span>
                      <span className="text-emerald-400 font-semibold">Shortlisted</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Interview Round: Technical</span>
                      <span>Tomorrow, 3:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
