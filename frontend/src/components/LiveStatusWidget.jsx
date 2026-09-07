import React, { useState, useEffect } from 'react';
import { healthApi } from '../services/api';
import { Activity, Database, Server, RefreshCw, CheckCircle, AlertTriangle, Clock, Layers } from 'lucide-react';

export default function LiveStatusWidget({ onStatusChange }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await healthApi.getSystemInfo();
      if (res && res.data) {
        setHealthData(res.data);
        if (onStatusChange) {
          onStatusChange(res.data.status === 'UP');
        }
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch health info:', err);
      setError('Backend service connecting or not yet started on port 8080.');
      if (onStatusChange) {
        onStatusChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="status" className="py-12 bg-slate-900/60 border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" />
              <span>Real-Time Health & Diagnostic Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Backend & Database Health Probe
            </h2>
          </div>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Probing...' : 'Refresh Status'}</span>
          </button>
        </div>

        {/* Diagnostic Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Spring Boot Service Card */}
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Spring Boot Service</h3>
                  <p className="text-xs text-slate-400">Java 17 / Port 8080</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                healthData?.status === 'UP' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {healthData?.status === 'UP' ? 'STATUS: UP' : 'PENDING'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Application Name:</span>
                <span className="font-mono text-slate-200">{healthData?.serviceName || 'smarthire-backend'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Version:</span>
                <span className="font-mono text-slate-200">{healthData?.version || '1.0.0-PROD'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Environment:</span>
                <span className="font-mono text-brand-300">{healthData?.environment || 'development'}</span>
              </div>
            </div>
          </div>

          {/* MySQL Database Card */}
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">MySQL Database</h3>
                  <p className="text-xs text-slate-400">smarthire_ai_db / Port 3306</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                healthData?.databaseStatus === 'UP'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {healthData?.databaseStatus === 'UP' ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Driver & Dialect:</span>
                <span className="font-mono text-slate-200">MySQL 8.0 / JPA</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Entities Loaded:</span>
                <span className="font-mono text-slate-200">9 Relational Tables</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Connection Pool:</span>
                <span className="font-mono text-emerald-400">HikariCP Active</span>
              </div>
            </div>
          </div>

          {/* Runtime & Memory Telemetry Card */}
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">JVM & System Metrics</h3>
                  <p className="text-xs text-slate-400">Runtime Telemetry</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-slate-400 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{lastRefreshed || 'Just now'}</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Used Memory:</span>
                <span className="font-mono text-slate-200">
                  {healthData?.metrics?.usedMemoryMb ? `${healthData.metrics.usedMemoryMb} MB` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Allocated:</span>
                <span className="font-mono text-slate-200">
                  {healthData?.metrics?.totalMemoryMb ? `${healthData.metrics.totalMemoryMb} MB` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Available CPU Cores:</span>
                <span className="font-mono text-purple-300">
                  {healthData?.metrics?.availableProcessors || 'Multi-core'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Readiness Banner */}
        {healthData?.features && (
          <div className="mt-6 p-4 rounded-xl glass-panel flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-300 font-medium">
              Active Subsystems Ready for Phase 2:
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(healthData.features).map(([key, enabled]) => (
                <span
                  key={key}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-850 text-slate-300 border border-slate-750"
                >
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>{key}</span>
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
