-- STEP-BY-STEP FIX FOR OBSERVATION DATA - ALL PROJECTS
-- Jalankan satu per satu untuk memantau proses

-- ==================================================
-- STEP 1: Cek ada berapa project yang bermasalah
-- ==================================================
SELECT
    'STEP 1 - Project Analysis' as step,
    COUNT(DISTINCT p.id) as total_projects_with_issues,
    COUNT(*) as total_problematic_submissions,
    COUNT(DISTINCT s.target_student_id) as total_affected_students,
    STRING_AGG(DISTINCT p.title, '; ') as affected_projects
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN projects p ON ps.project_id = p.id
JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
    AND correct_tsc.instrument_type = 'OBSERVATION'
WHERE wrong_tsc.instrument_type = 'OBSERVATION'
    AND wrong_tsc.stage_name != ps.name;

-- ==================================================
-- STEP 2: Backup data sebelum fix
-- ==================================================
-- Jalankan ini hanya sekali untuk backup
CREATE TABLE IF NOT EXISTS submissions_observation_backup_step AS
SELECT * FROM submissions
WHERE EXISTS (
    SELECT 1 FROM template_stage_configs tsc
    WHERE tsc.id = submissions.template_stage_config_id
    AND tsc.instrument_type = 'OBSERVATION'
);

SELECT 'STEP 2 - Backup created' as step, COUNT(*) as backed_up_records
FROM submissions_observation_backup_step;

-- ==================================================
-- STEP 3: Preview data yang akan di-fix (10 records pertama)
-- ==================================================
SELECT
    'STEP 3 - Preview Data' as step,
    p.title as project_title,
    s.id as submission_id,
    s.target_student_id,
    ps.name as actual_stage_name,
    wrong_tsc.stage_name as current_template_stage,
    correct_tsc.stage_name as correct_template_stage,
    s.submitted_at
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN projects p ON ps.project_id = p.id
JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
    AND correct_tsc.instrument_type = 'OBSERVATION'
WHERE wrong_tsc.instrument_type = 'OBSERVATION'
    AND wrong_tsc.stage_name != ps.name
ORDER BY s.submitted_at DESC
LIMIT 10;

-- ==================================================
-- STEP 4: Lakukan update (MAIN FIX)
-- ==================================================
-- HATI-HATI: Jalankan ini setelah yakin dengan preview di STEP 3
-- Menggunakan subquery approach untuk menghindari PostgreSQL FROM issue
UPDATE submissions
SET template_stage_config_id = (
    SELECT correct_tsc.id
    FROM project_stages ps
    JOIN template_stage_configs wrong_tsc ON wrong_tsc.id = submissions.template_stage_config_id
    JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
        AND correct_tsc.instrument_type = 'OBSERVATION'
    WHERE wrong_tsc.instrument_type = 'OBSERVATION'
        AND ps.id = submissions.project_stage_id
        AND wrong_tsc.stage_name != ps.name
        AND wrong_tsc.id = submissions.template_stage_config_id
    LIMIT 1
)
WHERE id IN (
    SELECT s.id
    FROM submissions s
    JOIN project_stages ps ON s.project_stage_id = ps.id
    JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
    JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
        AND correct_tsc.instrument_type = 'OBSERVATION'
    WHERE wrong_tsc.instrument_type = 'OBSERVATION'
        AND wrong_tsc.stage_name != ps.name
);

SELECT 'STEP 4 - Update completed' as step, ROW_COUNT() as records_updated;

-- ==================================================
-- STEP 5: Verifikasi hasil per project
-- ==================================================
SELECT
    'STEP 5 - Verification' as step,
    p.title as project_title,
    COUNT(*) as total_observations,
    COUNT(CASE WHEN ps.name = tsc.stage_name THEN 1 END) as correctly_mapped,
    COUNT(CASE WHEN ps.name != tsc.stage_name THEN 1 END) as still_wrong,
    CASE
        WHEN COUNT(CASE WHEN ps.name != tsc.stage_name THEN 1 END) = 0 THEN 'FIXED ✓'
        ELSE 'STILL WRONG ✗'
    END as status
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN projects p ON ps.project_id = p.id
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
GROUP BY p.id, p.title
ORDER BY p.title;

-- ==================================================
-- STEP 6: Final check untuk data yang masih salah (jika ada)
-- ==================================================
SELECT
    'STEP 6 - Final Check' as step,
    COUNT(*) as still_wrong_count
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
    AND ps.name != tsc.stage_name;

-- ==================================================
-- EMERGENCY ROLLBACK (jika ada masalah)
-- ==================================================
/*
-- Jika ada masalah, rollback dengan query ini:
DELETE FROM submissions
WHERE EXISTS (
    SELECT 1 FROM template_stage_configs tsc
    WHERE tsc.id = submissions.template_stage_config_id
    AND tsc.instrument_type = 'OBSERVATION'
);

INSERT INTO submissions
SELECT * FROM submissions_observation_backup_step;

SELECT 'EMERGENCY ROLLBACK COMPLETED' as status;
*/