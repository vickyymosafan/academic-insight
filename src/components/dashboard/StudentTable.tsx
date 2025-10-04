'use client';

import { useState, useEffect, useMemo } from 'react';
import { Student } from '@/types/database';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { useRealtimeStudents } from '@/hooks/useRealtimeStudents';
import { useToast } from '@/lib/toast-context';
import { SignalIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface StudentTableProps {
  searchQuery?: string;
  programFilter?: string;
  angkatanFilter?: string;
  statusFilter?: string;
  className?: string;
}

export default function StudentTable({
  searchQuery = '',
  programFilter = '',
  angkatanFilter = '',
  statusFilter = '',
  className = ''
}: StudentTableProps) {
  const toast = useToast();
  const [sortKey, setSortKey] = useState<keyof Student>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Listen for realtime events and show toast notifications
  useEffect(() => {
    const handleStudentAdded = (event: Event) => {
      const customEvent = event as CustomEvent;
      toast.success(`Mahasiswa baru ditambahkan: ${customEvent.detail.name}`);
    };

    const handleStudentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      toast.info(`Data mahasiswa diperbarui: ${customEvent.detail.name}`);
    };

    const handleStudentDeleted = () => {
      toast.info('Data mahasiswa dihapus');
    };

    window.addEventListener('student-added', handleStudentAdded);
    window.addEventListener('student-updated', handleStudentUpdated);
    window.addEventListener('student-deleted', handleStudentDeleted);

    return () => {
      window.removeEventListener('student-added', handleStudentAdded);
      window.removeEventListener('student-updated', handleStudentUpdated);
      window.removeEventListener('student-deleted', handleStudentDeleted);
    };
  }, [toast]);

  // Use realtime hook with filters
  const realtimeFilter = useMemo(() => ({
    ...(programFilter && { program_studi: programFilter }),
    ...(angkatanFilter && { angkatan: parseInt(angkatanFilter) }),
    ...(statusFilter && { status: statusFilter }),
  }), [programFilter, angkatanFilter, statusFilter]);

  const { 
    students: allStudents, 
    loading, 
    error,
    refetch,
    realtimeStatus,
    reconnect 
  } = useRealtimeStudents({
    filter: Object.keys(realtimeFilter).length > 0 ? realtimeFilter : undefined,
    enabled: true,
  });

  // Client-side filtering for search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return allStudents;
    
    const query = searchQuery.toLowerCase();
    return allStudents.filter(student => 
      student.name.toLowerCase().includes(query) ||
      student.nim.toLowerCase().includes(query)
    );
  }, [allStudents, searchQuery]);

  // Client-side sorting
  const sortedStudents = useMemo(() => {
    const sorted = [...filteredStudents];
    sorted.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });
    return sorted;
  }, [filteredStudents, sortKey, sortDirection]);

  // Client-side pagination
  const totalItems = sortedStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedStudents.slice(startIndex, endIndex);
  }, [sortedStudents, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, programFilter, angkatanFilter, statusFilter]);

  const handleSort = (key: keyof Student, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const getStatusBadge = (status: Student['status']) => {
    const statusConfig = {
      aktif: { color: 'bg-green-100 text-green-800', label: 'Aktif' },
      lulus: { color: 'bg-blue-100 text-blue-800', label: 'Lulus' },
      dropout: { color: 'bg-red-100 text-red-800', label: 'Dropout' },
      cuti: { color: 'bg-yellow-100 text-yellow-800', label: 'Cuti' }
    };

    const config = statusConfig[status] || statusConfig.aktif;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatIPK = (ipk: number) => {
    return ipk.toFixed(2);
  };

  const columns = [
    {
      key: 'nim' as keyof Student,
      label: 'NIM',
      sortable: true,
      className: 'font-mono text-gray-900'
    },
    {
      key: 'name' as keyof Student,
      label: 'Nama',
      sortable: true,
      className: 'font-medium text-gray-900'
    },
    {
      key: 'program_studi' as keyof Student,
      label: 'Program Studi',
      sortable: true,
      className: 'text-gray-600'
    },
    {
      key: 'angkatan' as keyof Student,
      label: 'Angkatan',
      sortable: true,
      className: 'text-gray-900'
    },
    {
      key: 'semester_current' as keyof Student,
      label: 'Semester',
      sortable: true,
      className: 'text-center text-gray-900',
      render: (value: unknown) => `Semester ${value as number}`
    },
    {
      key: 'ipk' as keyof Student,
      label: 'IPK',
      sortable: true,
      className: 'text-center font-medium text-gray-900',
      render: (value: unknown) => formatIPK(value as number)
    },
    {
      key: 'status' as keyof Student,
      label: 'Status',
      sortable: true,
      className: 'text-center',
      render: (value: unknown) => getStatusBadge(value as Student['status'])
    }
  ];

  return (
    <div className={className}>
      {/* Realtime Status Indicator */}
      <div className={`mb-4 rounded-md p-3 transition-all duration-300 ${
        realtimeStatus.isConnected 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {realtimeStatus.isConnected ? (
                <SignalIcon className="h-4 w-4 text-green-400 animate-pulse" aria-hidden="true" />
              ) : (
                <SignalIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
              )}
            </div>
            <div className="ml-2">
              <p className={`text-xs font-medium ${
                realtimeStatus.isConnected ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {realtimeStatus.isConnected 
                  ? '🔴 Live - Tabel diperbarui secara real-time' 
                  : 'Koneksi real-time terputus'}
              </p>
              {realtimeStatus.lastUpdate && (
                <p className={`text-xs mt-0.5 ${
                  realtimeStatus.isConnected ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  Update terakhir: {new Date(realtimeStatus.lastUpdate).toLocaleTimeString('id-ID')}
                </p>
              )}
            </div>
          </div>
          {!realtimeStatus.isConnected && (
            <button
              type="button"
              onClick={reconnect}
              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <ArrowPathIcon className="h-3 w-3 mr-1" />
              Reconnect
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error memuat data</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                type="button"
                onClick={refetch}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <DataTable
          data={paginatedStudents as unknown as Record<string, unknown>[]}
          columns={columns as never}
          loading={loading}
          emptyMessage="Tidak ada data mahasiswa yang ditemukan"
          onSort={handleSort as never}
          sortKey={sortKey as string}
          sortDirection={sortDirection}
          className="rounded-none shadow-none"
        />
        
        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </div>
  );
}