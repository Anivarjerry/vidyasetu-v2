
export type Role = 'principal' | 'teacher' | 'parent' | 'admin' | 'driver' | 'student';

export type LoginStatus = 'success' | 'subscription_required' | 'blocked' | 'error';

export interface LoginRequest {
  school_id: string; // This is actually school_code in the DB
  mobile: string;
  password: string;
  secret_code?: string; // For Admin
}

export interface PeriodData {
  id?: string; // DB ID
  period_number: number;
  status: 'pending' | 'submitted';
  class_name?: string;
  subject?: string;
  lesson?: string;
  homework?: string;
  homework_type?: string; // NEW: To store source of homework
  submitted?: boolean; 
}

export interface AttendanceStatus {
  student_id: string;
  student_name: string;
  status: 'present' | 'absent' | 'leave';
}

export interface AttendanceHistoryItem {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
  marked_by_name?: string;
}

export interface Student {
  id: string;
  name: string;
  class_name: string;
  roll_number?: string;
}

export interface Vehicle {
  id: string;
  school_id: string;
  vehicle_number: string;
  vehicle_type: 'bus' | 'van' | 'auto';
  driver_id?: string;
  driver_name?: string;
  is_active: boolean;
  last_lat?: number;
  last_lng?: number;
  updated_at?: string;
}

export interface SchoolSummary {
  principal_name: string;
  total_teachers: number;
  total_drivers: number;
  total_students: number;
  school_name: string;
  school_code: string;
  total_periods?: number; // Added for dynamic periods
}

export interface SchoolUser {
  id: string;
  name: string;
  mobile: string;
  role?: string;
}

export interface SiblingInfo {
  id: string;
  name: string;
  class_name: string;
}

export interface DashboardData {
  user_id?: string;
  school_db_id?: string;
  user_name: string;
  user_role: Role;
  mobile_number: string;
  school_name: string;
  school_code: string;
  subscription_status: 'active' | 'inactive';
  school_subscription_status: 'active' | 'inactive';
  subscription_end_date?: string;
  total_periods?: number; // Added for dynamic periods
  periods?: PeriodData[];
  class_name?: string;
  section?: string;
  student_id?: string;
  student_name?: string;
  father_name?: string; 
  linked_parent_id?: string; // NEW: To link student leave requests to parent account
  today_attendance?: 'present' | 'absent' | 'leave' | 'pending';
  siblings?: SiblingInfo[]; // NEW: List of all students linked to a parent
}

export interface ParentHomework {
  id?: string;
  period: string;
  subject: string;
  teacher_name: string;
  homework: string;
  homework_type?: string; // NEW: Visible to parents
  status: 'pending' | 'completed';
}

export interface StaffLeave {
  id?: string;
  user_id: string;
  school_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  principal_comment?: string;
  created_at?: string;
  user_name?: string; // Joined from users
}

export interface StudentLeave {
  id?: string;
  student_id: string;
  parent_id: string;
  school_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  principal_comment?: string;
  created_at?: string;
  student_name?: string; // Joined
}

export interface LoginResponse {
  status: LoginStatus;
  message?: string;
  role?: Role;
  user_role?: Role; 
  user_name?: string;
  user_id?: string;
  school_db_id?: string;
}

export interface NoticeItem {
  id?: string;
  timestamp?: string;
  date: string;
  title: string;
  message: string;
  category: 'holiday' | 'ptm' | 'general' | 'event';
}

export interface NoticeRequest {
  school_id: string;
  date: string;
  title: string;
  message: string;
  category: string;
  target: string;
}

export interface AnalyticsSummary {
  total_teachers: number;
  active_teachers: number;
  inactive_teachers: number;
  total_periods_expected: number;
  total_periods_submitted: number;
  teacher_list: TeacherProgress[];
}

export interface TeacherProgress {
  id: string;
  name: string;
  mobile: string;
  periods_submitted: number;
  total_periods: number;
}

export interface HomeworkAnalyticsData {
  total_students: number;
  fully_completed: number;
  partial_completed: number;
  pending: number;
  student_list: StudentHomeworkStatus[];
}

export interface StudentHomeworkStatus {
  student_id: string;
  student_name: string;
  class_name: string;
  parent_name: string;
  total_homeworks: number;
  completed_homeworks: number;
  status: 'completed' | 'partial' | 'pending' | 'no_homework';
}
