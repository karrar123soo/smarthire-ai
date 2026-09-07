import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LiveStatusWidget from './components/LiveStatusWidget';
import FeatureGrid from './components/FeatureGrid';
import RoleSelector from './components/RoleSelector';
import Footer from './components/Footer';
import AuthModal from './components/auth/AuthModal';
import ProfileModal from './components/profile/ProfileModal';
import JobBoardView from './components/jobs/JobBoardView';
import HRJobsManager from './components/jobs/HRJobsManager';
import JobDetailModal from './components/jobs/JobDetailModal';
import ApplyModal from './components/applications/ApplyModal';
import MyApplicationsView from './components/applications/MyApplicationsView';
import HRPipelineManager from './components/applications/HRPipelineManager';
import InterviewCalendarView from './components/interviews/InterviewCalendarView';
import AnalyticsDashboardView from './components/analytics/AnalyticsDashboardView';
import ResumeUploader from './components/resume/ResumeUploader';
import NotificationDrawer from './components/notifications/NotificationDrawer';
import { notificationService } from './services/notificationService';

function MainLayout() {
  const { isAuthenticated, role } = useAuth();
  const [currentView, setCurrentView] = useState('landing');
  // 'landing' | 'jobs' | 'hr-jobs' | 'my-applications' | 'hr-pipeline' | 'interviews' | 'analytics' | 'resume-parser'
  
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login', role: 'ROLE_CANDIDATE' });
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Job & Application modals
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  // Poll unread notification count when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const checkUnread = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        if (typeof res?.data === 'number') {
          setUnreadCount(res.data);
        }
      } catch (ignored) {}
    };

    checkUnread();
    const interval = setInterval(checkUnread, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const openAuth = (mode = 'login', role = 'ROLE_CANDIDATE') => {
    setAuthModal({ isOpen: true, mode, role });
  };

  const closeAuth = () => {
    setAuthModal({ ...authModal, isOpen: false });
  };

  const handleApplyPrompt = (job) => {
    if (!isAuthenticated) {
      openAuth('login', 'ROLE_CANDIDATE');
    } else if (role !== 'ROLE_CANDIDATE') {
      alert('Only candidate accounts can submit job applications. Please sign in with a candidate account.');
    } else {
      setSelectedJobForApply(job);
    }
  };

  const handleApplicationSubmitted = (job) => {
    alert(`Application for "${job.title}" has been submitted successfully! You can track its status in "My Applications".`);
    setCurrentView('my-applications');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        isBackendOnline={isBackendOnline}
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenAuth={openAuth}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Main Content Areas based on currentView */}
      <main className="flex-grow">
        {currentView === 'landing' && (
          <>
            <Hero
              onOpenAuth={openAuth}
              onExploreJobs={() => setCurrentView('jobs')}
              onOpenHRHub={() => {
                if (isAuthenticated && role === 'ROLE_HR') {
                  setCurrentView('hr-jobs');
                } else {
                  openAuth('login', 'ROLE_HR');
                }
              }}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <JobBoardView onApplyPrompt={handleApplyPrompt} />
            </div>
            <LiveStatusWidget onStatusChange={setIsBackendOnline} />
            <FeatureGrid />
            <RoleSelector onOpenAuth={openAuth} />
          </>
        )}

        {currentView === 'jobs' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <JobBoardView onApplyPrompt={handleApplyPrompt} />
          </div>
        )}

        {currentView === 'my-applications' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {isAuthenticated && role === 'ROLE_CANDIDATE' ? (
              <MyApplicationsView onExploreJobs={() => setCurrentView('jobs')} />
            ) : (
              <div className="py-20 text-center glass-card rounded-3xl p-8 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white mb-2">Candidate Sign In Required</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Please sign in with a candidate account to view and track your job applications.
                </p>
                <button
                  onClick={() => openAuth('login', 'ROLE_CANDIDATE')}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition"
                >
                  Sign In as Candidate
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'hr-jobs' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {isAuthenticated && role === 'ROLE_HR' ? (
              <HRJobsManager onViewJobDetails={setSelectedJobForDetails} />
            ) : (
              <div className="py-20 text-center glass-card rounded-3xl p-8 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white mb-2">Recruiter Authentication Required</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Please sign in with an authorized HR Recruiter account to access job requisition management.
                </p>
                <button
                  onClick={() => openAuth('login', 'ROLE_HR')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                >
                  Sign In as HR Recruiter
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'hr-pipeline' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {isAuthenticated && role === 'ROLE_HR' ? (
              <HRPipelineManager />
            ) : (
              <div className="py-20 text-center glass-card rounded-3xl p-8 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white mb-2">Recruiter Authentication Required</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Please sign in with an authorized HR Recruiter account to access the recruitment pipeline.
                </p>
                <button
                  onClick={() => openAuth('login', 'ROLE_HR')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                >
                  Sign In as HR Recruiter
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'interviews' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {isAuthenticated ? (
              <InterviewCalendarView />
            ) : (
              <div className="py-20 text-center glass-card rounded-3xl p-8 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white mb-2">Sign In Required</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Please sign in to view and manage your interview schedules.
                </p>
                <button
                  onClick={() => openAuth('login')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {isAuthenticated && role === 'ROLE_HR' ? (
              <AnalyticsDashboardView />
            ) : (
              <div className="py-20 text-center glass-card rounded-3xl p-8 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white mb-2">Recruiter Authentication Required</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Executive analytics are restricted to authorized HR Recruiter accounts.
                </p>
                <button
                  onClick={() => openAuth('login', 'ROLE_HR')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                >
                  Sign In as HR Recruiter
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'resume-parser' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {isAuthenticated && role === 'ROLE_CANDIDATE' ? (
              <ResumeUploader />
            ) : (
              <div className="py-20 text-center glass-card rounded-3xl p-8 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white mb-2">Candidate Sign In Required</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Please sign in with a candidate account to upload and parse your resume.
                </p>
                <button
                  onClick={() => openAuth('login', 'ROLE_CANDIDATE')}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition"
                >
                  Sign In as Candidate
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuth}
        initialMode={authModal.mode}
        initialRole={authModal.role}
      />

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Detailed Job Requisition Modal */}
      <JobDetailModal
        job={selectedJobForDetails}
        isOpen={!!selectedJobForDetails}
        onClose={() => setSelectedJobForDetails(null)}
        onApplyPrompt={(j) => {
          setSelectedJobForDetails(null);
          handleApplyPrompt(j);
        }}
      />

      {/* Apply to Job Modal */}
      <ApplyModal
        job={selectedJobForApply}
        isOpen={!!selectedJobForApply}
        onClose={() => setSelectedJobForApply(null)}
        onApplied={handleApplicationSubmitted}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
