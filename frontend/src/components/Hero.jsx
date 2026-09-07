import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Cpu, Database, Shield, Zap, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Hero({ onOpenAuth }) {
  const { isAuthenticated, user, role } = useAuth();

  return (
    <section className="relative pt-12 pb-20 overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Release / Status Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Spring Boot 3 + Spring Security + JWT Authentication Live</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          AI-Powered Recruitment & Candidate Matching Engine
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          SmartHire AI streamlines hiring workflows with automated resume skill extraction, intelligent candidate-to-job matching, HR interview scheduling, and enterprise analytics.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto max-w-md sm:max-w-none mx-auto">
          {isAuthenticated && user ? (
            <div className="inline-flex items-center space-x-3 px-5 sm:px-6 py-3 rounded-xl bg-slate-900 border border-brand-500/40 text-slate-200 w-full sm:w-auto justify-center text-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
              <span className="text-xs sm:text-sm font-medium">Logged in as <strong className="text-white">{user.fullName}</strong> ({role === 'ROLE_HR' ? 'HR Recruiter' : 'Candidate'})</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('register', 'ROLE_HR')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-brand-500/25 transition transform active:scale-95 text-xs sm:text-sm"
              >
                <Briefcase className="w-4 h-4" />
                <span>Hire Talent as HR</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('register', 'ROLE_CANDIDATE')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-500/25 transition transform active:scale-95 text-xs sm:text-sm"
              >
                <UserCheck className="w-4 h-4" />
                <span>Apply as Candidate</span>
              </button>
            </>
          )}

          <a
            href="#status"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 font-medium transition text-xs sm:text-sm"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>View Live Diagnostics</span>
          </a>
        </div>

        {/* Key Features Badges */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl glass-panel flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Matching Engine</p>
              <p className="text-sm font-semibold text-white">AI Skill Scoring</p>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Relational Store</p>
              <p className="text-sm font-semibold text-white">MySQL 8.0 JPA</p>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Security Layer</p>
              <p className="text-sm font-semibold text-white">JWT + BCrypt</p>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">API Documentation</p>
              <p className="text-sm font-semibold text-white">OpenAPI 3 / Swagger</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
