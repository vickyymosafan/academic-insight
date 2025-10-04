// Dashboard and Analytics Types

export interface DashboardStats {
  total_students: number;
  active_students: number;
  graduated_students: number;
  dropout_students: number;
  average_gpa: number;
  graduation_rate: number;
  dropout_rate: number;
  semester_distribution: SemesterDistribution[];
}

export interface SemesterDistribution {
  semester: number;
  count: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string[];
  borderColor?: string[];
  borderWidth?: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
}

export interface FilterOptions {
  program_studi?: string;
  angkatan?: number;
  status?: string;
  semester?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}