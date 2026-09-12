import React from 'react';
import { Bot, Shield, Code2, Database, Sparkles, Heart, Terminal } from 'lucide-react';
import { getBackendOrigin, API_BASE_URL } from '../services/api';

export default function Footer() {
  const backendOrigin = getBackendOrigin();
  const swaggerUrl = `${backendOrigin}/swagger-ui.html`;
  const apiDocsUrl = `${backendOrigin}/v3/api-docs`;
  const healthUrl = `${API_BASE_URL}/health`;
  const jobsUrl = `${API_BASE_URL}/jobs`;

  return (
    <footer id="architecture" className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-white tracking-tight">SmartHire AI</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  v1.0
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              AI-Powered Recruitment Management System built with clean Spring Boot 3 microservices architecture, React 18, Hibernate JPA, Spring Security, JWT authentication, and intelligent automated candidate matching.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {['Java 17', 'Spring Boot 3.3', 'Hibernate JPA', 'MySQL 8.0', 'Spring Security', 'JWT', 'React 18', 'Tailwind CSS', 'Vite', 'OpenAPI / Swagger'].map((tech, i) => (
                <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Architecture Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Architecture & REST API
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href={swaggerUrl} target="_blank" rel="noreferrer" className="hover:text-brand-400 transition flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-brand-400" />
                  <span>Interactive Swagger UI</span>
                </a>
              </li>
              <li>
                <a href={apiDocsUrl} target="_blank" rel="noreferrer" className="hover:text-brand-400 transition flex items-center space-x-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>OpenAPI Schema JSON</span>
                </a>
              </li>
              <li>
                <a href={healthUrl} target="_blank" rel="noreferrer" className="hover:text-brand-400 transition flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Health Diagnostics</span>
                </a>
              </li>
              <li>
                <a href={jobsUrl} target="_blank" rel="noreferrer" className="hover:text-brand-400 transition flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Public Job Requisitions</span>
                </a>
              </li>
            </ul>
          </div>

          {/* System Relational Entities */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Relational JPA Schema
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
              <li>● User & Role</li>
              <li>● CandidateProfile & HRProfile</li>
              <li>● Job & Skill Catalog</li>
              <li>● Application & Recruitment Pipeline</li>
              <li>● Interview Schedule & Feedback</li>
              <li>● In-App Notification Center</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Developer Credit */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>© {new Date().getFullYear()} SmartHire AI System. All rights reserved.</span>
          </div>

          {/* Professional Developer Credit Badge */}
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-750 shadow-inner">
            <span className="text-slate-400 text-xs">Developed by</span>
            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 font-mono tracking-wide">
              Karrar Raza
            </span>
            <Sparkles className="w-3.5 h-3.5 text-brand-400 ml-1" />
          </div>

          <div className="flex items-center space-x-4 text-slate-500 font-mono text-[11px]">
            <span>Full-Stack Enterprise Edition</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
