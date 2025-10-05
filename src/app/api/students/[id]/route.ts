import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { validateStudentData, sanitizeObject } from '@/lib/validation';
import type { Database } from '@/types/database';

/**
 * GET /api/students/[id]
 * Fetch single student by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                { error: 'Invalid student ID format' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Mahasiswa tidak ditemukan' },
                    { status: 404 }
                );
            }

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
 * PUT /api/students/[id]
 * Update student data
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
                { error: 'Forbidden: Only admins can update students' },
                { status: 403 }
            );
        }

        const { id } = params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                { error: 'Invalid student ID format' },
                { status: 400 }
            );
        }

        // Parse and sanitize request body
        const body = await request.json();
        const sanitizedBody = sanitizeObject(body);

        // Validate data (partial validation for update)
        const validation = validateStudentData(sanitizedBody, true);
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validation.errors
                },
                { status: 400 }
            );
        }

        // Build update object (only include provided fields)
        type StudentUpdate = Database['public']['Tables']['students']['Update'];
        const updateData: StudentUpdate = {};

        if (sanitizedBody.name !== undefined) updateData.name = sanitizedBody.name;
        if (sanitizedBody.program_studi !== undefined) updateData.program_studi = sanitizedBody.program_studi;
        if (sanitizedBody.angkatan !== undefined) updateData.angkatan = sanitizedBody.angkatan;
        if (sanitizedBody.ipk !== undefined) updateData.ipk = sanitizedBody.ipk;
        if (sanitizedBody.semester_current !== undefined) updateData.semester_current = sanitizedBody.semester_current;
        if (sanitizedBody.status !== undefined) updateData.status = sanitizedBody.status as 'aktif' | 'lulus' | 'dropout' | 'cuti';

        // Update data (updated_at will be handled by database trigger)
        // Type assertion needed due to Supabase TypeScript limitations with dynamic updates
        const { data, error } = await supabase
            .from('students')
            .update(updateData as never)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Mahasiswa tidak ditemukan' },
                    { status: 404 }
                );
            }

            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Gagal memperbarui data mahasiswa' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                data,
                message: 'Data mahasiswa berhasil diperbarui'
            }
        );

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/students/[id]
 * Delete student
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
                { error: 'Forbidden: Only admins can delete students' },
                { status: 403 }
            );
        }

        const { id } = params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                { error: 'Invalid student ID format' },
                { status: 400 }
            );
        }

        // Delete data
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Gagal menghapus data mahasiswa' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Data mahasiswa berhasil dihapus' }
        );

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
