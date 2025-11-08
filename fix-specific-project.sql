-- FIX OBSERVATION DATA UNTUK PROJECT SPESIFIK
-- Project: a217c688-2b8a-4d14-9601-ad9aa158367d

-- ==================================================
-- DATA YANG AKAN DIPERBAIKI (Student: c6c7a5b0-66c6-42bd-8d05-f588e3e10f3a)
-- ==================================================
-- Current problematic data:
-- - f3bb6068-e563-4079-a149-112a7f67d26d (Design a plan for the project)
--   tapi muncul di stage 2, 4, 5 (seharusnya hanya di stage 2)
-- - 56ac1baf-b8f2-42d0-a72b-23d350b8bdfe (Assess the output:presentasi di kelas)
--   mungkin ada di stage lain yang salah
-- - 6e401eff-e3f7-4fc9-8414-ca3b78d6d1b1 (Monitor the students and the progress of the project)
--   mungkin ada di stage lain yang salah

-- ==================================================
-- LANGKAH 1: LIHAT DATA YANG BERMASALAH
-- ==================================================
SELECT
    'PROBLEMATIC DATA' as status,
    s.id as submission_id,
    ps.name as stage_name,
    ps.order as stage_order,
    s.template_stage_config_id,
    tsc.stage_name as template_stage_name,
    s.content,
    s.submitted_at,
    s.target_student_id
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
    AND s.target_student_id = 'c6c7a5b0-66c6-42bd-8d05-f588e3e10f3a'
    AND ps.name != tsc.stage_name
ORDER BY ps.order;

-- ==================================================
-- LANGKAH 2: TAMPILKAN TEMPLATE_CONFIG YANG BENAR
-- ==================================================
SELECT
    'CORRECT MAPPINGS' as info,
    tsc.id as template_config_id,
    tsc.stage_name,
    ps.name as project_stage_name,
    ps.order as stage_order,
    COUNT(tq.id) as question_count
FROM template_stage_configs tsc
JOIN project_stages ps ON ps.name = tsc.stage_name
    AND ps.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
LEFT JOIN template_questions tq ON tq.config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
GROUP BY tsc.id, tsc.stage_name, ps.name, ps.order
ORDER BY ps.order;

-- ==================================================
-- LANGKAH 3: UPDATE FIX BERDASARKAN STAGE ORDER
-- ==================================================
-- Update untuk stage dengan order 2 (Design a plan for the project)
UPDATE submissions s
SET template_stage_config_id = (
    SELECT tsc.id
    FROM template_stage_configs tsc
    JOIN project_stages ps ON ps.name = tsc.stage_name
    WHERE ps.project_id = s.project_id
        AND ps.order = 2
        AND tsc.instrument_type = 'OBSERVATION'
    LIMIT 1
)
FROM project_stages ps
WHERE EXISTS (
        SELECT 1 FROM template_stage_configs tsc_check
        WHERE tsc_check.id = s.template_stage_config_id
        AND tsc_check.instrument_type = 'OBSERVATION'
    )
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
    AND s.project_stage_id = ps.id
    AND ps.order = 2;

-- Update untuk stage dengan order 4 (Assess the output:presentasi di kelas)
UPDATE submissions s
SET template_stage_config_id = (
    SELECT tsc.id
    FROM template_stage_configs tsc
    JOIN project_stages ps ON ps.name = tsc.stage_name
    WHERE ps.project_id = s.project_id
        AND ps.order = 4
        AND tsc.instrument_type = 'OBSERVATION'
    LIMIT 1
)
FROM project_stages ps
WHERE EXISTS (
        SELECT 1 FROM template_stage_configs tsc_check
        WHERE tsc_check.id = s.template_stage_config_id
        AND tsc_check.instrument_type = 'OBSERVATION'
    )
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
    AND s.project_stage_id = ps.id
    AND ps.order = 4;

-- Update untuk stage dengan order 5 (Monitor the students and the progress of the project)
UPDATE submissions s
SET template_stage_config_id = (
    SELECT tsc.id
    FROM template_stage_configs tsc
    JOIN project_stages ps ON ps.name = tsc.stage_name
    WHERE ps.project_id = s.project_id
        AND ps.order = 5
        AND tsc.instrument_type = 'OBSERVATION'
    LIMIT 1
)
FROM project_stages ps
WHERE EXISTS (
        SELECT 1 FROM template_stage_configs tsc_check
        WHERE tsc_check.id = s.template_stage_config_id
        AND tsc_check.instrument_type = 'OBSERVATION'
    )
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
    AND s.project_stage_id = ps.id
    AND ps.order = 5;

-- ==================================================
-- LANGKAH 4: VERIFIKASI HASIL FIX
-- ==================================================
SELECT
    'FIXED DATA' as status,
    s.id as submission_id,
    ps.name as stage_name,
    ps.order as stage_order,
    s.template_stage_config_id,
    tsc.stage_name as template_stage_name,
    s.content,
    s.submitted_at,
    CASE
        WHEN ps.name = tsc.stage_name THEN 'FIXED ✓'
        ELSE 'STILL WRONG ✗'
    END as fix_result
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
    AND s.target_student_id = 'c6c7a5b0-66c6-42bd-8d05-f588e3e10f3a'
ORDER BY ps.order;

-- ==================================================
-- LANGKAH 5: CEK UNTUK SEMUA STUDENT DI PROJECT
-- ==================================================
SELECT
    'ALL STUDENTS - FINAL VERIFICATION' as status,
    COUNT(*) as total_submissions,
    COUNT(CASE WHEN ps.name = tsc.stage_name THEN 1 END) as fixed_submissions,
    COUNT(CASE WHEN ps.name != tsc.stage_name THEN 1 END) as still_wrong,
    project_id
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
GROUP BY s.project_id;