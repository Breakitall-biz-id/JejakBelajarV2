-- FINAL FIX FOR OBSERVATION DATA (Corrected Version)
-- Project: a217c688-2b8a-4d14-9601-ad9aa158367d
-- Issue: template_stage_config_id tidak sesuai dengan stage_name

-- ==================================================
-- LANGKAH 1: BACKUP DATA (PENTING!)
-- ==================================================
CREATE TABLE submissions_observation_backup AS
SELECT * FROM submissions
WHERE EXISTS (
    SELECT 1 FROM template_stage_configs tsc
    WHERE tsc.id = submissions.template_stage_config_id
    AND tsc.instrument_type = 'OBSERVATION'
)
AND project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d';

-- ==================================================
-- LANGKAH 2: LIHAT DATA YANG AKAN DIPERBAIKI
-- ==================================================
SELECT
    'PROBLEMATIC DATA' as status,
    s.id as submission_id,
    s.target_student_id,
    ps.name as actual_stage_name,
    ps.order as stage_order,
    s.template_stage_config_id as current_config_id,
    wrong_tsc.stage_name as current_template_stage,
    correct_tsc.id as correct_config_id,
    correct_tsc.stage_name as correct_template_stage,
    s.content,
    CASE
        WHEN wrong_tsc.stage_name != ps.name THEN 'STAGE MISMATCH'
        ELSE 'OK'
    END as issue
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
    AND correct_tsc.instrument_type = 'OBSERVATION'
WHERE wrong_tsc.instrument_type = 'OBSERVATION'
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
    AND wrong_tsc.stage_name != ps.name
ORDER BY s.target_student_id, ps.order;

-- ==================================================
-- LANGKAH 3: UPDATE TEMPLATE_STAGE_CONFIG_ID YANG SALAH
-- ==================================================
-- Update semua submission observasi yang salah mappingnya
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
        AND submissions.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
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
        AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
        AND wrong_tsc.stage_name != ps.name
);

-- ==================================================
-- LANGKAH 4: VERIFIKASI HASIL FIX
-- ==================================================
SELECT
    'FIXED DATA' as status,
    s.id as submission_id,
    s.target_student_id,
    ps.name as stage_name,
    ps.order as stage_order,
    s.template_stage_config_id as fixed_config_id,
    tsc.stage_name as template_stage_name,
    s.content,
    CASE
        WHEN ps.name = tsc.stage_name THEN 'FIXED ✓'
        ELSE 'STILL WRONG ✗'
    END as fix_result
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
ORDER BY s.target_student_id, ps.order;

-- ==================================================
-- LANGKAH 5: SUMMARY VERIFICATION
-- ==================================================
SELECT
    'FINAL SUMMARY' as status,
    COUNT(*) as total_observations,
    COUNT(CASE WHEN ps.name = tsc.stage_name THEN 1 END) as correctly_mapped,
    COUNT(CASE WHEN ps.name != tsc.stage_name THEN 1 END) as still_wrong,
    project_id
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
GROUP BY s.project_id;

-- ==================================================
-- LANGKAH 6: ROLLBACK (jika ada masalah)
-- ==================================================
/*
-- Jika perlu rollback data ke kondisi awal:
DELETE FROM submissions
WHERE EXISTS (
    SELECT 1 FROM template_stage_configs tsc
    WHERE tsc.id = submissions.template_stage_config_id
    AND tsc.instrument_type = 'OBSERVATION'
)
AND project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d';

INSERT INTO submissions
SELECT * FROM submissions_observation_backup;
*/