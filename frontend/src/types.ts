export type RiskCategory = 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';

export interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  semester: number;
  attendance_pct: number;
  gpa: number;
  internal_marks: number;
  assignment_completion_pct: number;
  previous_semester_result: string;
  engagement_level: string;
  financial_support_needed: number;
  status: string;
  created_at: string;
  updated_at: string;
  latest_prediction?: PredictionRecord | null;
  active_interventions_count?: number;
  counseling_sessions_count?: number;
}

export interface PredictionRecord {
  id?: number;
  student_id?: string;
  model_used: string;
  risk_score: number;
  risk_category: RiskCategory;
  factors: string[];
  positive_indicators: string[];
  recommendations: string[];
  explanation?: string;
  created_at?: string;
}

export interface CounselingSession {
  id: number;
  student_id: string;
  student_name?: string;
  department?: string;
  attendance_pct?: number;
  gpa?: number;
  counselor_name: string;
  session_date: string;
  support_category: string;
  notes: string;
  action_plan: string;
  follow_up_date?: string | null;
  status: string;
  created_at: string;
}

export interface Intervention {
  id: number;
  student_id: string;
  student_name?: string;
  department?: string;
  attendance_pct?: number;
  gpa?: number;
  risk_score?: number;
  risk_category?: RiskCategory;
  title: string;
  description: string;
  category: string;
  assigned_to: string;
  status: 'New' | 'Scheduled' | 'In Progress' | 'Completed' | 'Needs Follow-up';
  target_date: string;
  outcome_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardKPIs {
  total_students: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  awaiting_counseling: number;
  followups_due: number;
}

export interface DashboardSummary {
  kpis: DashboardKPIs;
  risk_distribution: { name: string; value: number; color: string }[];
  department_breakdown: {
    department: string;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
    total: number;
  }[];
  scatter_plot: {
    student_id: string;
    name: string;
    department: string;
    attendance_pct: number;
    gpa: number;
    risk_score: number;
    risk_category: RiskCategory;
  }[];
  semester_trends: {
    semester: number;
    avg_gpa: number;
    avg_internal: number;
    avg_attendance: number;
    avg_risk_score: number;
  }[];
  risk_factors: { factor: string; count: number }[];
  priority_attention: {
    student_id: string;
    first_name: string;
    last_name: string;
    department: string;
    semester: number;
    attendance_pct: number;
    gpa: number;
    risk_score: number;
    risk_category: RiskCategory;
    session_count: number;
  }[];
  recent_activity: {
    action: string;
    user_name: string;
    entity_type: string;
    details: string;
    timestamp: string;
  }[];
}

export interface ModelMetrics {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: {
    true_negative: number;
    false_positive: number;
    false_negative: number;
    true_positive: number;
  };
  test_set_size: number;
  train_set_size: number;
  feature_importance: Record<string, number>;
  is_baseline?: boolean;
  notes?: string;
}

export interface ModelInsights {
  active_model: string;
  supported_models: string[];
  models_metrics: Record<string, ModelMetrics>;
  input_features: { key: string; label: string; type: string }[];
  preprocessing_pipeline: string[];
  methodology: {
    validation_method: string;
    dataset_origin: string;
    ethical_safeguard: string;
  };
  limitations: string[];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  student_id?: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Counselor' | 'Viewer';
  department: string;
  status?: 'active' | 'pending' | 'deactivated';
  email_verified?: number | boolean;
  created_at?: string;
  last_login?: string;
}

export interface AuthResponse {
  token: string | null;
  message?: string;
  status?: string;
  verification_token?: string;
  user: User;
}

export interface AuditLogItem {
  id: number;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  timestamp: string;
}
