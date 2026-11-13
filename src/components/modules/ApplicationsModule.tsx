import React, { useState } from 'react';
import { Briefcase, Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import {
  createJobApplication,
  deleteJobApplication,
  getTodayDateString,
  updateJobApplication,
} from '../../services/studentService';
import { ApplicationStatus, JobApplication, StudentProfile } from '../../types/careerx';

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Wishlist',
  'Applied',
  'OA / Assessment',
  'Technical Interview',
  'HR Round',
  'Offer',
  'Rejected',
];

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  Wishlist: 'text-slate-300 bg-slate-800 border-slate-700',
  Applied: 'text-blue-300 bg-blue-500/15 border-blue-500/30',
  'OA / Assessment': 'text-amber-300 bg-amber-500/15 border-amber-500/30',
  'Technical Interview': 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30',
  'HR Round': 'text-purple-300 bg-purple-500/15 border-purple-500/30',
  Offer: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
  Rejected: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
};

interface ApplicationsModuleProps {
  student: StudentProfile;
  applications: JobApplication[];
}

export const ApplicationsModule: React.FC<ApplicationsModuleProps> = ({ student, applications }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ApplicationStatus>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JobApplication | null>(null);

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [packageLpa, setPackageLpa] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [appliedDate, setAppliedDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingItem(null);
    setCompany('');
    setRole(student.preferredRole || '');
    setPackageLpa('');
    setLocation('');
    setStatus('Applied');
    setAppliedDate(getTodayDateString());
    setNotes('');
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (app: JobApplication) => {
    setEditingItem(app);
    setCompany(app.company);
    setRole(app.role);
    setPackageLpa(app.packageLpa);
    setLocation(app.location);
    setStatus(app.status);
    setAppliedDate(app.appliedDate);
    setNotes(app.notes);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      setError('Company name and job role are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editingItem) {
        await updateJobApplication(student.uid, editingItem.id, {
          company,
          role,
          packageLpa,
          location,
          status,
          appliedDate,
          notes,
        });
      } else {
        await createJobApplication(student, {
          company,
          role,
          packageLpa,
          location,
          status,
          appliedDate,
          notes,
        });
      }
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (app: JobApplication, nextStatus: ApplicationStatus) => {
    try {
      await updateJobApplication(student.uid, app.id, {
        company: app.company,
        role: app.role,
        packageLpa: app.packageLpa,
        location: app.location,
        status: nextStatus,
        appliedDate: app.appliedDate,
        notes: app.notes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJobApplication(student.uid, id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete application.');
    }
  };

  const filtered = applications.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <span>Placement Application Tracker</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track campus and off-campus applications, online assessments, and interview rounds.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company Application</span>
        </button>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {STATUS_OPTIONS.map((st) => {
          const count = applications.filter((a) => a.status === st).length;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(statusFilter === st ? 'All' : st)}
              className={`p-3 rounded-xl border text-left transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600/15 border-indigo-500'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <p className="text-xs text-slate-400 truncate">{st}</p>
              <p className="text-xl font-bold text-white font-mono tabular-nums mt-1">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company or role..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'All' | ApplicationStatus)}
          className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="All">All Pipeline Stages</option>
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Applications Table / Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">
            {applications.length === 0 ? 'No job applications logged yet' : 'No matching applications'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {applications.length === 0
              ? 'Add your first target company or active placement application to track assessment dates and interview stages.'
              : 'Try adjusting your search query or pipeline stage filter.'}
          </p>
          {applications.length === 0 && (
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log First Application</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 bg-slate-950/60">
                  <th className="py-3.5 px-5 font-medium">Company & Location</th>
                  <th className="py-3.5 px-4 font-medium">Role</th>
                  <th className="py-3.5 px-4 font-medium">Package</th>
                  <th className="py-3.5 px-4 font-medium">Applied Date</th>
                  <th className="py-3.5 px-4 font-medium">Stage</th>
                  <th className="py-3.5 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-white">{app.company}</p>
                      <p className="text-xs text-slate-500">{app.location || 'Location TBD'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">{app.role}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-400 tabular-nums">
                      {app.packageLpa || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400 tabular-nums">
                      {app.appliedDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleQuickStatus(app, e.target.value as ApplicationStatus)}
                        aria-label={`Status for ${app.company}`}
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg border focus:outline-none ${STATUS_STYLE[app.status]}`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st} className="bg-slate-950 text-slate-100">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(app)}
                          aria-label={`Edit ${app.company}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(app.id)}
                          aria-label={`Delete ${app.company}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Application Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingItem ? 'Edit Application Details' : 'Add Placement Job Application'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Atlassian"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Role</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., SDE Intern / New Grad"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Package (CTC)</label>
                  <input
                    type="text"
                    value={packageLpa}
                    onChange={(e) => setPackageLpa(e.target.value)}
                    placeholder="e.g., 28 LPA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Bengaluru / Remote"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Stage</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Applied Date</label>
                  <input
                    type="date"
                    required
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Referral / Round Info</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="OA deadline, recruiter contact, or topics asked..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-xs font-semibold text-white"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Update Application' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};
