import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  HeartHandshake,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Users2,
  Clock,
  Presentation,
  Compass,
  Activity,
  Cpu,
  ChevronRight,
  TrendingDown,
  Database,
  ShieldAlert
} from 'lucide-react';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070B18] text-[#F8FAFC] flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Cinematic Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#070B18]/85 backdrop-blur-xl border-b border-white/10 px-6 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-40 blur-xs group-hover:opacity-75 transition-opacity -z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight group-hover:text-indigo-200 transition-colors">
                  EduRetain
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> AI SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
                Dropout Prediction &amp; Counseling
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <a href="#problem" className="hover:text-cyan-400 transition-colors">The Problem</a>
            <a href="#solution" className="hover:text-cyan-400 transition-colors">AI Solution</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#models" className="hover:text-cyan-400 transition-colors">ML Models</a>
            <a href="#tech-stack" className="hover:text-cyan-400 transition-colors">Tech Stack</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/presentation"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white transition-all backdrop-blur-md"
            >
              <Presentation className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Presentation Mode</span>
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02]"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Cinematic Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        {/* Full-width High-Resolution Background Image with Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/ai_hero_background.jpg"
            alt="Futuristic AI Telemetry Network"
            className="w-full h-full object-cover object-center scale-105 transform animate-pulse duration-[10000ms]"
          />
          {/* Layered cinematic dark gradient overlays for maximum contrast and blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070B18] via-[#070B18]/85 to-[#070B18]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070B18] via-transparent to-[#070B18]/75" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
        </div>

        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 sm:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge above heading */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/35 text-indigo-300 text-xs font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI-POWERED STUDENT RETENTION</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                Predict Early. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300 drop-shadow-[0_0_35px_rgba(34,211,238,0.3)]">
                  Support Better.
                </span> <br />
                Retain More Students.
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
                An intelligent student retention platform that identifies potential dropout risks, uncovers important patterns, and empowers counselors to provide timely, personalized support.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-[0_0_25px_rgba(99,102,241,0.45)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] transition-all hover:scale-[1.02]"
                >
                  <span>Explore Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-cyan-300" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white font-semibold text-sm border border-white/15 backdrop-blur-md shadow-lg transition-all hover:border-cyan-500/40"
                >
                  <BrainCircuit className="w-4 h-4 text-cyan-400" />
                  <span>Discover AI Workflow</span>
                </a>
                <Link
                  to="/presentation"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-sm border border-cyan-500/30 backdrop-blur-md transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                >
                  <Presentation className="w-4 h-4" />
                  <span>Presentation Mode</span>
                </Link>
              </div>

              {/* Metrics Highlights */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-xl">
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono flex items-center gap-1">
                    <span>98.3%</span>
                    <span className="text-xs text-emerald-400 font-sans font-normal">Acc</span>
                  </div>
                  <div className="text-xs text-slate-400">Random Forest Champion</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
                    0.995
                  </div>
                  <div className="text-xs text-slate-400">ROC-AUC Discriminator</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">
                    100%
                  </div>
                  <div className="text-xs text-slate-400">Counselor Actionable</div>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Glassmorphism Analytics Panel */}
            <div className="lg:col-span-5">
              <div className="glass-panel rounded-3xl border border-white/15 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl space-y-5 relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300">
                {/* Glowing subtle top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 opacity-80" />

                {/* Panel Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(251,113,133,0.7)]"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.7)]"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.7)]"></span>
                    <span className="ml-2 text-xs font-mono font-bold text-slate-200">
                      Live Telemetry Assessment
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-[#FB7185] border border-rose-500/40 font-bold shadow-[0_0_10px_rgba(251,113,133,0.2)]">
                    HIGH RISK (88.4%)
                  </span>
                </div>

                {/* Candidate Student Details */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Candidate Student:</span>
                    <span className="font-bold text-white">Aarav Sharma (STU2023CS101)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Department &amp; Semester:</span>
                    <span className="font-semibold text-slate-200">Computer Science (Sem 3)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Attendance Compliance:</span>
                    <span className="font-bold text-[#FB7185] font-mono flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> 54.2% (Deficit)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Cumulative GPA:</span>
                    <span className="font-bold text-white font-mono">4.80 / 10.0</span>
                  </div>
                </div>

                {/* Mini Risk Distribution Progress Bars */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-300">Cohort Risk Distribution Preview (N=60)</span>
                    <span className="text-cyan-400 font-mono">18 High • 22 Med • 20 Low</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 flex overflow-hidden">
                    <div className="bg-[#FB7185] h-full" style={{ width: '30%' }} title="High Risk: 30%" />
                    <div className="bg-[#FBBF24] h-full" style={{ width: '37%' }} title="Medium Risk: 37%" />
                    <div className="bg-[#34D399] h-full" style={{ width: '33%' }} title="Low Risk: 33%" />
                  </div>
                </div>

                {/* Primary Risk Drivers Identified */}
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1.5">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FB7185]" /> Primary Risk Drivers Identified:
                  </span>
                  <p className="text-xs text-rose-200/90 leading-relaxed">
                    • Attendance is below statutory 75% requirement (28.4% importance).<br />
                    • 2 active academic backlogs creating severe credit debt.
                  </p>
                </div>

                {/* Prescribed Counselor Action */}
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 space-y-1.5">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" /> Prescribed Counselor Action:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Mandatory 1-on-1 diagnostic counseling session scheduled &amp; peer tutoring assigned.
                  </p>
                </div>

                {/* Panel Footer CTA buttons */}
                <div className="pt-2 flex gap-3">
                  <Link
                    to="/students"
                    className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                  >
                    View All 60 Students
                  </Link>
                  <Link
                    to="/counselor-center"
                    className="flex-1 text-center py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
                  >
                    Open Counselor Hub
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="py-24 border-b border-white/10 relative overflow-hidden bg-[#0A1020]/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3.5 py-1 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
              The Educational Challenge
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Student Dropout: A Silent Crisis in Higher Education
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Higher education institutions lose valuable students every semester not because students lack capability, but because academic difficulties, attendance declines, and stress compound silently until final exams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card glass-card-hover rounded-2xl p-7 relative">
              <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(251,113,133,0.2)]">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Delayed Faculty Detection</h3>
              <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                Traditional universities discover struggling students only after final examination failures or prolonged absenteeism, when intervention is often too late to prevent departure.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-7 relative">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Siloed Student Data</h3>
              <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                Attendance rosters, internal assessment marks, assignment LMS logs, and financial aid records exist across disconnected spreadsheets, preventing early holistic pattern recognition.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-7 relative">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Disconnected Counseling</h3>
              <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                Faculty advisors lack standardized diagnostic workflows and outcome tracking systems to follow up on students throughout their critical academic milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Solution & Interactive Architecture */}
      <section id="solution" className="py-24 border-b border-white/10 bg-[#070B18] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/15 px-3.5 py-1 rounded-full border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              Our AI-Powered Solution
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Proactive Decision Support Powered by Machine Learning
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              EduRetain continuously evaluates multi-dimensional student progress signals, generates early warning alerts, and provides faculty counselors with structured intervention pathways.
            </p>
          </div>

          {/* Interactive Architecture Component */}
          <ArchitectureDiagram />
        </div>
      </section>

      {/* How The System Works: 4-Step Pipeline */}
      <section id="how-it-works" className="py-24 border-b border-white/10 bg-[#0A1020]/90">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3.5 py-1 rounded-full border border-cyan-500/25">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Data Ingestion to Actionable Support
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              A transparent, ethical 4-stage pipeline that keeps faculty counselors in control at all times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card glass-card-hover rounded-2xl p-6 relative">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/20 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                STAGE 01
              </span>
              <h4 className="font-bold text-base text-white mt-4">Ingest Student Signals</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Aggregates attendance %, continuous assessment scores, assignment completion, backlogs, and engagement metrics.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-6 relative">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                STAGE 02
              </span>
              <h4 className="font-bold text-base text-white mt-4">Predict Risk Likelihood</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Trained algorithms (Random Forest, Decision Tree, Logistic Regression) calculate probability and classify into Low, Medium, or High Risk tiers.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-6 relative">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30">
                STAGE 03
              </span>
              <h4 className="font-bold text-base text-white mt-4">Alert Counselors</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                High-priority cases trigger counselor alerts with explicit contributing drivers and positive indicators to guide constructive conversations.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-6 relative">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                STAGE 04
              </span>
              <h4 className="font-bold text-base text-white mt-4">Track Interventions</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Counselors log mentoring sessions, assign remedial tutoring, set follow-up targets, and monitor student recovery over semesters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section id="features" className="py-24 border-b border-white/10 bg-[#070B18]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/15 px-3.5 py-1 rounded-full border border-indigo-500/30">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Real Academic Institutions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card glass-card-hover rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">Multi-Model ML Inference</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Compare Logistic Regression, Decision Tree, Random Forest, and Rule-Based baseline models with genuine cross-validation metrics.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">Dedicated Counselor Hub</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Record structured session notes across Academic, Attendance, Mentoring, and Financial support categories with calendar follow-ups.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-cyan-300 border border-cyan-500/30 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">Departmental Analytics</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Compare retention health across departments, semesters, attendance brackets, and grade distributions with interactive visualizations.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4">
                <Users2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">Student 360° Profiles</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Full student dossiers combining past results, prediction trends, counselor notes, active interventions, and longitudinal progress.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">Intervention Tracking</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Monitor status from New, Scheduled, In Progress, to Completed with documented outcome notes and accountability.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-4">
                <Presentation className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">Built-in Presentation Mode</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                18 interactive slides with animated architecture diagram and presenter notes ready for faculty review and HR viva evaluations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Machine Learning Benchmark Table */}
      <section id="models" className="py-24 border-b border-white/10 bg-[#0A1020]/90">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/15 px-3.5 py-1 rounded-full border border-cyan-500/30">
              Evaluated Classifiers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Supervised Machine Learning Benchmark (N=1,500)
            </h2>
            <p className="text-slate-400 text-sm">
              Trained on empirical higher-ed retention telemetry, evaluated on held-out 20% test partition (N=300).
            </p>
          </div>

          <div className="glass-card rounded-2xl border border-white/15 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04] text-slate-300 font-mono uppercase tracking-wider">
                    <th className="py-4 px-6">Algorithm</th>
                    <th className="py-4 px-6">Accuracy</th>
                    <th className="py-4 px-6">Precision</th>
                    <th className="py-4 px-6">Recall</th>
                    <th className="py-4 px-6">F1-Score</th>
                    <th className="py-4 px-6">ROC-AUC</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr className="bg-indigo-500/10 hover:bg-indigo-500/15 transition-colors">
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Random Forest</span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-emerald-400">98.3%</td>
                    <td className="py-4 px-6 font-mono">96.8%</td>
                    <td className="py-4 px-6 font-mono">97.3%</td>
                    <td className="py-4 px-6 font-mono">0.970</td>
                    <td className="py-4 px-6 font-mono font-bold text-cyan-400">0.995</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        ACTIVE CHAMPION
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">Decision Tree</td>
                    <td className="py-4 px-6 font-mono text-emerald-400">97.0%</td>
                    <td className="py-4 px-6 font-mono">94.2%</td>
                    <td className="py-4 px-6 font-mono">95.8%</td>
                    <td className="py-4 px-6 font-mono">0.950</td>
                    <td className="py-4 px-6 font-mono">0.968</td>
                    <td className="py-4 px-6">
                      <span className="text-slate-400 text-[11px]">Interpretable Alternative</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">Logistic Regression</td>
                    <td className="py-4 px-6 font-mono text-emerald-400">96.3%</td>
                    <td className="py-4 px-6 font-mono">93.1%</td>
                    <td className="py-4 px-6 font-mono">94.5%</td>
                    <td className="py-4 px-6 font-mono">0.938</td>
                    <td className="py-4 px-6 font-mono">0.988</td>
                    <td className="py-4 px-6">
                      <span className="text-slate-400 text-[11px]">Parametric Log-Odds</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">Rule-Based Heuristic</td>
                    <td className="py-4 px-6 font-mono text-amber-400">79.2%</td>
                    <td className="py-4 px-6 font-mono">74.1%</td>
                    <td className="py-4 px-6 font-mono">76.8%</td>
                    <td className="py-4 px-6 font-mono">0.754</td>
                    <td className="py-4 px-6 font-mono">0.812</td>
                    <td className="py-4 px-6">
                      <span className="text-slate-400 text-[11px]">Static Baseline</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section id="tech-stack" className="py-24 border-b border-white/10 bg-[#070B18]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/15 px-3.5 py-1 rounded-full border border-indigo-500/30">
              Modern Engineering
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Full-Stack Architecture &amp; Libraries
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="glass-card rounded-2xl p-5 text-center space-y-1 hover:border-cyan-500/40 transition-colors">
              <div className="text-xs font-mono font-bold text-cyan-400">Frontend</div>
              <div className="font-bold text-sm text-white">React 19 &amp; TS</div>
              <div className="text-[11px] text-slate-400">Vite 8 + Tailwind</div>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center space-y-1 hover:border-indigo-500/40 transition-colors">
              <div className="text-xs font-mono font-bold text-indigo-400">Backend</div>
              <div className="font-bold text-sm text-white">Python FastAPI</div>
              <div className="text-[11px] text-slate-400">Asynchronous REST</div>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center space-y-1 hover:border-purple-500/40 transition-colors">
              <div className="text-xs font-mono font-bold text-purple-400">Machine Learning</div>
              <div className="font-bold text-sm text-white">Scikit-Learn</div>
              <div className="text-[11px] text-slate-400">RF, DT &amp; LogReg</div>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center space-y-1 hover:border-amber-500/40 transition-colors">
              <div className="text-xs font-mono font-bold text-amber-400">Database</div>
              <div className="font-bold text-sm text-white">SQLite 3 / MySQL</div>
              <div className="text-[11px] text-slate-400">Relational + WAL</div>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center space-y-1 hover:border-teal-500/40 transition-colors">
              <div className="text-xs font-mono font-bold text-teal-400">Visualizations</div>
              <div className="font-bold text-sm text-white">Recharts</div>
              <div className="text-[11px] text-slate-400">Dark Responsive SVG</div>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center space-y-1 hover:border-rose-500/40 transition-colors">
              <div className="text-xs font-mono font-bold text-rose-400">Security</div>
              <div className="font-bold text-sm text-white">RBAC Security</div>
              <div className="text-[11px] text-slate-400">Admin/Counselor/View</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Decision Support Advisory Footer */}
      <footer className="mt-auto bg-[#050811] text-slate-400 text-xs py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/10 pb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base text-white">EduRetain AI</span>
                <p className="text-[10px] text-slate-500">Student Retention Platform</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-slate-300 font-medium">
              <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
              <Link to="/students" className="hover:text-cyan-400 transition-colors">Students</Link>
              <Link to="/predictions" className="hover:text-cyan-400 transition-colors">Risk Assessment</Link>
              <Link to="/counselor-center" className="hover:text-cyan-400 transition-colors">Counselor Center</Link>
              <Link to="/presentation" className="hover:text-cyan-400 transition-colors">Presentation Mode</Link>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 text-slate-300 leading-relaxed text-xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Decision-Support System Advisory:</strong> The predictions and risk scores generated by this system are advisory statistical estimates intended exclusively to assist academic counselors, faculty advisors, and institutional leaders. Predictions do not constitute conclusive proof that an individual student will discontinue their studies. All intervention decisions must incorporate professional human judgment, empathetic counseling, and student consent. Sample student cohorts provided are fictional demonstration records.
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] pt-2">
            <span>© 2026 EduRetain AI — Third-Year Engineering Capstone Project. All Rights Reserved.</span>
            <span>Built with React 19, TypeScript, Vite, FastAPI, Scikit-learn &amp; SQLite.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
