import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Briefcase, Building, DollarSign, Calendar, CheckCircle2, ExternalLink } from 'lucide-react';

export default function Placements() {
  const [placements, setPlacements] = useState([
    {
      id: 1,
      company_name: 'Google Cloud Platform',
      job_role: 'Software Development Engineer I',
      salary_package: '18 - 24 LPA',
      eligibility_criteria: 'CSE/IT B.Tech 2026 Passouts • CGPA >= 7.5',
      deadline: '2026-08-25',
      interview_schedule: 'Written Test on 28 Aug 2026',
      applied: false,
    },
    {
      id: 2,
      title: 'TATA Consultancy Services (TCS Digital)',
      company_name: 'TCS Digital',
      job_role: 'Systems Engineer & Cloud Associate',
      salary_package: '7.5 - 9.0 LPA',
      eligibility_criteria: 'All B.Tech Branches • No Active Backlogs',
      deadline: '2026-08-30',
      interview_schedule: 'NQT Test Online in Sept',
      applied: false,
    },
    {
      id: 3,
      company_name: 'Amazon Web Services (AWS)',
      job_role: 'Cloud Support Engineer',
      salary_package: '14 - 16 LPA',
      eligibility_criteria: 'CSE/ECE B.Tech 2026 Batch • CGPA >= 7.0',
      deadline: '2026-09-05',
      interview_schedule: 'Virtual Assessment',
      applied: false,
    },
  ]);

  const [appliedIds, setAppliedIds] = useState({});

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        const res = await api.get('/placements/');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPlacements(res.data);
        }
      } catch (e) {}
    };
    fetchPlacements();
  }, []);

  const handleApply = (id) => {
    setAppliedIds({ ...appliedIds, [id]: true });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Campus Placement Portal</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Official campus recruitment drives, company roles, & application portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {placements.map((job) => (
          <div key={job.id} className="glass-card p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{job.company_name}</h3>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{job.job_role}</span>
                  </div>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {job.salary_package}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p><strong>Eligibility:</strong> {job.eligibility_criteria}</p>
                <p><strong>Schedule:</strong> {job.interview_schedule || 'To be communicated'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Deadline: {job.deadline}</span>
              </span>

              {appliedIds[job.id] ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Application Submitted</span>
                </span>
              ) : (
                <button
                  onClick={() => handleApply(job.id)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                >
                  Apply Opportunity
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
