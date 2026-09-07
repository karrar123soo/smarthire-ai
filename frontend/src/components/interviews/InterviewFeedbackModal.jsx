import React, { useState } from 'react';
import { interviewService } from '../../services/interviewService';
import { X, Star, Award, MessageSquare, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function InterviewFeedbackModal({ interview, isOpen, onClose, onFeedbackSubmitted }) {
  const [rating, setRating] = useState(8);
  const [feedback, setFeedback] = useState('');
  const [technicalScore, setTechnicalScore] = useState(8);
  const [problemSolvingScore, setProblemSolvingScore] = useState(8);
  const [communicationScore, setCommunicationScore] = useState(8);
  const [cultureFitScore, setCultureFitScore] = useState(8);
  const [advanceStatus, setAdvanceStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !interview) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        rating: parseInt(rating, 10),
        feedback: feedback.trim(),
        technicalScore: parseInt(technicalScore, 10),
        problemSolvingScore: parseInt(problemSolvingScore, 10),
        communicationScore: parseInt(communicationScore, 10),
        cultureFitScore: parseInt(cultureFitScore, 10),
        advanceApplicationStatus: advanceStatus || null,
      };

      await interviewService.submitFeedback(interview.id, payload);
      if (onFeedbackSubmitted) onFeedbackSubmitted();
      onClose();
    } catch (err) {
      console.error('Submit feedback error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit interview feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl glass-card border border-slate-750 bg-slate-900/95 p-6 sm:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-5 border-b border-slate-800 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Interview Evaluation & Scorecard</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Candidate: <span className="text-white font-semibold">{interview.candidateName}</span> &bull; {interview.jobTitle}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Overall Rating Slider & Number */}
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Overall Interview Score (1 - 10) *</span>
              </label>
              <span className="text-lg font-mono font-black text-amber-400">
                {rating} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full accent-amber-500 h-2 bg-slate-750 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>1 - Poor</span>
              <span>5 - Average</span>
              <span>8 - Strong</span>
              <span>10 - Exceptional</span>
            </div>
          </div>

          {/* Multi-Dimensional Competency Ratings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3 rounded-xl bg-slate-850 border border-slate-750">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Technical Depth:</span>
                <span className="text-indigo-400 font-mono font-bold">{technicalScore}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={technicalScore}
                onChange={(e) => setTechnicalScore(e.target.value)}
                className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-850 border border-slate-750">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Problem Solving:</span>
                <span className="text-indigo-400 font-mono font-bold">{problemSolvingScore}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={problemSolvingScore}
                onChange={(e) => setProblemSolvingScore(e.target.value)}
                className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-850 border border-slate-750">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Communication:</span>
                <span className="text-indigo-400 font-mono font-bold">{communicationScore}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={communicationScore}
                onChange={(e) => setCommunicationScore(e.target.value)}
                className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-850 border border-slate-750">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Culture Fit:</span>
                <span className="text-indigo-400 font-mono font-bold">{cultureFitScore}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={cultureFitScore}
                onChange={(e) => setCultureFitScore(e.target.value)}
                className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Qualitative Written Feedback */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detailed Assessment & Evaluation Notes *
            </label>
            <textarea
              required
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Candidate demonstrated deep understanding of Spring Boot, concurrency, and SQL indexing. Communication was concise and professional..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Advance Application Stage */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Decision & Stage Progression
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setAdvanceStatus('')}
                className={`p-2.5 rounded-xl text-xs font-medium border text-center transition ${
                  advanceStatus === ''
                    ? 'bg-slate-750 border-slate-600 text-white font-bold'
                    : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-white'
                }`}
              >
                Keep in Interview Stage
              </button>

              <button
                type="button"
                onClick={() => setAdvanceStatus('HIRED')}
                className={`p-2.5 rounded-xl text-xs font-medium border text-center transition ${
                  advanceStatus === 'HIRED'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-emerald-300'
                }`}
              >
                ✓ Advance to Hired / Offer
              </button>

              <button
                type="button"
                onClick={() => setAdvanceStatus('REJECTED')}
                className={`p-2.5 rounded-xl text-xs font-medium border text-center transition ${
                  advanceStatus === 'REJECTED'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                    : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-rose-300'
                }`}
              >
                ✕ Reject Application
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>{loading ? 'Submitting Scorecard...' : 'Submit Evaluation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
