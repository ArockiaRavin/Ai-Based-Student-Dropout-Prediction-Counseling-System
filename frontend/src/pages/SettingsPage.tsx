import React, { useEffect, useState } from 'react';
import {
  Settings,
  Building,
  Bell,
  Cpu,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Shield,
  RefreshCw,
  Sliders,
  Info,
  Sparkles,
  Server,
  Activity
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, role, loginAs, canManageSettings } = useAuth();
  const [settings, setSettings] = useState<any>({
    institution_name: 'National Institute of Engineering & Technology',
    academic_year: '2026 - 2027',
    active_ml_model: 'Random Forest',
    high_risk_threshold: '65.0',
    medium_risk_threshold: '35.0',
    email_notifications_enabled: 'true',
    auto_alert_counselor: 'true'
  });
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getSettings();
      if (res.settings) {
        setSettings((prev: any) => ({ ...prev, ...res.settings }));
      }
      setStats(res.database_stats || null);
      setAuditLogs(res.audit_logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      showToast('Settings saved successfully!');
      loadSettings();
    } catch (err: any) {
      showToast(err.message || 'Error saving settings', 'error');
    }
  };

  const handleResetDemoData = async () => {
    try {
      setResetting(true);
      const res = await api.resetDemoData();
      showToast(res.message || 'Demo data successfully reset!');
      setIsResetConfirmOpen(false);
      loadSettings();
    } catch (err: any) {
      showToast(err.message || 'Error resetting demo data', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto text-slate-100">
      {/* Toast Notification */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-xl animate-in fade-in slide-in-from-top-4 ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Settings className="w-6 h-6 text-cyan-400" />
          </div>
          System Settings & Platform Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure institutional metadata, AI risk classification thresholds, notification triggers, and demonstration telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSaveSettings}
            className="p-6 sm:p-7 rounded-3xl bg-[#0B1224]/85 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 text-xs"
          >
            {/* Institution Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2.5 border-b border-white/10">
                <Building className="w-4 h-4 text-cyan-400" />
                Institution Details & Session Metadata
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Institution Name</label>
                  <input
                    type="text"
                    disabled={!canManageSettings}
                    value={settings.institution_name || ''}
                    onChange={e => setSettings({ ...settings, institution_name: e.target.value })}
                    className="w-full bg-[#070B18] border border-white/10 rounded-xl p-3 text-slate-200 disabled:opacity-50 focus:outline-hidden focus:border-indigo-400 font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Academic Year</label>
                  <input
                    type="text"
                    disabled={!canManageSettings}
                    value={settings.academic_year || ''}
                    onChange={e => setSettings({ ...settings, academic_year: e.target.value })}
                    className="w-full bg-[#070B18] border border-white/10 rounded-xl p-3 text-slate-200 disabled:opacity-50 focus:outline-hidden focus:border-indigo-400 font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            {/* AI Threshold Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2.5 border-b border-white/10">
                <Cpu className="w-4 h-4 text-indigo-400" />
                AI Risk Classification Thresholds
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-300 font-medium">High Risk Cutoff</label>
                    <span className="font-mono font-bold text-rose-400 text-sm">&ge; {settings.high_risk_threshold || '65.0'}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="1"
                    disabled={!canManageSettings}
                    value={settings.high_risk_threshold || '65.0'}
                    onChange={e => setSettings({ ...settings, high_risk_threshold: e.target.value })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">Triggers emergency counselor notification</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-300 font-medium">Medium Risk Cutoff</label>
                    <span className="font-mono font-bold text-amber-400 text-sm">&ge; {settings.medium_risk_threshold || '35.0'}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="50"
                    step="1"
                    disabled={!canManageSettings}
                    value={settings.medium_risk_threshold || '35.0'}
                    onChange={e => setSettings({ ...settings, medium_risk_threshold: e.target.value })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">Watchlist early-intervention cohort</span>
                </div>
              </div>
            </div>

            {/* Notification Rules */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2.5 border-b border-white/10">
                <Bell className="w-4 h-4 text-amber-400" />
                Automated Counselor Notification Rules
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 cursor-pointer hover:bg-white/[0.06] transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.auto_alert_counselor === 'true' || settings.auto_alert_counselor === true}
                    onChange={e => setSettings({ ...settings, auto_alert_counselor: e.target.checked ? 'true' : 'false' })}
                    disabled={!canManageSettings}
                    className="mt-0.5 rounded accent-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-slate-200 block">Auto-create counselor alert upon High-Risk prediction detection</span>
                    <span className="text-[11px] text-slate-400">Places student immediately into counselor priority attention queue.</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 cursor-pointer hover:bg-white/[0.06] transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.email_notifications_enabled === 'true' || settings.email_notifications_enabled === true}
                    onChange={e => setSettings({ ...settings, email_notifications_enabled: e.target.checked ? 'true' : 'false' })}
                    disabled={!canManageSettings}
                    className="mt-0.5 rounded accent-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-slate-200 block">Dispatch weekly retention summaries to Department Heads</span>
                    <span className="text-[11px] text-slate-400">Summarizes cohort attrition risk by department every Monday morning.</span>
                  </div>
                </label>
              </div>
            </div>

            {canManageSettings && (
              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Save Configuration
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Database Stats & Reset Demo Data (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Database Health Card */}
          <div className="p-6 rounded-3xl bg-[#0B1224]/85 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2.5 border-b border-white/10">
              <Database className="w-4 h-4 text-cyan-400" />
              Database Engine & Persistence Telemetry
            </h3>
            {stats && (
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-indigo-400" />
                    Database Engine:
                  </span>
                  <span className="font-mono font-bold text-white">{stats.db_engine}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-slate-400">Total Enrolled Records:</span>
                  <span className="font-mono font-bold text-cyan-400">{stats.total_students} students</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-slate-400">Historical Risk Predictions:</span>
                  <span className="font-mono font-bold text-cyan-400">{stats.total_predictions} assessments</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-slate-400">Counseling Sessions:</span>
                  <span className="font-mono font-bold text-cyan-400">{stats.counseling_sessions} logs</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-slate-400">Active Interventions:</span>
                  <span className="font-mono font-bold text-cyan-400">{stats.interventions} cases</span>
                </div>
              </div>
            )}
          </div>

          {/* Demonstration Data Reset Card */}
          <div className="p-6 rounded-3xl bg-[#0B1224]/85 border border-rose-500/20 backdrop-blur-xl shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2 pb-2.5 border-b border-rose-500/20">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              Demonstration Environment Reset
            </h3>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Resetting will clear custom changes and re-seed the relational database with 60 realistic demonstration students, model predictions, and counselor cases across all 5 engineering departments.
            </p>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-full py-3 rounded-xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold transition-all shadow-md"
            >
              Reset Demonstration Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Demo Reset */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B18]/85 backdrop-blur-md">
          <div className="bg-[#0B1224] border border-rose-500/30 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-white">Reset Demonstration Database?</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                This will delete any newly added student or counseling records and restore the initial 60 realistic students across Computer Science, IT, ECE, EEE, and Mechanical Engineering.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleResetDemoData}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-semibold hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/25 disabled:opacity-60 transition-all"
              >
                {resetting ? 'Resetting...' : 'Yes, Reset Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
