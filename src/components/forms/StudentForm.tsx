'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast-context';
import type { Student } from '@/types/database';
import type { FormValidationError } from '@/types/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface StudentFormProps {
  initialData?: Student;
  isEdit?: boolean;
}

export default function StudentForm({ initialData, isEdit = false }: StudentFormProps) {
  const [formData, setFormData] = useState({
    nim: initialData?.nim || '',
    name: initialData?.name || '',
    program_studi: initialData?.program_studi || '',
    angkatan: initialData?.angkatan || new Date().getFullYear(),
    ipk: initialData?.ipk?.toString() || '',
    semester_current: initialData?.semester_current || 1,
    status: initialData?.status || 'aktif'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const url = isEdit ? `/api/students/${initialData?.id}` : '/api/students';
      const method = isEdit ? 'PUT' : 'POST';

      // Prepare data
      const submitData: any = {
        name: formData.name,
        program_studi: formData.program_studi,
        angkatan: formData.angkatan,
        status: formData.status,
        semester_current: formData.semester_current
      };

      // Only include NIM for create
      if (!isEdit) {
        submitData.nim = formData.nim;
      }

      // Only include IPK if provided
      if (formData.ipk) {
        submitData.ipk = parseFloat(formData.ipk);
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          // Handle validation errors
          const errorMap: Record<string, string> = {};
          result.details.forEach((error: FormValidationError) => {
            errorMap[error.field] = error.message;
          });
          setErrors(errorMap);
          toast.error('Mohon perbaiki kesalahan pada form');
        } else {
          throw new Error(result.error || 'Terjadi kesalahan');
        }
        return;
      }

      // Success
      toast.success(result.message);
      router.push('/admin/students');
      router.refresh();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NIM Input */}
        <div>
          <label htmlFor="nim" className="block text-sm font-medium text-gray-700 mb-2">
            NIM *
          </label>
          <input
            type="text"
            id="nim"
            name="nim"
            value={formData.nim}
            onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
            disabled={isEdit || isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.nim ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Masukkan NIM"
          />
          {errors.nim && <p className="mt-1 text-sm text-red-600">{errors.nim}</p>}
          {isEdit && <p className="mt-1 text-xs text-gray-500">NIM tidak dapat diubah</p>}
        </div>

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Masukkan nama lengkap"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Program Studi Select */}
        <div>
          <label htmlFor="program_studi" className="block text-sm font-medium text-gray-700 mb-2">
            Program Studi *
          </label>
          <select
            id="program_studi"
            name="program_studi"
            value={formData.program_studi}
            onChange={(e) => setFormData({ ...formData, program_studi: e.target.value })}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              errors.program_studi ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Pilih Program Studi</option>
            <option value="Teknik Informatika">Teknik Informatika</option>
            <option value="Sistem Informasi">Sistem Informasi</option>
            <option value="Teknik Komputer">Teknik Komputer</option>
            <option value="Manajemen Informatika">Manajemen Informatika</option>
          </select>
          {errors.program_studi && <p className="mt-1 text-sm text-red-600">{errors.program_studi}</p>}
        </div>

        {/* Angkatan Input */}
        <div>
          <label htmlFor="angkatan" className="block text-sm font-medium text-gray-700 mb-2">
            Angkatan *
          </label>
          <input
            type="number"
            id="angkatan"
            name="angkatan"
            min="2000"
            max={new Date().getFullYear()}
            value={formData.angkatan}
            onChange={(e) => setFormData({ ...formData, angkatan: parseInt(e.target.value) || new Date().getFullYear() })}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              errors.angkatan ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tahun angkatan"
          />
          {errors.angkatan && <p className="mt-1 text-sm text-red-600">{errors.angkatan}</p>}
        </div>

        {/* IPK Input */}
        <div>
          <label htmlFor="ipk" className="block text-sm font-medium text-gray-700 mb-2">
            IPK
          </label>
          <input
            type="number"
            id="ipk"
            name="ipk"
            step="0.01"
            min="0"
            max="4"
            value={formData.ipk}
            onChange={(e) => setFormData({ ...formData, ipk: e.target.value })}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              errors.ipk ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00 - 4.00"
          />
          {errors.ipk && <p className="mt-1 text-sm text-red-600">{errors.ipk}</p>}
        </div>

        {/* Semester Current Input */}
        <div>
          <label htmlFor="semester_current" className="block text-sm font-medium text-gray-700 mb-2">
            Semester Saat Ini
          </label>
          <input
            type="number"
            id="semester_current"
            name="semester_current"
            min="1"
            max="14"
            value={formData.semester_current}
            onChange={(e) => setFormData({ ...formData, semester_current: parseInt(e.target.value) || 1 })}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              errors.semester_current ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Semester 1-14"
          />
          {errors.semester_current && <p className="mt-1 text-sm text-red-600">{errors.semester_current}</p>}
        </div>

        {/* Status Select */}
        <div className="md:col-span-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              errors.status ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="aktif">Aktif</option>
            <option value="lulus">Lulus</option>
            <option value="cuti">Cuti</option>
            <option value="dropout">Dropout</option>
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {isLoading ? 'Menyimpan...' : (isEdit ? 'Perbarui Data' : 'Simpan Data')}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="flex-1 sm:flex-none bg-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
