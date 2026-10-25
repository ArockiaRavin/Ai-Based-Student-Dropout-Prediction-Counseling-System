import React, { useState } from 'react';
import { ArrowRight, Database, Cpu, BrainCircuit, Activity, HeartHandshake, CheckCircle2, Info, Sparkles } from 'lucide-react';

interface LayerInfo {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  activeColor: string;
  items: string[];
  description: string;
}

export const ArchitectureDiagram: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<string>('ai_ml');

  const layers: LayerInfo[] = [
    {
      id: 'input',
      title: '1. Input Layer',
      subtitle: 'Student Data Streams',
      icon: <Database className="w-5 h-5 text-cyan-400" />,
      color: 'border-white/10 bg-white/[0.03] text-slate-300',
      activeColor: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.25)] ring-1 ring-cyan-500/40',
      items: [
        'Classroom Attendance (%)',
        'Academic CGPA (0.0-10.0)',
        'Internal Examination Marks',
        'Assignment Submission Rate (%)',
        'Previous Semester Backlogs',
        'LMS & Activity Engagement',
        'Financial Support Need Flag'
      ],
      description: 'Continuous student academic, assessment, and institutional engagement metrics ingested securely from institutional ERP and learning management systems.'
    },
    {
      id: 'processing',
      title: '2. Processing Layer',
      subtitle: 'Data Engineering',
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      color: 'border-white/10 bg-white/[0.03] text-slate-300',
      activeColor: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/40',
      items: [
        'Data Validation & Sanity Bounds',
        'Missing Value Imputation',
        'Categorical Ordinal Encoding',
        'Stratified 80/20 Train-Test Split',
        'StandardScaler Normalization'
      ],
      description: 'Cleans, validates bounds (e.g. 0-100%), extracts backlog counts from grade history, and scales numeric dimensions into zero-mean, unit-variance distributions.'
    },
    {
      id: 'ai_ml',
      title: '3. AI/ML Layer',
      subtitle: 'Predictive Classifiers',
      icon: <BrainCircuit className="w-5 h-5 text-purple-400" />,
      color: 'border-white/10 bg-white/[0.03] text-slate-300',
      activeColor: 'border-purple-500/50 bg-purple-500/10 text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.25)] ring-1 ring-purple-500/40',
      items: [
        'Random Forest (Ensemble Champion)',
        'Decision Tree Classifier',
        'Logistic Regression (Linear)',
        'Rule-Based Heuristic Baseline',
        'Feature Importance Attribution'
      ],
      description: 'Trained supervised machine learning algorithms evaluate multidimensional student vectors against held-out validation sets to estimate dropout probability.'
    },
    {
      id: 'output',
      title: '4. Output Layer',
      subtitle: 'Calibrated Tiers',
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      color: 'border-white/10 bg-white/[0.03] text-slate-300',
      activeColor: 'border-amber-500/50 bg-amber-500/10 text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.25)] ring-1 ring-amber-500/40',
      items: [
        'LOW RISK (< 35% probability)',
        'MEDIUM RISK (35% - 65%)',
        'HIGH RISK (>= 65% probability)',
        'Key Negative Risk Drivers',
        'Positive Protective Factors'
      ],
      description: 'Synthesizes model probability into three actionable risk categories alongside primary causal drivers and positive protective indicators.'
    },
    {
      id: 'support',
      title: '5. Support Layer',
      subtitle: 'Targeted Interventions',
      icon: <HeartHandshake className="w-5 h-5 text-emerald-400" />,
      color: 'border-white/10 bg-white/[0.03] text-slate-300',
      activeColor: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.25)] ring-1 ring-emerald-500/40',
      items: [
        'Automated Counselor Alerts',
        '1-on-1 Academic Tutoring',
        'Attendance Improvement Plans',
        'Financial Aid Assistance Referral',
        'Intervention Progress Monitoring'
      ],
      description: 'Translates automated ML risk insights into human counselor interventions, structured action plans, scheduled follow-up meetings, and institutional retention support.'
    }
  ];

  const current = layers.find(l => l.id === selectedLayer) || layers[2];

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
      {/* Background subtle glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            System Architecture &amp; End-to-End Data Pipeline
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Data flows sequentially from academic ingestion to machine learning inference and counselor follow-up.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          <Info className="w-3.5 h-3.5 text-cyan-400" /> Click any layer to inspect technical pipeline details
        </span>
      </div>

      {/* Interactive Horizontal Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 my-6">
        {layers.map((layer, idx) => {
          const isSelected = selectedLayer === layer.id;
          return (
            <div key={layer.id} className="relative flex flex-col">
              <button
                type="button"
                onClick={() => setSelectedLayer(layer.id)}
                className={`text-left p-4 rounded-xl border transition-all duration-300 h-full flex flex-col justify-between backdrop-blur-md ${
                  isSelected
                    ? layer.activeColor
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-lg bg-white/[0.05] border border-white/10">
                      {layer.icon}
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Step {idx + 1}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-white">{layer.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{layer.subtitle}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{layer.items.length} components</span>
                  {isSelected && <Sparkles className="w-3 h-3 text-cyan-400" />}
                </div>
              </button>

              {/* Arrow separator (hidden on mobile / last element) */}
              {idx < layers.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-500">
                  <ArrowRight className="w-5 h-5 text-indigo-400/70" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Layer Deep-Dive Inspection Panel */}
      <div className="glass-panel rounded-xl border border-white/15 p-5 mt-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/[0.06] border border-white/15 text-indigo-400 shrink-0">
            {current.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span>{current.title}: {current.subtitle}</span>
              </h4>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                Active Inspection
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{current.description}</p>
            
            <div className="mt-4">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Operational Modules &amp; Data Points:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {current.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white/[0.04] px-3 py-2 rounded-lg border border-white/10 text-xs font-medium text-slate-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
