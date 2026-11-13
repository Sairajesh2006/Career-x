import React, { useState } from 'react';
import { Check, GraduationCap, LogOut, Plus, Save, X } from 'lucide-react';
import { ProfileSetupPayload, SkillLevel, StudentProfile } from '../../types/careerx';

const COMMON_LANGUAGES = [
  'Java',
  'C++',
  'Python',
  'TypeScript',
  'JavaScript',
  'SQL',
  'Go',
  'C',
  'Kotlin',
  'Rust',
];

const DEGREE_OPTIONS = ['B.Tech', 'B.E.', 'B.Sc (CS/IT)', 'MCA', 'M.Tech', 'BCA', 'Other'];

const YEAR_OPTIONS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  'Final Year (4th Year)',
  'Postgraduate / Recent Graduate',
];

const ROLE_OPTIONS = [
  'Software Development Engineer (SDE)',
  'Full-Stack Developer',
  'Backend Engineer',
  'Frontend Engineer',
  'Data Scientist / ML Engineer',
  'Cloud / DevOps Engineer',
  'Product / Data Analyst',
];

interface ProfileFormViewProps {
  student: StudentProfile;
  isEditMode?: boolean;
  onSave: (payload: ProfileSetupPayload) => Promise<void>;
  onCancel?: () => void;
  onLogout?: () => void;
}

export const ProfileFormView: React.FC<ProfileFormViewProps> = ({
  student,
  isEditMode = false,
  onSave,
  onCancel,
  onLogout,
}) => {
  const [fullName, setFullName] = useState(student.fullName || '');
  const [college, setCollege] = useState(student.college || '');
  const [degree, setDegree] = useState(student.degree || 'B.Tech');
  const [branch, setBranch] = useState(student.branch || '');
  const [academicYear, setAcademicYear] = useState(student.academicYear || 'Final Year (4th Year)');
  const [cgpa, setCgpa] = useState(student.cgpa ? String(student.cgpa) : '');
  const [targetPackage, setTargetPackage] = useState(student.targetPackage || '');
  const [preferredRole, setPreferredRole] = useState(
    student.preferredRole || 'Software Development Engineer (SDE)'
  );
  const [languages, setLanguages] = useState<string[]>(student.languages || []);
  const [customLanguage, setCustomLanguage] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(student.skillLevel || 'Intermediate');
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(student.showOnLeaderboard ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((item) => item !== lang) : [...prev, lang].slice(0, 15)
    );
  };

  const handleAddCustomLanguage = () => {
    const trimmed = customLanguage.trim();
    if (!trimmed) return;
    if (!languages.includes(trimmed) && languages.length < 15) {
      setLanguages((prev) => [...prev, trimmed]);
    }
    setCustomLanguage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (college.trim().length < 2) {
      setError('Please enter your college or university name.');
      return;
    }
    if (branch.trim().length < 2) {
      setError('Please enter your academic branch or major.');
      return;
    }
    const parsedCgpa = Number(cgpa);
    if (Number.isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      setError('Please enter a valid CGPA between 0.0 and 10.0.');
      return;
    }
    if (!targetPackage.trim()) {
      setError('Please enter your target placement package (e.g., 12-18 LPA).');
      return;
    }
    if (languages.length === 0) {
      setError('Please select at least one programming language you know.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        fullName: fullName.trim(),
        college: college.trim(),
        degree,
        branch: branch.trim(),
        academicYear,
        cgpa: Number(parsedCgpa.toFixed(2)),
        targetPackage: targetPackage.trim(),
        preferredRole,
        languages,
        skillLevel,
        showOnLeaderboard,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your student profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={isEditMode ? 'w-full' : 'min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6'}>
      <div className={isEditMode ? 'w-full' : 'max-w-3xl mx-auto'}>
        {!isEditMode && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">CAREER-X</h1>
                <p className="text-xs text-slate-400">First-Time Student Profile Setup</p>
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditMode ? 'Edit Student Profile' : 'Complete Your Placement Profile'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isEditMode
                  ? 'Update your academic details, target role, and programming stack.'
                  : 'Your dashboard, roadmap, and AI mentor calibrate to these details. All progress starts at 0%.'}
              </p>
            </div>
            {isEditMode && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                aria-label="Close profile editor"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                College / University Name
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g., NIT Trichy / VIT Vellore"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Degree</label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {DEGREE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Branch / Specialization
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g., Computer Science & Engineering"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Current Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {YEAR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Current CGPA (0 – 10 scale)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="e.g., 8.45"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 tabular-nums focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Placement Package
              </label>
              <input
                type="text"
                value={targetPackage}
                onChange={(e) => setTargetPackage(e.target.value)}
                placeholder="e.g., 15-22 LPA"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Job Role
              </label>
              <select
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Technical Skill Level */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Current Technical Skill Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSkillLevel(level)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    skillLevel === level
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Programming Languages Known */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Programming Languages Known ({languages.length}/15 selected)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_LANGUAGES.map((lang) => {
                const selected = languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      selected
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    <span>{lang}</span>
                  </button>
                );
              })}
              {languages
                .filter((l) => !COMMON_LANGUAGES.includes(l))
                .map((custom) => (
                  <button
                    key={custom}
                    type="button"
                    onClick={() => toggleLanguage(custom)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-indigo-600 border-indigo-500 text-white flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3" />
                    <span>{custom}</span>
                  </button>
                ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomLanguage();
                  }
                }}
                placeholder="Add another language (e.g., Ruby, Swift)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCustomLanguage}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Public Leaderboard Opt-in */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnLeaderboard}
              onChange={(e) => setShowOnLeaderboard(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Show my non-private progress on the Campus Leaderboard
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Only your display name, college, target role, XP, and streak are visible. Your email, CGPA, applications, and resumes always stay private.
              </p>
            </div>
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            {isEditMode && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? 'Saving Profile...'
                  : isEditMode
                  ? 'Save Changes'
                  : 'Complete Setup & Open Dashboard'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
