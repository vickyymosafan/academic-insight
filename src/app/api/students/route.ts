import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { validateStudentData, sanitizeObject } from '@/lib/validation';

/**
 * GET /api/students
 * Fetch students with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const program = searchParams.get('program');
    const angkatan = searchParams.get('angkatan');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build query
    let query = supabase.from('students').select('*');
    
    // Apply filters with sanitization
    if (program) {
      const sanitizedProgram = sanitizeObject({ program }).program;
      query = query.eq('program_studi', sanitizedProgram);
    }
    
    if (angkatan) {
      const angkatanNum = parseInt(angkatan);
      if (!isNaN(angkatanNum)) {
        query = query.eq('angkatan', angkatanNum);
      }
    }
    
    if (status) {
      const validStatuses = ['aktif', 'lulus', 'dropout', 'cuti'];
      if (validStatuses.includes(status)) {
        query = query.eq('status', status);
      }
    }
    
    if (search) {
      const sanitizedSearch = sanitizeObject({ search }).search;
      query = query.or(`name.ilike.%${sanitizedSearch}%,nim.ilike.%${sanitizedSearch}%`);
    }
    
    // Execute query
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data mahasiswa' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/students
 * Create new student
 */
export async function POST(request: NextRequest) {
  try {
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!profile || (profile as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can create students' },
        { status: 403 }
      );
    }
    
    // Parse and sanitize request body
    const body = await request.json();
    const sanitizedBody = sanitizeObject(body);
    
    // Validate data
    const validation = validateStudentData(sanitizedBody, false);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }
    
    // Insert data
    const { data, error } = await supabase
      .from('students')
      .insert({
        nim: sanitizedBody.nim,
        name: sanitizedBody.name,
        program_studi: sanitizedBody.program_studi,
        angkatan: sanitizedBody.angkatan,
        ipk: sanitizedBody.ipk || 0,
        semester_current: sanitizedBody.semester_current || 1,
        status: sanitizedBody.status || 'aktif'
      } as any)
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'NIM sudah terdaftar' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Gagal menyimpan data mahasiswa' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        data, 
        message: 'Data mahasiswa berhasil disimpan' 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
