import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DashboardOverview from '../DashboardOverview';
import { mockDashboardStats } from '@/__mocks__/supabase';

// Mock the realtime hook
const mockRefetch = jest.fn();
const mockReconnect = jest.fn();

jest.mock('@/hooks/useRealtimeDashboardStats', () => ({
  useRealtimeDashboardStats: jest.fn(() => ({
    stats: mockDashboardStats,
    loading: false,
    error: null,
    refetch: mockRefetch,
    realtimeStatus: {
      isConnected: true,
      lastUpdate: new Date().toISOString(),
      error: null,
    },
    reconnect: mockReconnect,
  })),
}));

// Mock ChartContainer to avoid recharts rendering issues in tests
jest.mock('../ChartContainer', () => {
  return function MockChartContainer({ title, type }: { title: string; type: string }) {
    return <div data-testid={`chart-${type}`}>{title}</div>;
  };
});

describe('DashboardOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all statistics cards', () => {
    render(<DashboardOverview />);

    expect(screen.getByText('Total Mahasiswa')).toBeInTheDocument();
    expect(screen.getByText('Mahasiswa Aktif')).toBeInTheDocument();
    expect(screen.getByText('IPK Rata-rata')).toBeInTheDocument();
    expect(screen.getByText('Tingkat Kelulusan')).toBeInTheDocument();
    expect(screen.getByText('Mahasiswa Lulus')).toBeInTheDocument();
    expect(screen.getByText('Tingkat Dropout')).toBeInTheDocument();
  });

  it('should display correct statistics values', () => {
    render(<DashboardOverview />);

    expect(screen.getByText('1234')).toBeInTheDocument(); // total_students
    expect(screen.getByText('1000')).toBeInTheDocument(); // active_students
    expect(screen.getByText('3.45')).toBeInTheDocument(); // average_gpa
    expect(screen.getByText('85.0%')).toBeInTheDocument(); // graduation_rate
    expect(screen.getByText('200')).toBeInTheDocument(); // graduated_students
    expect(screen.getByText('2.8%')).toBeInTheDocument(); // dropout_rate
  });

  it('should render all chart containers', () => {
    render(<DashboardOverview />);

    expect(screen.getByTestId('chart-gpa-distribution')).toBeInTheDocument();
    expect(screen.getByTestId('chart-program-distribution')).toBeInTheDocument();
    expect(screen.getByTestId('chart-graduation-trends')).toBeInTheDocument();
    expect(screen.getByTestId('chart-dropout-analysis')).toBeInTheDocument();
  });

  it('should show realtime connection indicator', () => {
    render(<DashboardOverview />);

    expect(screen.getByText(/Live - Data diperbarui secara real-time/i)).toBeInTheDocument();
  });

  it('should hide realtime indicator when close button is clicked', () => {
    render(<DashboardOverview />);

    const closeButton = screen.getByRole('button', { name: /tutup/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText(/Live - Data diperbarui secara real-time/i)).not.toBeInTheDocument();
  });

  it('should display error message when data fetch fails', () => {
    const useRealtimeDashboardStats = require('@/hooks/useRealtimeDashboardStats').useRealtimeDashboardStats;
    useRealtimeDashboardStats.mockReturnValue({
      stats: null,
      loading: false,
      error: 'Failed to fetch data',
      refetch: mockRefetch,
      realtimeStatus: {
        isConnected: false,
        lastUpdate: null,
        error: 'Connection error',
      },
      reconnect: mockReconnect,
    });

    render(<DashboardOverview />);

    expect(screen.getByText('Error memuat data statistik')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
  });

  it('should call refetch when retry button is clicked on error', () => {
    const useRealtimeDashboardStats = require('@/hooks/useRealtimeDashboardStats').useRealtimeDashboardStats;
    useRealtimeDashboardStats.mockReturnValue({
      stats: null,
      loading: false,
      error: 'Failed to fetch data',
      refetch: mockRefetch,
      realtimeStatus: {
        isConnected: false,
        lastUpdate: null,
        error: 'Connection error',
      },
      reconnect: mockReconnect,
    });

    render(<DashboardOverview />);

    const retryButton = screen.getByRole('button', { name: /coba lagi/i });
    fireEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should show loading state for statistics', () => {
    const useRealtimeDashboardStats = require('@/hooks/useRealtimeDashboardStats').useRealtimeDashboardStats;
    useRealtimeDashboardStats.mockReturnValue({
      stats: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
      realtimeStatus: {
        isConnected: true,
        lastUpdate: null,
        error: null,
      },
      reconnect: mockReconnect,
    });

    render(<DashboardOverview />);

    // Should show skeleton loading states
    const skeletonElements = screen.getAllByRole('generic', { hidden: true });
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should show disconnected state and reconnect button', () => {
    const useRealtimeDashboardStats = require('@/hooks/useRealtimeDashboardStats').useRealtimeDashboardStats;
    useRealtimeDashboardStats.mockReturnValue({
      stats: mockDashboardStats,
      loading: false,
      error: null,
      refetch: mockRefetch,
      realtimeStatus: {
        isConnected: false,
        lastUpdate: new Date().toISOString(),
        error: 'Connection lost',
      },
      reconnect: mockReconnect,
    });

    render(<DashboardOverview />);

    expect(screen.getByText('Koneksi real-time terputus')).toBeInTheDocument();
    expect(screen.getByText('Error: Connection lost')).toBeInTheDocument();
    
    const reconnectButton = screen.getByRole('button', { name: /reconnect/i });
    expect(reconnectButton).toBeInTheDocument();
    
    fireEvent.click(reconnectButton);
    expect(mockReconnect).toHaveBeenCalledTimes(1);
  });

  it('should show info message when no students data', () => {
    const useRealtimeDashboardStats = require('@/hooks/useRealtimeDashboardStats').useRealtimeDashboardStats;
    useRealtimeDashboardStats.mockReturnValue({
      stats: {
        ...mockDashboardStats,
        total_students: 0,
        active_students: 0,
        graduated_students: 0,
        dropout_students: 0,
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
      realtimeStatus: {
        isConnected: true,
        lastUpdate: new Date().toISOString(),
        error: null,
      },
      reconnect: mockReconnect,
    });

    render(<DashboardOverview />);

    expect(screen.getByText('Belum ada data mahasiswa')).toBeInTheDocument();
    expect(screen.getByText(/Silakan tambahkan data mahasiswa terlebih dahulu/i)).toBeInTheDocument();
  });

  it('should display last update time', () => {
    const mockDate = new Date('2024-01-01T12:00:00Z');
    const useRealtimeDashboardStats = require('@/hooks/useRealtimeDashboardStats').useRealtimeDashboardStats;
    useRealtimeDashboardStats.mockReturnValue({
      stats: mockDashboardStats,
      loading: false,
      error: null,
      refetch: mockRefetch,
      realtimeStatus: {
        isConnected: true,
        lastUpdate: mockDate.toISOString(),
        error: null,
      },
      reconnect: mockReconnect,
    });

    render(<DashboardOverview />);

    expect(screen.getByText(/Update terakhir:/i)).toBeInTheDocument();
  });
});
