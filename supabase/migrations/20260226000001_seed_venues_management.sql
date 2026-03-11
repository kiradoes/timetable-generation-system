-- =============================================
-- Venue Management: Add Bucadel, NH, and CIT venues
-- So we can start scheduling.
-- =============================================

INSERT INTO venues (name, building, capacity, type, status) VALUES
('Bucodel Lab 1', 'Bucadel', 200, 'Laboratory', 'available'),
('Bucodel Lab 2', 'Bucadel', 200, 'Laboratory', 'available'),
('Bucodel Lab 3', 'Bucadel', 200, 'Laboratory', 'available'),
('Bucodel Room 1', 'Bucadel', 200, 'Lecture room', 'available'),
('Bucodel Room 2', 'Bucadel', 250, 'Lecture room', 'available'),
('Bucodel Room 3', 'Bucadel', 200, 'Lecture room', 'available'),
('NH Lecture room 1', 'New Horizon', 100, 'Lecture room', 'available'),
('NH Lecture Room 2', 'New Horizon', 100, 'Lecture room', 'available'),
('CIT', 'CIT', 500, 'Lecture room', 'available')
ON CONFLICT (name) DO NOTHING;
