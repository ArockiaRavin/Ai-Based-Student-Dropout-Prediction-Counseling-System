import React, { useEffect, useState } from 'react';
import {
  Cpu,
  BrainCircuit,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Layers,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { api } from '../api';
import { ModelInsights, ModelMetrics } from '../types';

export const ModelInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<ModelInsights | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('Random Forest');
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const res = await api.getModelInsights();
      setInsights(res);
      setSelectedModel(res.active_model || 'Random Forest');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchActive = async (modelName: string) => {
    try {
      await api.setActiveModel(modelName);
      setSelectedModel(modelName);
      setMessage(`Switched active operational model to ${modelName}`);
      setTimeout(() => setMessage(null), 3500);
      loadInsights();
    } catch (err: any) {
      alert(err.message || 'Failed to switch model');
    }
  };

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      const res = await api.retrainModels(1500);
      setMessage(res.message || 'Models successfully retrained!');
      setTimeout(() => setMessage(null), 4000);
      loadInsights();
    } catch (err: any) {
      alert(err.message || 'Failed to retrain models');
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading machine learning metrics &amp; feature importances...</p>
      </div>
    );
  }

  if (!insights) {
    return <div className="p-8 text-center text-xs text-slate-500">Failed to load model insights.</div>;
  }

  const currentMetrics: ModelMetrics = insights.models_metrics[selectedModel] || Object.values(insights.models_metrics)[0];

  const featureImpData = Object.entries(currentMetrics.feature_importance || {}).map(([name, val]) => ({
    feature: name,
    importance: val
  })).sort((a, b) => b.importance - a.importance);

  const cm = currentMetrics.confusion_matrix || {
    true_negative: 0,
    false_positive: 0,
    false_negative: 0,
    true_positive: 0
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {message && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          <span>{message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Cpu className="w-6 h-6" />
            </div>
            Machine Learning Insights &amp; Model Evaluation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Empirical evaluation metrics, confusion matrices, and feature attribution computed on held-out test datasets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-cyan-300 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining On N=1500...' : 'Retrain All Models'}</span>
          </button>
        </div>
      </div>

      {/* Model Selector Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white font-mono">SELECT MODEL TO INSPECT:</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {insights.supported_models.map(m => {
            const isSelected = selectedModel === m;
            const isActive = insights.active_model === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
                }`}
              >
                <span>{m}</span>
                {isActive && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Model KPI Evaluation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 font-mono">TEST ACCURACY</span>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">
            {(currentMetrics.accuracy * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">N={currentMetrics.test_set_size} test samples</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 font-mono">PRECISION</span>
          <div className="text-3xl font-extrabold text-indigo-400 font-mono mt-1">
            {(currentMetrics.precision * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Low false alert rate</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 font-mono">RECALL / SENSITIVITY</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">
            {(currentMetrics.recall * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">True dropout detection</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 font-mono">F1-SCORE</span>
          <div className="text-3xl font-extrabold text-[#FBBF24] font-mono mt-1">
            {(currentMetrics.f1_score * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Harmonic balance</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 font-mono">ROC AUC</span>
          <div className="text-3xl font-extrabold text-purple-400 font-mono mt-1">
            {(currentMetrics.roc_auc * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Discrimination power</span>
        </div>
      </div>

      {/* Set as Operational Active Button if not active */}
      {insights.active_model !== selectedModel && (
        <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
          <div className="text-xs text-slate-200">
            <strong className="text-cyan-400">Switch Engine:</strong> Would you like to set <strong className="text-white">{selectedModel}</strong> as the default operational prediction model across all student assessments?
          </div>
          <button
            onClick={() => handleSwitchActive(selectedModel)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md"
          >
            Activate {selectedModel}
          </button>
        </div>
      )}

      {/* Grid: Feature Importance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Importance Bar Chart (7 cols) */}
        <div className="lg:col-span-7 glass-card p-5 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Feature Importance Ranking (%)</h3>
              <p className="text-xs text-slate-400 mt-1">Contribution of each factor to risk classification decisions</p>
            </div>
            <span className="text-xs font-mono font-medium text-cyan-400">Total: 100%</span>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={featureImpData}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.07)" />
                <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis dataKey="feature" type="category" width={160} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Importance Weight']}
                  contentStyle={{
                    backgroundColor: 'rgba(11, 18, 36, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="importance" fill="#818CF8" radius={[0, 6, 6, 0]}>
                  {featureImpData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#22D3EE' : index === 1 ? '#818CF8' : index === 2 ? '#6366F1' : '#A855F7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real Confusion Matrix 2x2 Grid (5 cols) */}
        <div className="lg:col-span-5 glass-card p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Held-Out Test Confusion Matrix</h3>
            <p className="text-xs text-slate-400 mt-1">Evaluation on N={currentMetrics.test_set_size} unseen test student cases</p>
          </div>

          <div className="my-4">
            <div className="grid grid-cols-2 gap-3.5 text-center">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block font-mono">True Negatives (TN)</span>
                <span className="text-3xl font-mono font-extrabold text-white mt-1 block">
                  {cm.true_negative}
                </span>
                <p className="text-[10px] text-emerald-300/80 mt-1">Correctly retained students</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                <span className="text-[10px] font-bold uppercase text-[#FBBF24] block font-mono">False Positives (FP)</span>
                <span className="text-3xl font-mono font-extrabold text-white mt-1 block">
                  {cm.false_positive}
                </span>
                <p className="text-[10px] text-amber-300/80 mt-1">False alarms (over-caution)</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 shadow-[0_0_15px_rgba(251,113,133,0.15)]">
                <span className="text-[10px] font-bold uppercase text-[#FB7185] block font-mono">False Negatives (FN)</span>
                <span className="text-3xl font-mono font-extrabold text-white mt-1 block">
                  {cm.false_negative}
                </span>
                <p className="text-[10px] text-rose-300/80 mt-1">Missed at-risk cases</p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <span className="text-[10px] font-bold uppercase text-cyan-400 block font-mono">True Positives (TP)</span>
                <span className="text-3xl font-mono font-extrabold text-white mt-1 block">
                  {cm.true_positive}
                </span>
                <p className="text-[10px] text-cyan-300/80 mt-1">Correctly identified at-risk</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Sensitivity: <strong className="text-cyan-300">{((cm.true_positive / ((cm.true_positive + cm.false_negative) || 1)) * 100).toFixed(1)}%</strong></span>
            <span>Specificity: <strong className="text-emerald-300">{((cm.true_negative / ((cm.true_negative + cm.false_positive) || 1)) * 100).toFixed(1)}%</strong></span>
          </div>
        </div>
      </div>

      {/* Preprocessing Pipeline & Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3 shadow-xl">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Data Preprocessing Pipeline
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {insights.preprocessing_pipeline.map((step, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3 shadow-xl">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Model Limitations &amp; Ethical Safeguards
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {insights.limitations.map((lim, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24] shrink-0 mt-0.5" />
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
