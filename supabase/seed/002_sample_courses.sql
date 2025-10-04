-- Sample courses data for testing and development

INSERT INTO courses (id, code, name, credits, semester, program_studi, lecturer_id) VALUES
-- Teknik Informatika courses
('650e8400-e29b-41d4-a716-446655440001', 'TI101', 'Algoritma dan Pemrograman', 3, 1, 'Teknik Informatika', '550e8400-e29b-41d4-a716-446655440003'),
('650e8400-e29b-41d4-a716-446655440002', 'TI102', 'Matematika Diskrit', 3, 1, 'Teknik Informatika', '550e8400-e29b-41d4-a716-446655440007'),
('650e8400-e29b-41d4-a716-446655440003', 'TI201', 'Struktur Data', 3, 2, 'Teknik Informatika', '550e8400-e29b-41d4-a716-446655440003'),
('650e8400-e29b-41d4-a716-446655440004', 'TI202', 'Basis Data', 3, 2, 'Teknik Informatika', '550e8400-e29b-41d4-a716-446655440007'),
('650e8400-e29b-41d4-a716-446655440005', 'TI301', 'Rekayasa Perangkat Lunak', 3, 3, 'Teknik Informatika', '550e8400-e29b-41d4-a716-446655440003'),
('650e8400-e29b-41d4-a716-446655440006', 'TI302', 'Jaringan Komputer', 3, 3, 'Teknik Informatika', '550e8400-e29b-41d4-a716-446655440007'),

-- Sistem Informasi courses
('650e8400-e29b-41d4-a716-446655440007', 'SI101', 'Pengantar Sistem Informasi', 3, 1, 'Sistem Informasi', '550e8400-e29b-41d4-a716-446655440004'),
('650e8400-e29b-41d4-a716-446655440008', 'SI102', 'Analisis dan Perancangan Sistem', 3, 1, 'Sistem Informasi', '550e8400-e29b-41d4-a716-446655440008'),
('650e8400-e29b-41d4-a716-446655440009', 'SI201', 'Manajemen Basis Data', 3, 2, 'Sistem Informasi', '550e8400-e29b-41d4-a716-446655440004'),
('650e8400-e29b-41d4-a716-446655440010', 'SI202', 'Sistem Informasi Manajemen', 3, 2, 'Sistem Informasi', '550e8400-e29b-41d4-a716-446655440008'),

-- Teknik Komputer courses
('650e8400-e29b-41d4-a716-446655440011', 'TK101', 'Rangkaian Digital', 3, 1, 'Teknik Komputer', '550e8400-e29b-41d4-a716-446655440005'),
('650e8400-e29b-41d4-a716-446655440012', 'TK102', 'Arsitektur Komputer', 3, 1, 'Teknik Komputer', '550e8400-e29b-41d4-a716-446655440005'),
('650e8400-e29b-41d4-a716-446655440013', 'TK201', 'Mikroprosesor', 3, 2, 'Teknik Komputer', '550e8400-e29b-41d4-a716-446655440005'),

-- Manajemen Informatika courses
('650e8400-e29b-41d4-a716-446655440014', 'MI101', 'Pengantar Manajemen', 3, 1, 'Manajemen Informatika', '550e8400-e29b-41d4-a716-446655440006'),
('650e8400-e29b-41d4-a716-446655440015', 'MI102', 'Sistem Informasi Bisnis', 3, 1, 'Manajemen Informatika', '550e8400-e29b-41d4-a716-446655440006'),
('650e8400-e29b-41d4-a716-446655440016', 'MI201', 'E-Business', 3, 2, 'Manajemen Informatika', '550e8400-e29b-41d4-a716-446655440006');