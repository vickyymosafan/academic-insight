'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StudentForm from '@/components/forms/StudentForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/lib/toast-context';
import type { Student } from '@/types/database';

export default function EditStudentPage() {
  const params = useParams();
  const id = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/students/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengambil data mahasiswa');
      }

      setStudent(result.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/students"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Daftar Mahasiswa
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Edit Data Mahasiswa
          </h1>
          <p className="text-gray-600">
            Perbarui informasi mahasiswa
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <LoadingSpinner size="lg" label="Memuat data mahasiswa..." />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="text-red-600 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat Data</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchStudent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : student ? (
          <StudentForm initialData={student} isEdit={true} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center text-gray-500">
              <p>Data mahasiswa tidak ditemukan</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
