'use client';

import { useState } from 'react';
import SearchInput from '@/components/ui/SearchInput';
import FilterSelect from '@/components/ui/FilterSelect';
import StudentTable from '@/components/dashboard/StudentTable';

interface StudentDataTableProps {
  className?: string;
}

export default function StudentDataTable({ className = '' }: StudentDataTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [angkatanFilter, setAngkatanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filter options
  const programOptions = [
    { value: 'Teknik Informatika', label: 'Teknik Informatika' },
    { value: 'Sistem Informasi', label: 'Sistem Informasi' },
    { value: 'Teknik Komputer', label: 'Teknik Komputer' },
    { value: 'Manajemen Informatika', label: 'Manajemen Informatika' }
  ];

  const angkatanOptions = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: '2019', label: '2019' },
    { value: '2018', label: '2018' }
  ];

  const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'lulus', label: 'Lulus' },
    { value: 'dropout', label: 'Dropout' },
    { value: 'cuti', label: 'Cuti' }
  ];

  const handleClearFilters = () => {
    setSearchQuery('');
    setProgramFilter('');
    setAngkatanFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = searchQuery || programFilter || angkatanFilter || statusFilter;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Data Mahasiswa</h2>
          <p className="text-sm text-gray-600 mt-1">
            Kelola dan lihat data mahasiswa dengan fitur pencarian dan filter
          </p>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="mt-4 sm:mt-0 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Hapus Filter
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <SearchInput
              placeholder="Cari berdasarkan nama atau NIM..."
              onSearch={setSearchQuery}
              className="w-full"
            />
          </div>

          {/* Program Studi Filter */}
          <FilterSelect
            options={programOptions}
            value={programFilter}
            onChange={setProgramFilter}
            placeholder="Semua Program Studi"
            label="Program Studi"
          />

          {/* Angkatan Filter */}
          <FilterSelect
            options={angkatanOptions}
            value={angkatanFilter}
            onChange={setAngkatanFilter}
            placeholder="Semua Angkatan"
            label="Angkatan"
          />
        </div>

        {/* Second row of filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Status Filter */}
          <FilterSelect
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Semua Status"
            label="Status"
          />

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="md:col-span-2 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Filter aktif:</span>
              
              {searchQuery && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Pencarian: &quot;{searchQuery}&quot;
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              
              {programFilter && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {programFilter}
                  <button
                    onClick={() => setProgramFilter('')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              
              {angkatanFilter && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Angkatan {angkatanFilter}
                  <button
                    onClick={() => setAngkatanFilter('')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              
              {statusFilter && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Status: {statusOptions.find(opt => opt.value === statusFilter)?.label}
                  <button
                    onClick={() => setStatusFilter('')}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <StudentTable
        searchQuery={searchQuery}
        programFilter={programFilter}
        angkatanFilter={angkatanFilter}
        statusFilter={statusFilter}
      />
    </div>
  );
}