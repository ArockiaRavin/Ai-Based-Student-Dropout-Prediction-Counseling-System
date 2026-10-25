import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import { api } from '../api';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('overall_risk');
  const [department, setDepartment] = useState('All');
  const [riskCategory, setRiskCategory] = useState('All');
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReport();
  }, [reportType, department, riskCategory]);

  const generateReport = async () => {
    try {
      setLoading(true);
      const res = await api.generateReport({
        report_type: reportType,
        department: department !== 'All' ? department : undefined,
        risk_category: riskCategory !== 'All' ? riskCategory : undefined
      });
      setReportData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadCSV = () => {
    if (!reportData || !reportData.records || !reportData.records.length) return;
    const records = reportData.records;
    const headers = Object.keys(records[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...records.map((r: any) =>
          headers.map(h => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const departmentsList = [
    'All',
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering'
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto text-slate-100">
      {/* Print-specific style injector */}
      <style>
        {`
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }
            .no-print {
              display: none !important;
            }
            .print-document {
              background: #ffffff !important;
              color: #1e293b !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .print-document * {
              color: #0f172a !important;
              border-color: #cbd5e1 !important;
            }
            .print-document th {
              background: #f1f5f9 !important;
              color: #0f172a !important;
            }
            .print-letterhead {
              border-bottom: 2px solid #4f46e5 !important;
            }
          }
        `}
      </style>

      {/* Header (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
            </div>
            Institutional Reports & Regulatory Exports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate formal documentation for accreditation bodies, academic councils, and departmental faculty committees.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold backdrop-blur-md transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Controls (hidden in print) */}
      <div className="no-print p-5 rounded-2xl bg-[#0B1224]/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Report Module
            </label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full bg-[#070B18] border border-white/10 rounded-xl p-2.5 text-xs font-medium text-slate-200 focus:outline-hidden focus:border-indigo-400"
            >
              <option value="overall_risk">Institutional Master Risk Report</option>
              <option value="high_risk">High-Risk Priority Action Report</option>
              <option value="department_wise">Department-Wise Comparative Report</option>
              <option value="counseling_activity">Counseling Activity & Follow-Up Log</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Academic Department
            </label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full bg-[#070B18] border border-white/10 rounded-xl p-2.5 text-xs font-medium text-slate-200 focus:outline-hidden focus:border-indigo-400"
            >
              {departmentsList.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Risk Tier Filter
            </label>
            <select
              value={riskCategory}
              onChange={e => setRiskCategory(e.target.value)}
              className="w-full bg-[#070B18] border border-white/10 rounded-xl p-2.5 text-xs font-medium text-slate-200 focus:outline-hidden focus:border-indigo-400"
            >
              <option value="All">All Risk Tiers</option>
              <option value="HIGH RISK">High Risk Only</option>
              <option value="MEDIUM RISK">Medium Risk Only</option>
              <option value="LOW RISK">Low Risk Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Formal Printable Document Layout */}
      <div className="print-document bg-[#0B1224]/85 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 backdrop-blur-xl">
        {/* Printable Letterhead Header */}
        <div className="print-letterhead border-b-2 border-indigo-500/60 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                National Institute of Engineering & Technology
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Department of Academic Affairs & Student Retention Counseling Cell
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-400 font-mono space-y-1">
            <div className="text-cyan-400 font-semibold">Document: RET-{Date.now().toString().slice(-6)}</div>
            <div>Generated: {reportData?.summary?.generated_at || 'Current'}</div>
            <div className="text-[10px] text-slate-500">Classification: Institutional Official</div>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400">Compiling multi-vector institutional report...</p>
          </div>
        ) : !reportData ? (
          <div className="p-8 text-center text-xs text-slate-400">Failed to render report data.</div>
        ) : (
          <>
            {/* Title & Metadata */}
            <div className="space-y-2 pb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verified Audit Report</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">{reportData.summary.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{reportData.summary.description}</p>
              <div className="pt-2 text-xs text-slate-400 flex flex-wrap gap-4 font-mono">
                <span>Total Records Included: <strong className="text-cyan-400">{reportData.summary.total_records}</strong></span>
                <span>Scope: <strong className="text-white">{department}</strong></span>
                <span>Active Risk Filter: <strong className="text-white">{riskCategory}</strong></span>
              </div>
            </div>

            {/* Records Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-cyan-300 font-bold border-b border-white/10 uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    {reportData.records.length > 0 &&
                      Object.keys(reportData.records[0]).map(col => (
                        <th key={col} className="py-3 px-4">
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {reportData.records.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.04] transition-colors">
                      {Object.keys(row).map(col => (
                        <td key={col} className="py-2.5 px-4 text-slate-300 font-medium">
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Findings & Recommendations Footer */}
            <div className="pt-6 border-t border-white/10 space-y-4 text-xs text-slate-300">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <strong className="text-white font-bold block text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  Summary of Findings & Policy Recommendations:
                </strong>
                <p className="leading-relaxed text-slate-300">
                  1. Students presenting with attendance compliance under 75% show elevated attrition risk across all academic semesters.
                  <br />
                  2. Immediate assignment to peer tutoring and structured bi-weekly counseling reviews is recommended for all students listed in High Risk categories.
                  <br />
                  3. Academic heads are advised to verify financial scholarship eligibility for students flagged with economic pressures.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 text-[11px] text-slate-500 font-mono gap-2">
                <span>Sign-off: Dean of Student Affairs & Academic Council</span>
                <span>System Verified: EduRetain AI Decision Support Platform</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
