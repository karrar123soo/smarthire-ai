import React from 'react';
import { Bot, FileText, Briefcase, Calendar, Bell, BarChart3, CheckCircle2, Search, Sliders } from 'lucide-react';

export default function FeatureGrid() {
  const features = [
    {
      icon: Bot,
      color: 'from-blue-500 to-indigo-600',
      title: 'AI Resume & Skill Matcher',
      description: 'Automatically compares candidate skill vectors with job prerequisites, computes exact match percentage, highlights missing skills, and ranks top talent.',
      points: ['Multi-skill vector scoring', 'Missing skill gap analysis', 'Automated talent ranking']
    },
    {
      icon: FileText,
      color: 'from-indigo-500 to-purple-600',
      title: 'Resume Extraction Engine',
      description: 'Parses uploaded PDF and Word resumes, extracts categorized skills, past experiences, and structured metadata directly into the MySQL database.',
      points: ['Multipart file upload pipeline', 'Deep skill categorization', 'Instant profile sync']
    },
    {
      icon: Briefcase,
      color: 'from-purple-500 to-pink-600',
      title: 'HR Job & Applicant Management',
      description: 'End-to-end recruitment management: create and update job postings, review applicant profiles, filter candidates, and trigger status updates.',
      points: ['Full CRUD job board', 'Keyword & status filtering', 'One-click shortlist / reject']
    },
    {
      icon: Calendar,
      color: 'from-amber-500 to-orange-600',
      title: 'Interview Scheduling Suite',
      description: 'Coordinate technical and HR interviews with automated meeting links, date-time sync, candidate notifications, and interviewer scorecards.',
      points: ['Calendar slot booking', 'Custom interview types', 'Recruiter rating & feedback']
    },
    {
      icon: Bell,
      color: 'from-emerald-500 to-teal-600',
      title: 'Real-Time Notification Hub',
      description: 'Keep candidates and recruiters aligned with instant status updates for application progress, shortlisting, and scheduled rounds.',
      points: ['Application status alerts', 'Interview invitation prompts', 'Unread badges & history']
    },
    {
      icon: BarChart3,
      color: 'from-rose-500 to-red-600',
      title: 'Recruitment Analytics & Insights',
      description: 'Interactive analytics dashboard displaying total jobs, candidate volume, application conversion rates, and hiring pipeline metrics.',
      points: ['Active pipeline breakdown', 'Time-to-hire metrics', 'Selection yield statistics']
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-400 text-xs font-semibold uppercase tracking-wider">
            Full-Spectrum Recruitment Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Built for Modern Hiring Teams & Top Candidates
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            SmartHire AI unites advanced NLP skill matching with robust Spring Boot micro-services to accelerate time-to-hire.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="p-7 rounded-2xl glass-card relative group hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white mb-6 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  {feat.points.map((pt, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
