'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';
import type { Student } from '@/types/database';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SearchInput from '@/components/ui/SearchInput';
import FilterSelect from '@/components/ui/FilterSelect';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; student: Student | null }>({
    isOpen: false,
    student: null
  });
  const [filters, setFilters] = useState({
    search: '',
    program: '',
    angkatan: '',
    status: ''
  });

  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.program) params.append('program', filters.program);
      if (filters.angkatan) params.append('angkatan', filters.angkatan);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/students?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengambil data');
      }

      setStudents(result.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.student) return;

    try {
      const response = await fetch(`/api/students/${deleteDialog.student.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menghapus data');
      }

      toast.success(result.message);
      setDeleteDialog({ isOpen: false, student: null });
      fetchStudents();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      aktif: 'bg-green-100 text-green-800',
      lulus: 'bg-blue-100 text-blue-800',
      cuti: 'bg-yellow-100 text-yellow-800',
      dropout: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Manajemen Data Mahasiswa
          </h1>
          <p className="text-gray-600">
            Kelola data mahasiswa: tambah, edit, dan hapus data
          </p>
        </div>

        {/* Actions and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <Link
              href="/admin/students/new"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Mahasiswa
            </Link>

            <button
              onClick={fetchStudents}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SearchInput
              onSearch={(value) => setFilters({ ...filters, search: value })}
              placeholder="Cari nama atau NIM..."
            />

            <FilterSelect
              value={filters.program}
              onChange={(value) => setFilters({ ...filters, program: value })}
              options={[
                { value: '', label: 'Semua Program Studi' },
                { value: 'Teknik Informatika', label: 'Teknik Informatika' },
                { value: 'Sistem Informasi', label: 'Sistem Informasi' },
                { value: 'Teknik Komputer', label: 'Teknik Komputer' },
                { value: 'Manajemen Informatika', label: 'Manajemen Informatika' }
              ]}
            />

            <FilterSelect
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'aktif', label: 'Aktif' },
                { value: 'lulus', label: 'Lulus' },
                { value: 'cuti', label: 'Cuti' },
                { value: 'dropout', label: 'Dropout' }
              ]}
            />

            <input
              type="number"
              value={filters.angkatan}
              onChange={(e) => setFilters({ ...filters, angkatan: e.target.value })}
              placeholder="Angkatan"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <LoadingSpinner size="lg" label="Memuat data mahasiswa..." />
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Tidak ada data mahasiswa</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Studi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Angkatan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IPK</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.nim}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.program_studi}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.angkatan}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.ipk.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(student.status)}`}>
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            href={`/admin/students/${student.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, student })}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {students.map((student) => (
                  <div key={student.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.nim}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(student.status)}`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <p>{student.program_studi}</p>
                      <p>Angkatan {student.angkatan} • IPK {student.ipk.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/students/${student.id}/edit`}
                        className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteDialog({ isOpen: true, student })}
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Total Count */}
        {!isLoading && students.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: {students.length} mahasiswa
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Hapus Data Mahasiswa"
        message={`Apakah Anda yakin ingin menghapus data mahasiswa ${deleteDialog.student?.name} (${deleteDialog.student?.nim})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, student: null })}
      />
    </div>
  );
}
