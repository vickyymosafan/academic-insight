'use client';

import { useState, useEffect, useCallback } from 'react';
import { Student } from '@/types/database';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { supabase } from '@/lib/supabaseClient';

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
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<keyof Student>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, programFilter, angkatanFilter, statusFilter]);

  // Fetch students data
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build base query for counting total items
      let countQuery = supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Build main query for fetching data
      let dataQuery = supabase
        .from('students')
        .select('*');

      // Apply filters to both queries
      const applyFilters = (query: ReturnType<typeof supabase.from>) => {
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,nim.ilike.%${searchQuery}%`);
        }
        
        if (programFilter) {
          query = query.eq('program_studi', programFilter);
        }
        
        if (angkatanFilter) {
          query = query.eq('angkatan', parseInt(angkatanFilter));
        }
        
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }
        
        return query;
      };

      countQuery = applyFilters(countQuery);
      dataQuery = applyFilters(dataQuery);

      // Apply sorting and pagination to data query
      dataQuery = dataQuery
        .order(String(sortKey), { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      // Execute both queries
      const [{ count }, { data, error }] = await Promise.all([
        countQuery,
        dataQuery
      ]);

      if (error) {
        console.error('Error fetching students:', error);
        return;
      }

      const total = count || 0;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, programFilter, angkatanFilter, statusFilter, sortKey, sortDirection, currentPage, itemsPerPage]);

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
      render: (value: number) => `Semester ${value}`
    },
    {
      key: 'ipk' as keyof Student,
      label: 'IPK',
      sortable: true,
      className: 'text-center font-medium text-gray-900',
      render: (value: number) => formatIPK(value)
    },
    {
      key: 'status' as keyof Student,
      label: 'Status',
      sortable: true,
      className: 'text-center',
      render: (value: Student['status']) => getStatusBadge(value)
    }
  ];

  return (
    <div className={className}>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <DataTable
          data={students}
          columns={columns}
          loading={loading}
          emptyMessage="Tidak ada data mahasiswa yang ditemukan"
          onSort={handleSort}
          sortKey={sortKey}
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