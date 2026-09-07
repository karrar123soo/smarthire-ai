import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import {
  TrendingUp,
  BarChart3,
  Users,
  Briefcase,
  Calendar,
  Sparkles,
  Award,
  RefreshCw,
  AlertCircle,
  PieChart,
  Layers,
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';

export default function AnalyticsDashboardView() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await analyticsService.getDashboardAnalytics();
      if (res && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Unable to load analytics metrics. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center glass-card rounded-3xl p-8 border border-slate-800">
        <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
        <p className="text-slate-300 text-sm font-semibold">Generating Executive Recruitment Analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="py-12">
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error || 'No analytics data available.'}</span>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-white font-semibold transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const funnel = analytics.funnel || {};
  const maxSkillCount = analytics.topInDemandSkills?.length > 0
    ? Math.max(...analytics.topInDemandSkills.map((s) => s.jobCount || 1))
    : 1;

  return (
    <section className="py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Executive Intelligence & BI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recruitment Funnel & AI Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time talent acquisition velocity, AI match distribution, skill demand heatmaps, and funnel conversion rates.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 transition flex items-center space-x-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top 5 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-3xl glass-card border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pipeline</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{analytics.totalApplications}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Applications received</p>
        </div>

        <div className="p-4 rounded-3xl glass-card border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Requisitions</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {analytics.openJobs} <span className="text-xs text-slate-500 font-normal">/ {analytics.totalJobs}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Active open jobs</p>
        </div>

        <div className="p-4 rounded-3xl glass-card border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Interviews</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{analytics.totalInterviews}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Rounds conducted</p>
        </div>

        <div className="p-4 rounded-3xl glass-card border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Offers / Hired</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{funnel.hired || 0}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            {funnel.hireConversionRate ? `${Math.round(funnel.hireConversionRate)}% hire rate` : 'Conversion velocity'}
          </p>
        </div>

        <div className="p-4 rounded-3xl glass-card border border-slate-800 bg-slate-900/80 shadow-lg col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg AI Score</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {analytics.overallAverageMatchScore ? `${Math.round(analytics.overallAverageMatchScore)}%` : 'N/A'}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Profile keyword match</p>
        </div>
      </div>

      {/* Main Grid: Funnel & AI Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recruitment Funnel Conversion Bar */}
        <div className="lg:col-span-2 glass-card border border-slate-800 rounded-3xl p-6 bg-slate-900/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Recruitment Funnel Conversion
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {analytics.totalApplications} Total Candidates
              </span>
            </div>

            <div className="space-y-4">
              {/* Step 1: Applied */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-blue-300">1. Applied Stage</span>
                  <span className="text-white font-mono">{funnel.totalApplied || 0} candidates (100%)</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Step 2: Under Review */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-amber-300">2. Under Review</span>
                  <span className="text-white font-mono">
                    {funnel.underReview || 0} candidates ({Math.round(funnel.reviewConversionRate || 0)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, funnel.reviewConversionRate || 0))}%` }}
                  />
                </div>
              </div>

              {/* Step 3: Shortlisted */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-purple-300">3. Shortlisted</span>
                  <span className="text-white font-mono">
                    {funnel.shortlisted || 0} candidates ({Math.round(funnel.shortlistConversionRate || 0)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, funnel.shortlistConversionRate || 0))}%` }}
                  />
                </div>
              </div>

              {/* Step 4: Interview Scheduled */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-indigo-300">4. Interview Round</span>
                  <span className="text-white font-mono">
                    {funnel.interviewScheduled || 0} candidates ({Math.round(funnel.interviewConversionRate || 0)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, funnel.interviewConversionRate || 0))}%` }}
                  />
                </div>
              </div>

              {/* Step 5: Hired */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-emerald-300">5. Hired / Accepted</span>
                  <span className="text-white font-mono">
                    {funnel.hired || 0} candidates ({Math.round(funnel.hireConversionRate || 0)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, funnel.hireConversionRate || 0))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Rejected / Disqualified: <strong className="text-rose-400">{funnel.rejected || 0}</strong> candidates</span>
            <span>Funnel Throughput: <strong className="text-emerald-400">{Math.round(funnel.hireConversionRate || 0)}%</strong></span>
          </div>
        </div>

        {/* AI Match Score Distribution */}
        <div className="glass-card border border-slate-800 rounded-3xl p-6 bg-slate-900/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Match Score Spread
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Algorithm semantic and keyword score categorization across candidate pool.
            </p>

            <div className="space-y-3">
              {analytics.matchScoreDistribution &&
                Object.entries(analytics.matchScoreDistribution).map(([range, count]) => (
                  <div key={range} className="p-3 rounded-2xl bg-slate-850/80 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300">{range} Alignment</span>
                      <span className="font-mono font-bold text-white">{count} candidates</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                        style={{
                          width: `${
                            analytics.totalApplications > 0
                              ? (count / analytics.totalApplications) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Semantic Threshold</span>
            <span className="text-purple-300 font-mono font-bold">&ge; 70% Strong Match</span>
          </div>
        </div>
      </div>

      {/* Skills Demand Heatmap & Applications by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top In-Demand Skills */}
        <div className="glass-card border border-slate-800 rounded-3xl p-6 bg-slate-900/80 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Most In-Demand Skills in Requisitions
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Top technology competencies requested by active job postings.
          </p>

          <div className="space-y-3">
            {analytics.topInDemandSkills && analytics.topInDemandSkills.length > 0 ? (
              analytics.topInDemandSkills.map((skill, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{skill.skillName}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {skill.jobCount} jobs ({Math.round(skill.demandPercentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-indigo-500 h-full rounded-full"
                      style={{ width: `${(skill.jobCount / maxSkillCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No skill demand data available yet.</p>
            )}
          </div>
        </div>

        {/* Applications by Department */}
        <div className="glass-card border border-slate-800 rounded-3xl p-6 bg-slate-900/80 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Applications by Department
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Volume of incoming candidate submissions distributed across organizational divisions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analytics.applicationsByDepartment &&
              Object.entries(analytics.applicationsByDepartment).map(([dept, count]) => (
                <div
                  key={dept}
                  className="p-4 rounded-2xl bg-slate-850/70 border border-slate-850 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{dept}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Department</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono font-bold text-sm">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
