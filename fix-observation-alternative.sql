-- ALTERNATIVE FIX FOR OBSERVATION DATA - SEMUA PROJECTS
-- Menggunakan approach yang berbeda untuk menghindari PostgreSQL UPDATE FROM issue

-- ==================================================
-- LANGKAH 1: Buat mapping table untuk update
-- ==================================================
-- Drop table jika sudah ada
DROP TABLE IF EXISTS observation_fix_mapping;

-- Create mapping table
CREATE TEMP TABLE observation_fix_mapping AS
SELECT
    s.id as submission_id,
    correct_tsc.id as correct_template_config_id
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
    AND correct_tsc.instrument_type = 'OBSERVATION'
WHERE wrong_tsc.instrument_type = 'OBSERVATION'
    AND wrong_tsc.stage_name != ps.name;

SELECT 'STEP 1 - Mapping table created' as status, COUNT(*) as records_to_fix
FROM observation_fix_mapping;

-- ==================================================
-- LANGKAH 2: Preview data yang akan di-fix
-- ==================================================
SELECT
    'STEP 2 - Preview to Fix' as step,
    s.id as submission_id,
    s.template_stage_config_id as current_config_id,
    ofm.correct_template_config_id,
    ps.name as stage_name,
    wrong_tsc.stage_name as current_template_stage,
    correct_tsc.stage_name as correct_template_stage
FROM observation_fix_mapping ofm
JOIN submissions s ON s.id = ofm.submission_id
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
JOIN template_stage_configs correct_tsc ON correct_tsc.id = ofm.correct_template_config_id
ORDER BY s.submitted_at DESC
LIMIT 10;

-- ==================================================
-- LANGKAH 3: Backup data sebelum fix
-- ==================================================
CREATE TABLE IF NOT EXISTS submissions_observation_backup_alt AS
SELECT * FROM submissions
WHERE id IN (SELECT submission_id FROM observation_fix_mapping);

SELECT 'STEP 3 - Backup created' as step, COUNT(*) as backed_up_records
FROM submissions_observation_backup_alt;

-- ==================================================
-- LANGKAH 4: Lakukan update menggunakan mapping table
-- ==================================================
UPDATE submissions
SET template_stage_config_id = ofm.correct_template_config_id
FROM observation_fix_mapping ofm
WHERE submissions.id = ofm.submission_id;

SELECT 'STEP 4 - Update completed' as step, ROW_COUNT() as records_updated;

-- ==================================================
-- LANGKAH 5: Verifikasi hasil fix
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
-- LANGKAH 6: Final check
-- ==================================================
SELECT
    'STEP 6 - Final Check' as step,
    COUNT(*) as still_wrong_count
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
    AND ps.name != tsc.stage_name;

-- Clean up temp table
DROP TABLE IF EXISTS observation_fix_mapping;

-- ==================================================
-- EMERGENCY ROLLBACK
-- ==================================================
/*
-- Jika ada masalah, rollback dengan query ini:
DELETE FROM submissions
WHERE id IN (SELECT id FROM submissions_observation_backup_alt);

INSERT INTO submissions
SELECT * FROM submissions_observation_backup_alt;

SELECT 'EMERGENCY ROLLBACK COMPLETED' as status;
*/