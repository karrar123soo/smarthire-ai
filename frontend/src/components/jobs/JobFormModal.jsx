import React, { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService';
import { X, Briefcase, Plus, Save, AlertCircle, Sparkles } from 'lucide-react';

const POPULAR_SKILLS = [
  'Java', 'Spring Boot', 'React', 'TypeScript', 'JavaScript', 'Python',
  'MySQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS',
  'Microservices', 'RESTful APIs', 'Tailwind CSS', 'Git / GitHub', 'Machine Learning'
];

export default function JobFormModal({ isOpen, onClose, jobToEdit = null, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    jobType: 'FULL_TIME',
    experienceYearsRequired: 3,
    minSalary: '',
    maxSalary: '',
    status: 'OPEN',
    description: '',
    requiredSkills: '',
  });

  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        title: jobToEdit.title || '',
        department: jobToEdit.department || '',
        location: jobToEdit.location || '',
        jobType: jobToEdit.jobType || 'FULL_TIME',
        experienceYearsRequired: jobToEdit.experienceYearsRequired || 0,
        minSalary: jobToEdit.minSalary || '',
        maxSalary: jobToEdit.maxSalary || '',
        status: jobToEdit.status || 'OPEN',
        description: jobToEdit.description || '',
        requiredSkills: jobToEdit.requiredSkills ? jobToEdit.requiredSkills.join(', ') : '',
      });
    } else {
      setFormData({
        title: '',
        department: 'Engineering',
        location: 'Remote',
        jobType: 'FULL_TIME',
        experienceYearsRequired: 3,
        minSalary: '120000',
        maxSalary: '150000',
        status: 'OPEN',
        description: '',
        requiredSkills: 'Java, Spring Boot, MySQL',
      });
    }
    setError('');
  }, [jobToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkillChip = (skillName) => {
    const currentList = formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    if (!currentList.includes(skillName)) {
      currentList.push(skillName);
      setFormData({ ...formData, requiredSkills: currentList.join(', ') });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title: formData.title.trim(),
      department: formData.department.trim(),
      location: formData.location.trim(),
      jobType: formData.jobType,
      experienceYearsRequired: parseInt(formData.experienceYearsRequired, 10) || 0,
      minSalary: formData.minSalary ? parseFloat(formData.minSalary) : null,
      maxSalary: formData.maxSalary ? parseFloat(formData.maxSalary) : null,
      status: formData.status,
      description: formData.description.trim(),
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      if (jobToEdit && jobToEdit.id) {
        await jobService.updateJob(jobToEdit.id, payload);
      } else {
        await jobService.createJob(payload);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save job requisition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl glass-card border border-slate-750 bg-slate-900/95 p-6 sm:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase mb-2 border border-indigo-500/20">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Recruiter Job Publisher</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {jobToEdit ? 'Edit Job Requisition' : 'Post New Job Requisition'}
          </h2>
          <p className="text-xs text-slate-400">
            Define requirements, salary expectations, and skill prerequisites for automated AI matching.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Job Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Full-Stack Java Engineer"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Backend Engineering"
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA (Remote)"
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Job Type *</label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="REMOTE">Remote</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Experience Required (Years)</label>
              <input
                type="number"
                name="experienceYearsRequired"
                min={0}
                value={formData.experienceYearsRequired}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Min Salary (USD/yr)</label>
              <input
                type="number"
                name="minSalary"
                value={formData.minSalary}
                onChange={handleChange}
                placeholder="120000"
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Max Salary (USD/yr)</label>
              <input
                type="number"
                name="maxSalary"
                value={formData.maxSalary}
                onChange={handleChange}
                placeholder="160000"
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Requisition Status</label>
            <div className="flex space-x-3">
              {['OPEN', 'DRAFT', 'CLOSED'].map((st) => (
                <label key={st} className="inline-flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={st}
                    checked={formData.status === st}
                    onChange={handleChange}
                    className="text-brand-500 focus:ring-brand-500"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Required Skills (Comma-separated)</label>
            <input
              type="text"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              placeholder="Java, Spring Boot, React, MySQL, AWS, Docker"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
            
            {/* Quick Skill Tags Picker */}
            <div className="mt-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Quick Add Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSkillChip(s)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-brand-500/20 hover:text-brand-300 border border-slate-700 text-slate-400 transition"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Job Description & Responsibilities *</label>
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Detail the day-to-day responsibilities, mission, stack details, and candidate qualifications..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-brand-500/25 transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : jobToEdit ? 'Save Requisition Changes' : 'Publish Requisition'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
