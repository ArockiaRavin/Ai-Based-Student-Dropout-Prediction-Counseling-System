import {
  Student,
  PredictionRecord,
  CounselingSession,
  Intervention,
  DashboardSummary,
  ModelInsights,
  NotificationItem,
  User
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; ml_models_ready: boolean; active_model: string }>('/health'),

  // Auth & Notifications
  login: (username: string, password: string = 'password') =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getNotifications: () =>
    request<{ notifications: NotificationItem[]; unread_count: number }>('/notifications'),

  markNotificationRead: (id: number) =>
    request<{ message: string }>(`/notifications/${id}/read`, { method: 'PUT' }),

  // Dashboard
  getDashboardSummary: () => request<DashboardSummary>('/analytics/dashboard-summary'),

  // Risk Analysis
  getRiskAnalysis: (department?: string, semester?: number) => {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (semester) params.append('semester', semester.toString());
    return request<any>(`/analytics/risk-analysis?${params.toString()}`);
  },

  // Students
  getStudents: (params?: {
    search?: string;
    department?: string;
    semester?: number;
    risk_level?: string;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department) query.append('department', params.department);
    if (params?.semester) query.append('semester', params.semester.toString());
    if (params?.risk_level) query.append('risk_level', params.risk_level);
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.sort_order) query.append('sort_order', params.sort_order);
    return request<{ students: Student[]; total: number }>(`/students?${query.toString()}`);
  },

  getStudent: (studentId: string) =>
    request<{
      student: Student;
      latest_prediction?: PredictionRecord | null;
      predictions_history: PredictionRecord[];
      counseling_sessions: CounselingSession[];
      interventions: Intervention[];
    }>(`/students/${studentId}`),

  createStudent: (studentData: any) =>
    request<{ message: string; student_id: string; prediction: any }>('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),

  updateStudent: (studentId: string, studentData: any) =>
    request<{ message: string; student: Student; new_prediction: any }>(`/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    }),

  deleteStudent: (studentId: string) =>
    request<{ message: string }>(`/students/${studentId}`, {
      method: 'DELETE',
    }),

  importStudentsCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/students/import`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Import failed');
    }
    return await res.json();
  },

  getExportCsvUrl: () => `${API_BASE}/students/export/csv`,

  // Predictions
  getPredictions: (studentId?: string, riskCategory?: string) => {
    const query = new URLSearchParams();
    if (studentId) query.append('student_id', studentId);
    if (riskCategory) query.append('risk_category', riskCategory);
    return request<{ predictions: any[]; total: number }>(`/predictions?${query.toString()}`);
  },

  runPrediction: (input: {
    student_id?: string;
    attendance_pct: number;
    gpa: number;
    internal_marks: number;
    assignment_completion_pct: number;
    previous_semester_result?: string;
    engagement_level?: string;
    financial_support_needed?: number;
    semester?: number;
    model_name?: string;
  }) =>
    request<PredictionRecord & { explanation: string; student_inputs: any }>('/predictions', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getPredictionDetail: (id: number) => request<any>(`/predictions/${id}`),

  // Counseling
  getCounselingSessions: (studentId?: string, status?: string, supportCategory?: string) => {
    const query = new URLSearchParams();
    if (studentId) query.append('student_id', studentId);
    if (status) query.append('status', status);
    if (supportCategory) query.append('support_category', supportCategory);
    return request<{ sessions: CounselingSession[]; total: number }>(`/counseling/sessions?${query.toString()}`);
  },

  createCounselingSession: (data: Partial<CounselingSession>) =>
    request<{ message: string; session_id: number }>('/counseling/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCounselingSession: (id: number, data: any) =>
    request<{ message: string }>(`/counseling/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getCounselorOverview: () => request<any>('/counseling/overview'),

  // Interventions
  getInterventions: (status?: string, category?: string, studentId?: string) => {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    if (category) query.append('category', category);
    if (studentId) query.append('student_id', studentId);
    return request<{ interventions: Intervention[]; summary: any }>(`/interventions?${query.toString()}`);
  },

  createIntervention: (data: Partial<Intervention>) =>
    request<{ message: string; id: number }>('/interventions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateIntervention: (id: number, data: Partial<Intervention>) =>
    request<{ message: string }>(`/interventions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Model Insights
  getModelInsights: () => request<ModelInsights>('/model/insights'),

  setActiveModel: (modelName: string) =>
    request<{ message: string }>('/model/set-active', {
      method: 'POST',
      body: JSON.stringify({ model_name: modelName }),
    }),

  retrainModels: (nSamples: number = 1500) =>
    request<{ message: string; metrics: any }>('/model/retrain', {
      method: 'POST',
      body: JSON.stringify({ n_samples: nSamples }),
    }),

  // Reports
  generateReport: (params: {
    report_type: string;
    department?: string;
    risk_category?: string;
  }) => {
    const query = new URLSearchParams();
    query.append('report_type', params.report_type);
    if (params.department) query.append('department', params.department);
    if (params.risk_category) query.append('risk_category', params.risk_category);
    return request<{ summary: any; records: any[] }>(`/reports/generate?${query.toString()}`);
  },

  // Settings
  getSettings: () => request<{ settings: any; audit_logs: any[]; database_stats: any }>('/settings'),

  updateSettings: (settings: any) =>
    request<{ message: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  resetDemoData: () =>
    request<{ message: string }>('/settings/reset-demo-data', {
      method: 'POST',
    }),
};
