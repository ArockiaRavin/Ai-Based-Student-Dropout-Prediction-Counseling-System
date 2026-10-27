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

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const apiCache = new Map<string, CacheEntry<any>>();

export function getCached<T>(endpoint: string): T | null {
  const item = apiCache.get(endpoint);
  return item ? (item.data as T) : null;
}

export function setCached<T>(endpoint: string, data: T): void {
  apiCache.set(endpoint, { data, timestamp: Date.now() });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
}

function autoInvalidate(endpoint: string, method: string = 'GET') {
  if (method === 'GET') return;
  if (endpoint.includes('/students')) {
    invalidateCache('/students');
    invalidateCache('/analytics');
    invalidateCache('/reports');
  }
  if (endpoint.includes('/predictions')) {
    invalidateCache('/predictions');
    invalidateCache('/students');
    invalidateCache('/analytics');
  }
  if (endpoint.includes('/counseling')) {
    invalidateCache('/counseling');
    invalidateCache('/students');
    invalidateCache('/analytics');
  }
  if (endpoint.includes('/interventions')) {
    invalidateCache('/interventions');
    invalidateCache('/students');
    invalidateCache('/analytics');
  }
  if (endpoint.includes('/settings')) {
    invalidateCache('/settings');
    invalidateCache('/analytics');
  }
  if (endpoint.includes('/auth') || endpoint.includes('/users')) {
    invalidateCache('/auth/me');
    invalidateCache('/users');
  }
  if (endpoint.includes('/model')) {
    invalidateCache('/model');
    invalidateCache('/predictions');
    invalidateCache('/analytics');
  }
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
  ttlMs: number = 0,
  forceRefresh: boolean = false
): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();

  // Cache lookup for GET
  if (method === 'GET' && ttlMs > 0 && !forceRefresh) {
    const cached = apiCache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.data as T;
    }
  }

  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('eduretain_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      let errorDetail = `Request failed with status ${res.status}`;
      if (errorText) {
        try {
          const errorData = JSON.parse(errorText);
          if (errorData?.detail) {
            errorDetail = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
          } else if (errorData?.message) {
            errorDetail = errorData.message;
          }
        } catch {
          if (errorText.length < 200) {
            errorDetail = errorText;
          }
        }
      }
      const error = new Error(errorDetail);
      (error as any).status = res.status;
      (error as any).statusText = res.statusText;
      throw error;
    }

    if (res.status === 204 || res.headers.get('content-length') === '0') {
      autoInvalidate(endpoint, method);
      return {} as T;
    }

    const text = await res.text();
    if (!text || !text.trim()) {
      autoInvalidate(endpoint, method);
      return {} as T;
    }

    const result = JSON.parse(text);

    if (method === 'GET' && ttlMs > 0) {
      apiCache.set(endpoint, { data: result, timestamp: Date.now() });
    } else {
      autoInvalidate(endpoint, method);
    }

    return result as T;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Cache utility helpers
  getCached,
  setCached,
  invalidateCache,

  // Health
  checkHealth: () => request<{ status: string; ml_models_ready: boolean; active_model: string }>('/health'),

  // Auth & Notifications
  login: (username: string, password: string = 'password') =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (data: { name: string; email: string; password: string; role: string; department?: string }) =>
    request<{ message: string; status: string; token?: string; verification_token?: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: (forceRefresh = false) => request<{ user: User }>('/auth/me', undefined, 30000, forceRefresh),

  getSetupAdminStatus: () =>
    request<{ setup_available: boolean; message: string }>('/auth/setup-admin/status'),

  setupInitialAdmin: (data: {
    setup_key: string;
    name: string;
    email: string;
    password: string;
    department?: string;
    username?: string;
  }) =>
    request<{ message: string; token: string; user: User }>('/auth/setup-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string; reset_token?: string; expires_in?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (reset_token: string, new_password: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ reset_token, new_password }),
    }),

  verifyEmail: (token: string) =>
    request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  resendVerification: (email: string) =>
    request<{ message: string; verification_token?: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  logout: () => {
    invalidateCache();
    return request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  updateProfile: (data: { name?: string; department?: string; current_password?: string; new_password?: string }) =>
    request<{ message: string; user: User }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // User Management (Admin Only)
  getUsers: (forceRefresh = false) => request<{ users: User[]; total: number }>('/users', undefined, 15000, forceRefresh),

  getUserDetails: (userId: number, forceRefresh = false) => request<{ user: User }>(`/users/${userId}`, undefined, 15000, forceRefresh),

  createUser: (data: {
    username?: string;
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    status?: string;
    admin_password?: string;
  }) =>
    request<{ message: string; user_id: number }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUserDetails: (userId: number, data: { name?: string; department?: string; status?: string }) =>
    request<{ message: string; user: User }>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateUserStatus: (userId: number, status: 'active' | 'pending' | 'deactivated') =>
    request<{ message: string; status: string }>(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  updateUserRole: (userId: number, role: 'Administrator' | 'Counselor' | 'Viewer', admin_password?: string) =>
    request<{ message: string; role: string }>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role, admin_password }),
    }),

  deleteUser: (userId: number) =>
    request<{ message: string }>(`/users/${userId}`, {
      method: 'DELETE',
    }),

  getNotifications: (forceRefresh = false) =>
    request<{ notifications: NotificationItem[]; unread_count: number }>('/notifications', undefined, 10000, forceRefresh),

  markNotificationRead: (id: number) =>
    request<{ message: string }>(`/notifications/${id}/read`, { method: 'PUT' }),

  // Dashboard
  getDashboardSummary: (forceRefresh = false) =>
    request<DashboardSummary>('/analytics/dashboard-summary', undefined, 15000, forceRefresh),

  // Risk Analysis
  getRiskAnalysis: (department?: string, semester?: number, forceRefresh = false) => {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (semester) params.append('semester', semester.toString());
    const ep = `/analytics/risk-analysis?${params.toString()}`;
    return request<any>(ep, undefined, 20000, forceRefresh);
  },

  // Students
  getStudents: (
    params?: {
      search?: string;
      department?: string;
      semester?: number;
      risk_level?: string;
      sort_by?: string;
      sort_order?: string;
    },
    forceRefresh = false
  ) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department) query.append('department', params.department);
    if (params?.semester) query.append('semester', params.semester.toString());
    if (params?.risk_level) query.append('risk_level', params.risk_level);
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.sort_order) query.append('sort_order', params.sort_order);
    const ep = `/students?${query.toString()}`;
    return request<{ students: Student[]; total: number }>(ep, undefined, 15000, forceRefresh);
  },

  getStudent: (studentId: string, forceRefresh = false) =>
    request<{
      student: Student;
      latest_prediction?: PredictionRecord | null;
      predictions_history: PredictionRecord[];
      counseling_sessions: CounselingSession[];
      interventions: Intervention[];
    }>(`/students/${studentId}`, undefined, 20000, forceRefresh),

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
    const token = localStorage.getItem('eduretain_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/students/import`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      let errorDetail = 'Import failed';
      if (errorText) {
        try {
          const err = JSON.parse(errorText);
          if (err?.detail) {
            errorDetail = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
          }
        } catch {
          if (errorText.length < 200) errorDetail = errorText;
        }
      }
      throw new Error(errorDetail);
    }

    autoInvalidate('/students/import', 'POST');

    const text = await res.text();
    if (!text || !text.trim()) {
      return { message: 'Import completed successfully' };
    }
    return JSON.parse(text);
  },

  getExportCsvUrl: () => `${API_BASE}/students/export/csv`,

  // Predictions
  getPredictions: (studentId?: string, riskCategory?: string, forceRefresh = false) => {
    const query = new URLSearchParams();
    if (studentId) query.append('student_id', studentId);
    if (riskCategory) query.append('risk_category', riskCategory);
    return request<{ predictions: any[]; total: number }>(`/predictions?${query.toString()}`, undefined, 15000, forceRefresh);
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

  getPredictionDetail: (id: number, forceRefresh = false) =>
    request<any>(`/predictions/${id}`, undefined, 20000, forceRefresh),

  // Counseling
  getCounselingSessions: (studentId?: string, status?: string, supportCategory?: string, forceRefresh = false) => {
    const query = new URLSearchParams();
    if (studentId) query.append('student_id', studentId);
    if (status) query.append('status', status);
    if (supportCategory) query.append('support_category', supportCategory);
    return request<{ sessions: CounselingSession[]; total: number }>(`/counseling/sessions?${query.toString()}`, undefined, 15000, forceRefresh);
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

  getCounselorOverview: (forceRefresh = false) =>
    request<any>('/counseling/overview', undefined, 15000, forceRefresh),

  // Interventions
  getInterventions: (status?: string, category?: string, studentId?: string, forceRefresh = false) => {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    if (category) query.append('category', category);
    if (studentId) query.append('student_id', studentId);
    return request<{ interventions: Intervention[]; summary: any }>(`/interventions?${query.toString()}`, undefined, 15000, forceRefresh);
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
  getModelInsights: (forceRefresh = false) =>
    request<ModelInsights>('/model/insights', undefined, 30000, forceRefresh),

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
  getSettings: (forceRefresh = false) =>
    request<{ settings: any; audit_logs: any[]; database_stats: any }>('/settings', undefined, 30000, forceRefresh),

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
