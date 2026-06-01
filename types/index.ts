export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'teacher' | 'student';
  is_approved: boolean;
  current_session_token: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  teacher_id: string;
  price: number;
  thumbnail?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserCourseAccess {
  id: string;
  user_id: string;
  course_id: string;
  purchased_at: string;
  expires_at: string | null;
  payment_proof?: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url: string;
  duration: number;
  order: number;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  name: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'student' | 'teacher';
}
