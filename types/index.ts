// Course Types
export interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  requiredHours: number;
  status: 'C' | 'R' | 'E'; // Compulsory, Required, Elective
  department: string;
  prerequisites: string[];
  specializationAreas: string[];
}

// Lecturer Types
export interface Lecturer {
  id: string;
  fullName: string;
  email: string;
  rank: string;
  departments: string[];
  specializations: string[];
  expertiseRatings: Record<string, number>;
  preferenceRatings: Record<string, number>;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
  };
  minWorkload: number;
  maxWorkload: number;
  yearsExperience?: number;
}

// Assignment Types
export interface Assignment {
  lecturerId: string;
  courseId: string;
  hours: number;
}

// Allocation Types
export interface Allocation {
  id: string;
  date: string;
  assignments: Assignment[];
  modifiedDate?: string;
  isModified?: boolean;
}

// Allocation Result Types
export interface AllocationResult {
  success: boolean;
  message?: string;
  assignments: Assignment[];
  unallocatedCourses?: Course[];
  unallocatedLecturers?: Lecturer[];
  metrics?: {
    accuracy: number;
    workloadFairness: number;
    expertiseAlignment: number;
    constraintAdherence: number;
  };
}

// Settings Types
export interface AllocationSettings {
  maxLecturerWorkload: number;
  minLecturerWorkload: number;
  expertiseWeight: number;
  preferenceWeight: number;
  allowOverloading: boolean;
  enforceAvailability: boolean;
  maxLecturersPerCourse: number;
  max3UnitCoursesPerLecturer: number;
}

// User Types
export interface User {
  id: string;
  fullName?: string; // Add this
  name?: string;     // Keep for compatibility
  email?: string;
  role: 'admin' | 'lecturer' | 'main_admin' | 'student';
  status?: 'pending' | 'approved' | 'rejected';
  rank?: string;     // Add this so (user as any) isn't needed
}

// Profile Types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
}

// Student Types
export interface Student {
  id: string;
  fullName: string;
  email: string;
  matricNumber: string;
  department: string;
  level: number;
  registeredCourses: string[];
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: string;
  rank?: string;
  departments?: string[];
  specializations?: string[];
  expertiseRatings?: Record<string, number>;
  preferenceRatings?: Record<string, number>;
  minWorkload?: number;
  maxWorkload?: number;
  yearsExperience?: number;
  matricNumber?: string;
  level?: number;
}

// Allocation Metrics
export interface AllocationMetrics {
  totalCourses: number;
  allocatedCourses: number;
  unallocatedCourses: number;
  totalLecturers: number;
  averageWorkload: number;
  workloadFairness: number;
  expertiseAlignment: number;
  constraintSatisfaction: number;
}

// Add this to help with Next.js App Router Page Props
export interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Add this for API/Server Action Responses
export interface ActionResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}