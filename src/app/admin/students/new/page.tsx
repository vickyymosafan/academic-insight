'use client';

import Link from 'next/link';
import StudentForm from '@/components/forms/StudentForm';

export default function NewStudentPage() {
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
            Tambah Mahasiswa Baru
          </h1>
          <p className="text-gray-600">
            Isi form di bawah untuk menambahkan data mahasiswa baru
          </p>
        </div>

        {/* Form */}
        <StudentForm />
      </div>
    </div>
  );
}
