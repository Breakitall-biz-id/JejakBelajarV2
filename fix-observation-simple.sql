-- SIMPLE FIX FOR OBSERVATION DATA - ALL PROJECTS
-- Approach yang paling sederhana dan pasti work di PostgreSQL

-- ==================================================
-- LANGKAH 1: Backup data dulu
-- ==================================================
CREATE TABLE IF NOT EXISTS submissions_observation_backup_simple AS
SELECT s.*
FROM submissions s
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION';

SELECT 'STEP 1 - Backup created' as step, COUNT(*) as backed_up_records
FROM submissions_observation_backup_simple;

-- ==================================================
-- LANGKAH 2: Lihat data yang akan diperbaiki (preview)
-- ==================================================
SELECT
    'STEP 2 - Data to Fix' as step,
    s.id as submission_id,
    s.template_stage_config_id as current_config,
    ps.name as actual_stage_name,
    wrong_tsc.stage_name as wrong_template_stage,
    correct_tsc.stage_name as correct_template_stage,
    correct_tsc.id as correct_config_id,
    s.project_id
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
    AND correct_tsc.instrument_type = 'OBSERVATION'
WHERE wrong_tsc.instrument_type = 'OBSERVATION'
    AND wrong_tsc.stage_name != ps.name
ORDER BY s.project_id, s.submitted_at DESC
LIMIT 20;

-- ==================================================
-- LANGKAH 3: Update menggunakan approach yang paling simple
-- ==================================================
-- Create temporary table dengan mapping yang benar
CREATE TEMP TABLE temp_observation_fix AS
SELECT DISTINCT
    s.id as submission_id,
    correct_tsc.id as correct_config_id
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
    AND correct_tsc.instrument_type = 'OBSERVATION'
WHERE wrong_tsc.instrument_type = 'OBSERVATION'
    AND wrong_tsc.stage_name != ps.name;

SELECT 'STEP 3 - Temp table created' as step, COUNT(*) as records_to_fix
FROM temp_observation_fix;

-- ==================================================
-- LANGKAH 4: Lakukan update dari temp table
-- ==================================================
UPDATE submissions
SET template_stage_config_id = tf.correct_config_id
FROM temp_observation_fix tf
WHERE submissions.id = tf.submission_id;

SELECT 'STEP 4 - Update completed' as step, ROW_COUNT() as records_updated;

-- ==================================================
-- LANGKAH 5: Verifikasi hasil
-- ==================================================
SELECT
    'STEP 5 - Verification Results' as step,
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
-- LANGKAH 6: Clean up
-- ==================================================
DROP TABLE IF EXISTS temp_observation_fix;

SELECT 'STEP 6 - Cleanup completed' as step, 'All done!' as message;

-- ==================================================
-- EMERGENCY ROLLBACK
-- ==================================================
/*
-- Jika ada masalah, rollback dengan:
DELETE FROM submissions
WHERE id IN (SELECT id FROM submissions_observation_backup_simple);

INSERT INTO submissions
SELECT * FROM submissions_observation_backup_simple;

SELECT 'EMERGENCY ROLLBACK COMPLETED' as status;
*/