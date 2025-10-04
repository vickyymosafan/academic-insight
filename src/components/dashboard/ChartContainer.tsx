'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useRealtimeStudents } from '@/hooks/useRealtimeStudents';

interface Student {
  status: 'aktif' | 'lulus' | 'dropout' | 'cuti';
  ipk: number | null;
  program_studi: string;
  angkatan: number;
  semester_current: number;
}

interface ChartData {
  name: string;
  value: number;
  count?: number;
  [key: string]: string | number | undefined;
}

interface ChartContainerProps {
  type: 'gpa-distribution' | 'graduation-trends' | 'dropout-analysis' | 'program-distribution';
  title: string;
  height?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function ChartContainer({ type, title, height = 300 }: ChartContainerProps) {
  // Use realtime hook to get students data
  const { students, loading, error, refetch } = useRealtimeStudents({
    enabled: true,
  });

  // Calculate chart data based on realtime students data
  const data = useMemo(() => {
    if (!students || students.length === 0) return [];

    switch (type) {
      case 'gpa-distribution':
        return generateGPADistribution(students);
      case 'graduation-trends':
        return generateGraduationTrends(students);
      case 'dropout-analysis':
        return generateDropoutAnalysis(students);
      case 'program-distribution':
        return generateProgramDistribution(students);
      default:
        return [];
    }
  }, [students, type]);

  const generateGPADistribution = (students: Student[]): ChartData[] => {
    const studentsWithGPA = students.filter(s => s.ipk && s.ipk > 0);
    const ranges = [
      { name: '0.00-1.00', min: 0, max: 1 },
      { name: '1.01-2.00', min: 1.01, max: 2 },
      { name: '2.01-2.50', min: 2.01, max: 2.5 },
      { name: '2.51-3.00', min: 2.51, max: 3 },
      { name: '3.01-3.50', min: 3.01, max: 3.5 },
      { name: '3.51-4.00', min: 3.51, max: 4 },
    ];

    return ranges.map(range => ({
      name: range.name,
      value: studentsWithGPA.filter(s => 
        s.ipk! >= range.min && s.ipk! <= range.max
      ).length,
    }));
  };

  const generateGraduationTrends = (students: Student[]): ChartData[] => {
    const graduationByYear = students
      .filter(s => s.status === 'lulus')
      .reduce((acc, student) => {
        // Estimate graduation year based on angkatan + 4 years
        const graduationYear = student.angkatan + 4;
        acc[graduationYear] = (acc[graduationYear] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

    return Object.entries(graduationByYear)
      .map(([year, count]) => ({
        name: year,
        value: count,
      }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));
  };

  const generateDropoutAnalysis = (students: Student[]): ChartData[] => {
    const dropoutBySemester = students
      .filter(s => s.status === 'dropout')
      .reduce((acc, student) => {
        const semester = student.semester_current || 1;
        acc[semester] = (acc[semester] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

    return Object.entries(dropoutBySemester)
      .map(([semester, count]) => ({
        name: `Semester ${semester}`,
        value: count,
      }))
      .sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));
  };

  const generateProgramDistribution = (students: Student[]): ChartData[] => {
    const programCounts = students.reduce((acc, student) => {
      acc[student.program_studi] = (acc[student.program_studi] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(programCounts).map(([program, count]) => ({
      name: program,
      value: count,
    }));
  };

  const renderChart = () => {
    if (type === 'program-distribution') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'graduation-trends') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Jumlah Lulusan"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="value" 
            fill="#3B82F6"
            name={type === 'gpa-distribution' ? 'Jumlah Mahasiswa' : 'Jumlah'}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
}