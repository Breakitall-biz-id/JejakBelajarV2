-- COMPREHENSIVE FIX FOR OBSERVATION DATA - ALL PROJECTS
-- Issue: template_stage_config_id tidak sesuai dengan stage_name untuk SEMUA project

-- ==================================================
-- LANGKAH 1: BACKUP DATA (PENTING!)
-- ==================================================
CREATE TABLE submissions_observation_backup_all AS
SELECT * FROM submissions
WHERE EXISTS (
    SELECT 1 FROM template_stage_configs tsc
    WHERE tsc.id = submissions.template_stage_config_id
    AND tsc.instrument_type = 'OBSERVATION'
);

-- ==================================================
-- LANGKAH 2: ANALISIS SEMUA DATA YANG BERMASALAH
-- ==================================================
SELECT
    'ALL PROBLEMATIC DATA' as status,
    p.title as project_title,
    p.id as project_id,
    s.id as submission_id,
    s.target_student_id,
    s.submitted_by_id,
    ps.name as actual_stage_name,
    ps.order as stage_order,
    s.template_stage_config_id as current_config_id,
    wrong_tsc.stage_name as current_template_stage,
    correct_tsc.id as correct_config_id,
    correct_tsc.stage_name as correct_template_stage,
    s.content,
    s.submitted_at,
    CASE
        WHEN wrong_tsc.stage_name != ps.name THEN 'STAGE MISMATCH'
        ELSE 'OK'
    END as issue
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN projects p ON ps.project_id = p.id
JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
    AND correct_tsc.instrument_type = 'OBSERVATION'
WHERE wrong_tsc.instrument_type = 'OBSERVATION'
    AND wrong_tsc.stage_name != ps.name
ORDER BY p.title, s.target_student_id, ps.order;

-- ==================================================
-- LANGKAH 3: SUMMARY MASALAH PER PROJECT
-- ==================================================
SELECT
    'SUMMARY PER PROJECT' as status,
    p.title as project_title,
    p.id as project_id,
    COUNT(*) as total_problematic_submissions,
    COUNT(DISTINCT s.target_student_id) as affected_students,
    COUNT(DISTINCT ps.name) as affected_stages,
    STRING_AGG(DISTINCT ps.name, ', ') as problematic_stages
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN projects p ON ps.project_id = p.id
JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
    AND correct_tsc.instrument_type = 'OBSERVATION'
WHERE wrong_tsc.instrument_type = 'OBSERVATION'
    AND wrong_tsc.stage_name != ps.name
GROUP BY p.id, p.title
ORDER BY p.title;

-- ==================================================
-- LANGKAH 4: UPDATE TEMPLATE_STAGE_CONFIG_ID YANG SALAH (SEMUA PROJECT)
-- ==================================================
-- Update semua submission observasi yang salah mappingnya untuk semua project
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

-- ==================================================
-- LANGKAH 5: VERIFIKASI HASIL FIX (PER PROJECT)
-- ==================================================
SELECT
    'VERIFICATION PER PROJECT' as status,
    p.title as project_title,
    p.id as project_id,
    COUNT(*) as total_observations,
    COUNT(CASE WHEN ps.name = tsc.stage_name THEN 1 END) as correctly_mapped,
    COUNT(CASE WHEN ps.name != tsc.stage_name THEN 1 END) as still_wrong,
    CASE
        WHEN COUNT(CASE WHEN ps.name = tsc.stage_name THEN 1 END) = COUNT(*) THEN 'ALL FIXED ✓'
        WHEN COUNT(CASE WHEN ps.name != tsc.stage_name THEN 1 END) > 0 THEN 'STILL WRONG ✗'
        ELSE 'PARTIALLY FIXED ⚠️'
    END as fix_status
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN projects p ON ps.project_id = p.id
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
GROUP BY p.id, p.title
ORDER BY p.title;

-- ==================================================
-- LANGKAH 6: DETAIL VERIFIKASI MASIH SALAH (jika ada)
-- ==================================================
SELECT
    'STILL WRONG DETAIL' as status,
    p.title as project_title,
    p.id as project_id,
    s.id as submission_id,
    s.target_student_id,
    ps.name as actual_stage_name,
    ps.order as stage_order,
    s.template_stage_config_id as current_config_id,
    tsc.stage_name as template_stage_name,
    s.content,
    s.submitted_at
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN projects p ON ps.project_id = p.id
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
    AND ps.name != tsc.stage_name
ORDER BY p.title, s.target_student_id, ps.order;

-- ==================================================
-- LANGKAH 7: FINAL SUMMARY SEMUA PROJECT
-- ==================================================
SELECT
    'FINAL SUMMARY - ALL PROJECTS' as status,
    COUNT(*) as total_observations_all_projects,
    COUNT(CASE WHEN ps.name = tsc.stage_name THEN 1 END) as total_correctly_mapped,
    COUNT(CASE WHEN ps.name != tsc.stage_name THEN 1 END) as total_still_wrong,
    COUNT(DISTINCT s.project_id) as total_projects_affected,
    COUNT(DISTINCT s.target_student_id) as total_students_affected,
    CASE
        WHEN COUNT(CASE WHEN ps.name = tsc.stage_name THEN 1 END) = COUNT(*) THEN 'ALL PROJECTS FIXED ✓'
        WHEN COUNT(CASE WHEN ps.name != tsc.stage_name THEN 1 END) > 0 THEN 'SOME STILL WRONG ✗'
        ELSE 'PARTIALLY FIXED ⚠️'
    END as overall_fix_status
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION';

-- ==================================================
-- LANGKAH 8: ROLLBACK (jika ada masalah)
-- ==================================================
/*
-- Jika perlu rollback SEMUA data ke kondisi awal:
DELETE FROM submissions
WHERE EXISTS (
    SELECT 1 FROM template_stage_configs tsc
    WHERE tsc.id = submissions.template_stage_config_id
    AND tsc.instrument_type = 'OBSERVATION'
);

INSERT INTO submissions
SELECT * FROM submissions_observation_backup_all;
*/