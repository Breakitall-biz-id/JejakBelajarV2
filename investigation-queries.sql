-- =====================================================
-- INVESTIGATION QUERIES - READ ONLY
-- =====================================================
-- Copy-paste query ini ke database tool kamu untuk melihat data

-- QUERY 1: Distribution Analysis
SELECT
    ps.name as stage_name,
    s.template_stage_config_id as current_config,
    tsc.display_order as config_display_order,
    COUNT(s.id) as submissions_count,
    COUNT(DISTINCT s.target_student_id) as unique_students,
    COUNT(DISTINCT s.submitted_by_id) as unique_teachers,
    MIN(s.created_at) as earliest_submission,
    MAX(s.created_at) as latest_submission
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
LEFT JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE s.submitted_by = 'TEACHER'
  AND s.target_student_id IS NOT NULL
  AND ps.name IN ('Assess the output:presentasi di kelas', 'Design a plan for the project', 'Monitor the students and the progress of the project')
GROUP BY ps.name, s.template_stage_config_id, tsc.display_order
ORDER BY ps.name, s.template_stage_config_id;

-- QUERY 2: Student Response Pattern
SELECT
    s.target_student_id,
    u.name as student_name,
    s.template_stage_config_id,
    ps.name as stage_name,
    jsonb_array_length(s.content->'answers') as answer_count,
    s.created_at,
    s.content->'answers' as actual_answers
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN users u ON s.target_student_id = u.id
WHERE ps.name = 'Monitor the students and the progress of the project'
  AND s.submitted_by = 'TEACHER'
  AND s.target_student_id IS NOT NULL
ORDER BY s.target_student_id, s.created_at
LIMIT 10;

-- QUERY 3: Check if Different Templates Have Different Questions
SELECT
    tsc.id,
    tsc.stage_name,
    tsc.display_order,
    COUNT(tq.id) as question_count,
    STRING_AGG(SUBSTRING(tq.question_text, 1, 50), ' | ') as sample_questions
FROM template_stage_configs tsc
LEFT JOIN template_questions tq ON tsc.id = tq.config_id
WHERE tsc.instrument_type = 'OBSERVATION'
  AND tsc.stage_name IN ('Monitor the students and the progress of the project', 'Design a plan for the project', 'Assess the output:presentasi di kelas')
GROUP BY tsc.id, tsc.stage_name, tsc.display_order
ORDER BY tsc.stage_name, tsc.display_order;

-- QUERY 4: Check Answer Length Distribution
SELECT
    ps.name as stage_name,
    s.template_stage_config_id,
    jsonb_array_length(s.content->'answers') as answer_length,
    COUNT(*) as frequency,
    COUNT(DISTINCT s.target_student_id) as unique_students_with_this_length
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
WHERE s.submitted_by = 'TEACHER'
  AND s.target_student_id IS NOT NULL
  AND ps.name IN ('Monitor the students and the progress of the project', 'Design a plan for the project', 'Assess the output:presentasi di kelas')
  AND s.content->'answers' IS NOT NULL
GROUP BY ps.name, s.template_stage_config_id, jsonb_array_length(s.content->'answers')
ORDER BY ps.name, s.template_stage_config_id, answer_length;

-- QUERY 5: Check for Duplicate Student Responses
WITH student_responses AS (
    SELECT
        s.target_student_id,
        ps.name as stage_name,
        s.template_stage_config_id,
        COUNT(*) as submission_count,
        STRING_AGG(s.id::text, ', ') as submission_ids
    FROM submissions s
    JOIN project_stages ps ON s.project_stage_id = ps.id
    WHERE s.submitted_by = 'TEACHER'
      AND s.target_student_id IS NOT NULL
      AND ps.name IN ('Monitor the students and the progress of the project', 'Design a plan for the project', 'Assess the output:presentasi di kelas')
    GROUP BY s.target_student_id, ps.name, s.template_stage_config_id
)
SELECT
    target_student_id,
    stage_name,
    template_stage_config_id,
    submission_count,
    submission_ids
FROM student_responses
WHERE submission_count > 1
ORDER BY stage_name, target_student_id, template_stage_config_id;

-- QUERY 6: Template Config Details
SELECT
    tsc.id,
    tsc.stage_name,
    tsc.instrument_type,
    tsc.display_order,
    tsc.created_at,
    CASE
        WHEN COUNT(tq.id) = 0 THEN 'NO QUESTIONS'
        ELSE CONCAT(COUNT(tq.id), ' QUESTIONS')
    END as question_status
FROM template_stage_configs tsc
LEFT JOIN template_questions tq ON tsc.id = tq.config_id
WHERE tsc.instrument_type = 'OBSERVATION'
  AND tsc.stage_name IN ('Monitor the students and the progress of the project', 'Design a plan for the project', 'Assess the output:presentasi di kelas')
GROUP BY tsc.id, tsc.stage_name, tsc.instrument_type, tsc.display_order, tsc.created_at
ORDER BY tsc.stage_name, tsc.display_order;