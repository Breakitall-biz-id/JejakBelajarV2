-- COMPREHENSIVE FIX FOR OBSERVATION DATA
--
-- PROBLEM: Observasi tersimpan dengan template_stage_config_id yang tidak sesuai dengan stage
-- SOLUTION: Update semua submission observasi dengan template_stage_config_id yang benar
-- berdasarkan project_stage_id yang terkait

-- ==================================================
-- LANGKAH 1: BACKUP DATA (IMPORTANT!)
-- ==================================================
-- Buat backup table sebelum melakukan perubahan
CREATE TABLE submissions_observation_backup AS
SELECT * FROM submissions
WHERE instrument_type = 'OBSERVATION'
    AND project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d';

-- ==================================================
-- LANGKAH 2: ANALISIS DATA YANG AKAN DIPERBAIKI
-- ==================================================
SELECT
    'BEFORE FIX - Problematic Submissions' as status,
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
UPDATE submissions s
SET template_stage_config_id = correct_tsc.id
FROM project_stages ps
JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
    AND correct_tsc.instrument_type = 'OBSERVATION'
WHERE wrong_tsc.instrument_type = 'OBSERVATION'
    AND s.project_stage_id = ps.id
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
    AND wrong_tsc.stage_name != ps.name;

-- ==================================================
-- LANGKAH 4: VERIFIKASI HASIL FIX
-- ==================================================
SELECT
    'AFTER FIX - Verification' as status,
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
-- LANGKAH 5: ANALISIS CONTENT MAPPING (jika perlu)
-- ==================================================
-- Cek apakah content answers sudah sesuai dengan jumlah pertanyaan di stage yang benar
WITH stage_question_counts AS (
    SELECT
        tsc.stage_name,
        COUNT(tq.id) as expected_question_count
    FROM template_stage_configs tsc
    LEFT JOIN template_questions tq ON tq.config_id = tsc.id
    WHERE tsc.instrument_type = 'OBSERVATION'
        AND tsc.stage_name IN (
            SELECT DISTINCT ps.name
            FROM project_stages ps
            WHERE ps.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
        )
    GROUP BY tsc.stage_name
),
submission_analysis AS (
    SELECT
        s.id,
        ps.name as stage_name,
        json_array_length(s.content::json) as actual_answer_count,
        qc.expected_question_count,
        s.content
    FROM submissions s
    JOIN project_stages ps ON s.project_stage_id = ps.id
    JOIN stage_question_counts qc ON qc.stage_name = ps.name
    WHERE EXISTS (
        SELECT 1 FROM template_stage_configs tsc
        WHERE tsc.id = s.template_stage_config_id
        AND tsc.instrument_type = 'OBSERVATION'
    )
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
)
SELECT
    'CONTENT ANALYSIS' as analysis_type,
    id,
    stage_name,
    actual_answer_count,
    expected_question_count,
    CASE
        WHEN actual_answer_count = expected_question_count THEN 'CONTENT OK ✓'
        WHEN actual_answer_count > expected_question_count THEN 'EXTRA ANSWERS ⚠️'
        ELSE 'MISSING ANSWERS ⚠️'
    END as content_status,
    content
FROM submission_analysis
ORDER BY stage_name, actual_answer_count DESC;

-- ==================================================
-- LANGKAH 6: QUERY ROLLBACK (jika diperlukan)
-- ==================================================
/*
-- Jika ada masalah, gunakan query ini untuk rollback:
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