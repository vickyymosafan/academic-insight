-- Sample user profiles for testing and development
-- Note: In production, these would be created through Supabase Auth registration

-- Insert sample admin profile
INSERT INTO profiles (id, full_name, avatar_url, department, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Dr. Ahmad Wijaya', NULL, 'Fakultas Teknik Informatika', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', 'Prof. Siti Nurhaliza', NULL, 'Fakultas Teknik Informatika', 'admin');

-- Insert sample lecturer profiles
INSERT INTO profiles (id, full_name, avatar_url, department, role) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'Dr. Budi Santoso', NULL, 'Jurusan Teknik Informatika', 'dosen'),
('550e8400-e29b-41d4-a716-446655440004', 'Dr. Rina Kartika', NULL, 'Jurusan Sistem Informasi', 'dosen'),
('550e8400-e29b-41d4-a716-446655440005', 'Prof. Joko Widodo', NULL, 'Jurusan Teknik Komputer', 'dosen'),
('550e8400-e29b-41d4-a716-446655440006', 'Dr. Maya Sari', NULL, 'Jurusan Manajemen Informatika', 'dosen'),
('550e8400-e29b-41d4-a716-446655440007', 'Dr. Andi Pratama', NULL, 'Jurusan Teknik Informatika', 'dosen'),
('550e8400-e29b-41d4-a716-446655440008', 'Dr. Lisa Permata', NULL, 'Jurusan Sistem Informasi', 'dosen');