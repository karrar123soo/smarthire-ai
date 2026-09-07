import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import {
  Sparkles,
  Bot,
  Layers,
  ShieldCheck,
  Activity,
  User,
  LogOut,
  UserCheck,
  Briefcase,
  Settings,
  Compass,
  Send,
  Users,
  Calendar,
  BarChart3,
  FileText,
  Bell
} from 'lucide-react';

export default function Navbar({
  isBackendOnline,
  currentView,
  onViewChange,
  onOpenAuth,
  onOpenProfile,
  onOpenNotifications,
  unreadCount = 0,
}) {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div
            onClick={() => onViewChange('landing')}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-white/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-white">SmartHire</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">ENTERPRISE RECRUITMENT</p>
            </div>
          </div>

          {/* Navigation Links & View Switchers */}
          <nav className="hidden md:flex items-center space-x-5 lg:space-x-6">
            <button
              onClick={() => onViewChange('landing')}
              className={`text-xs font-semibold transition ${
                currentView === 'landing' ? 'text-brand-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => onViewChange('jobs')}
              className={`flex items-center space-x-1.5 text-xs font-semibold transition ${
                currentView === 'jobs' ? 'text-brand-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Jobs</span>
            </button>

            {/* Candidate-specific nav links */}
            {isAuthenticated && role === 'ROLE_CANDIDATE' && (
              <>
                <button
                  onClick={() => onViewChange('my-applications')}
                  className={`flex items-center space-x-1.5 text-xs font-semibold transition ${
                    currentView === 'my-applications' ? 'text-brand-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-brand-400" />
                  <span>My Applications</span>
                </button>

                <button
                  onClick={() => onViewChange('interviews')}
                  className={`flex items-center space-x-1.5 text-xs font-semibold transition ${
                    currentView === 'interviews' ? 'text-brand-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  <span>Interviews</span>
                </button>

                <button
                  onClick={() => onViewChange('resume-parser')}
                  className={`flex items-center space-x-1.5 text-xs font-semibold transition ${
                    currentView === 'resume-parser' ? 'text-purple-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Resume</span>
                </button>
              </>
            )}

            {/* HR-specific nav links */}
            {isAuthenticated && role === 'ROLE_HR' && (
              <>
                <button
                  onClick={() => onViewChange('hr-jobs')}
                  className={`flex items-center space-x-1.5 text-xs font-semibold transition ${
                    currentView === 'hr-jobs' ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Requisitions</span>
                </button>

                <button
                  onClick={() => onViewChange('hr-pipeline')}
                  className={`flex items-center space-x-1.5 text-xs font-semibold transition ${
                    currentView === 'hr-pipeline' ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pipeline</span>
                </button>

                <button
                  onClick={() => onViewChange('interviews')}
                  className={`flex items-center space-x-1.5 text-xs font-semibold transition ${
                    currentView === 'interviews' ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Interviews</span>
                </button>

                <button
                  onClick={() => onViewChange('analytics')}
                  className={`flex items-center space-x-1.5 text-xs font-semibold transition ${
                    currentView === 'analytics' ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Analytics</span>
                </button>
              </>
            )}

            <a href="#status" className="text-xs font-medium text-slate-400 hover:text-white transition flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Diagnostics</span>
            </a>
          </nav>

          {/* Status & Auth Area */}
          <div className="flex items-center space-x-3">
            {/* Backend status badge */}
            <div className="hidden xl:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-slate-300 font-mono text-[11px]">
                {isBackendOnline ? 'API : ONLINE' : 'API : PROBING'}
              </span>
            </div>

            {/* Notification Bell Button */}
            {isAuthenticated && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-brand-500 text-white rounded-full text-[10px] font-mono font-black flex items-center justify-center border-2 border-slate-950 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Swagger doc button */}
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 transition shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>Swagger</span>
            </a>

            {/* User Session / Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 pr-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                      {user.fullName}
                    </div>
                    <div className="text-[10px] text-brand-400 font-mono">
                      {role === 'ROLE_HR' ? 'HR Recruiter' : 'Candidate'}
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    onClick={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 rounded-2xl glass-card bg-slate-900 border border-slate-750 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white">{user.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {role === 'ROLE_HR' ? 'Recruiter Account' : 'Candidate Account'}
                      </span>
                    </div>

                    {role === 'ROLE_HR' ? (
                      <>
                        <button
                          onClick={() => onViewChange('hr-pipeline')}
                          className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center space-x-2.5 transition"
                        >
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Candidate Pipeline</span>
                        </button>
                        <button
                          onClick={() => onViewChange('hr-jobs')}
                          className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center space-x-2.5 transition"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Manage Requisitions</span>
                        </button>
                        <button
                          onClick={() => onViewChange('interviews')}
                          className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center space-x-2.5 transition"
                        >
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Interview Schedule</span>
                        </button>
                        <button
                          onClick={() => onViewChange('analytics')}
                          className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center space-x-2.5 transition"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Executive Analytics</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onViewChange('my-applications')}
                          className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center space-x-2.5 transition"
                        >
                          <Send className="w-3.5 h-3.5 text-brand-400" />
                          <span>My Applications</span>
                        </button>
                        <button
                          onClick={() => onViewChange('interviews')}
                          className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center space-x-2.5 transition"
                        >
                          <Calendar className="w-3.5 h-3.5 text-brand-400" />
                          <span>My Interviews</span>
                        </button>
                        <button
                          onClick={() => onViewChange('resume-parser')}
                          className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center space-x-2.5 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-400" />
                          <span>Resume & AI Parser</span>
                        </button>
                        <button
                          onClick={() => onViewChange('jobs')}
                          className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center space-x-2.5 transition"
                        >
                          <Compass className="w-3.5 h-3.5 text-brand-400" />
                          <span>Browse Job Openings</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={onOpenProfile}
                      className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center space-x-2.5 transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-brand-400" />
                      <span>Edit Profile & Skills</span>
                    </button>

                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2.5 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-850 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-500/20 transition"
                >
                  Get Started
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
