import React from 'react';
import { Search, Filter, RotateCcw, MapPin, Briefcase, SlidersHorizontal } from 'lucide-react';

export default function JobFilterBar({ filters, onFilterChange, onReset }) {
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value, page: 0 });
  };

  const handleExpChange = (e) => {
    const val = e.target.value;
    if (val === 'entry') {
      onFilterChange({ ...filters, minExperience: 0, maxExperience: 2, page: 0 });
    } else if (val === 'mid') {
      onFilterChange({ ...filters, minExperience: 3, maxExperience: 5, page: 0 });
    } else if (val === 'senior') {
      onFilterChange({ ...filters, minExperience: 6, maxExperience: null, page: 0 });
    } else {
      onFilterChange({ ...filters, minExperience: null, maxExperience: null, page: 0 });
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl glass-card border border-slate-800 space-y-3 mb-8">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={filters.keyword || ''}
          onChange={(e) => handleChange('keyword', e.target.value)}
          placeholder="Search by role title, technologies (e.g. Java, React, AWS), department, or location..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
        />
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Job Type Dropdown */}
        <div>
          <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1 tracking-wider">Job Type</label>
          <select
            value={filters.jobType || ''}
            onChange={(e) => handleChange('jobType', e.target.value || null)}
            className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="">All Job Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="REMOTE">Remote</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        {/* Experience Level Dropdown */}
        <div>
          <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1 tracking-wider">Experience Level</label>
          <select
            onChange={handleExpChange}
            defaultValue=""
            className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="">Any Experience</option>
            <option value="entry">Entry Level (0 – 2 yrs)</option>
            <option value="mid">Mid Level (3 – 5 yrs)</option>
            <option value="senior">Senior Lead (6+ yrs)</option>
          </select>
        </div>

        {/* Location Dropdown / Input */}
        <div>
          <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1 tracking-wider">Location / Remote</label>
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g. Remote, Austin..."
            className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Sort & Reset Actions */}
        <div className="flex items-end space-x-2">
          <div className="flex-grow">
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1 tracking-wider">Sort Order</label>
            <select
              value={`${filters.sortBy || 'createdAt'}-${filters.sortDir || 'desc'}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                onFilterChange({ ...filters, sortBy: sb, sortDir: sd, page: 0 });
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="maxSalary-desc">Salary: High to Low</option>
              <option value="experienceYearsRequired-asc">Exp: Low to High</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onReset}
            title="Reset Filters"
            className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
