-- QUERY UNTUK MEMPERBAIKI DATA PEER_ASSESSMENT YANG SALAH
-- ================================================

-- Step 1: Lihat data yang akan diperbaiki
SELECT
    s.id,
    s.template_stage_config_id as current_config_id,
    s.project_stage_id,
    s.instrument_type,
    s.content,
    s.submitted_at,
    u.name as student_name,
    ps.name as stage_name,
    ps.order as stage_order,
    ts_current.stage_name as current_stage_name,
    ts_correct.stage_name as correct_stage_name
FROM submissions s
JOIN users u ON s.submitted_by_id = u.id
JOIN project_stages ps ON s.project_stage_id = ps.id
LEFT JOIN template_stage_configs ts_current ON s.template_stage_config_id = ts_current.id
LEFT JOIN template_stage_configs ts_correct ON ts_correct.id = 'b96f81dc-f8ac-42db-ab36-2dea79e6e780'
WHERE s.instrument_type = 'PEER_ASSESSMENT'
  AND s.template_stage_config_id = 'c9fad00b-f3f4-413e-a753-8d9b183c2fd6'  -- ID yang salah (Design a plan)
  AND s.project_stage_id IN (
    SELECT id FROM project_stages
    WHERE name = 'Create a schedule'
    OR order = 3  -- Asumsikan Create a schedule adalah stage ke-3
  )
ORDER BY s.submitted_at DESC;

-- Step 2: Update submissions yang salah untuk "Create a schedule" stage
UPDATE submissions
SET template_stage_config_id = 'b96f81dc-f8ac-42db-ab36-2dea79e6e780',
    updated_at = CURRENT_TIMESTAMP
WHERE template_stage_config_id = 'c9fad00b-f3f4-413e-a753-8d9b183c2fd6'  -- ID yang salah (Design a plan)
  AND project_stage_id IN (
    SELECT id FROM project_stages
    WHERE name = 'Create a schedule'
  )
  AND EXISTS (
    SELECT 1 FROM template_stage_configs ts
    WHERE ts.id = submissions.template_stage_config_id
    AND ts.instrument_type = 'PEER_ASSESSMENT'
  );

-- Step 3: Verifikasi hasil update
SELECT
    s.template_stage_config_id as config_id,
    COUNT(*) as jumlah_submissions,
    COUNT(DISTINCT s.submitted_by_id) as jumlah_siswa_unik,
    ts.stage_name
FROM submissions s
LEFT JOIN template_stage_configs ts ON s.template_stage_config_id = ts.id
WHERE ts.instrument_type = 'PEER_ASSESSMENT'
  AND s.template_stage_config_id IN (
    'c9fad00b-f3f4-413e-a753-8d9b183c2fd6',  -- Design a plan
    'b96f81dc-f8ac-42db-ab36-2dea79e6e780'   -- Create a schedule
  )
GROUP BY s.template_stage_config_id, ts.stage_name
ORDER BY s.template_stage_config_id;

-- Step 4: Query untuk melihat detail per stage setelah fix
SELECT
    ps.name as stage_name,
    ps.order as stage_order,
    s.template_stage_config_id,
    COUNT(*) as total_submissions,
    COUNT(DISTINCT s.submitted_by_id) as unique_students,
    ts.stage_name as config_stage_name
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
LEFT JOIN template_stage_configs ts ON s.template_stage_config_id = ts.id
WHERE ts.instrument_type = 'PEER_ASSESSMENT'
GROUP BY ps.name, ps.order, s.template_stage_config_id, ts.stage_name
ORDER BY ps.order, s.template_stage_config_id;

-- Jika ada data yang masih perlu disesuaikan, gunakan query berikut:
-- (Hapus komentar -- jika perlu menjalankan)

-- Untuk melihat submissions per project stage:
/*
SELECT
    p.title as project_title,
    ps.name as stage_name,
    ps.order as stage_order,
    s.template_stage_config_id,
    COUNT(*) as submissions,
    COUNT(DISTINCT s.submitted_by_id) as students
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN projects p ON s.project_id = p.id
JOIN template_stage_configs ts ON s.template_stage_config_id = ts.id
WHERE ts.instrument_type = 'PEER_ASSESSMENT'
GROUP BY p.title, ps.name, ps.order, s.template_stage_config_id
ORDER BY p.title, ps.order;
*/

-- Untuk rollback jika diperlukan (HATI-HAT!):
/*
UPDATE submissions
SET template_stage_config_id = 'c9fad00b-f3f4-413e-a753-8d9b183c2fd6',
    updated_at = CURRENT_TIMESTAMP
WHERE template_stage_config_id = 'b96f81dc-f8ac-42db-ab36-2dea79e6e780'
  AND project_stage_id IN (
    SELECT id FROM project_stages
    WHERE name = 'Create a schedule'
  )
  AND EXISTS (
    SELECT 1 FROM template_stage_configs ts
    WHERE ts.id = submissions.template_stage_config_id
    AND ts.instrument_type = 'PEER_ASSESSMENT'
  );
*/