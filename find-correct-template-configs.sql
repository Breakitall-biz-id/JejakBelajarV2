-- Query untuk menemukan template_stage_config_id yang benar untuk setiap stage
-- berdasarkan pertanyaan observasi yang seharusnya ada

WITH observation_questions AS (
    SELECT
        tq.id as question_id,
        tq.question_text,
        tsc.id as correct_template_config_id,
        tsc.stage_name,
        tsc.instrument_type
    FROM template_questions tq
    JOIN template_stage_configs tsc ON tq.config_id = tsc.id
    WHERE tsc.instrument_type = 'OBSERVATION'
),
problematic_submissions AS (
    SELECT
        s.id as submission_id,
        s.project_stage_id,
        s.template_stage_config_id as current_template_config_id,
        s.content,
        s.submitted_at,
        s.target_student_id,
        ps.name as actual_stage_name,
        ps.order as actual_stage_order
    FROM submissions s
    JOIN project_stages ps ON s.project_stage_id = ps.id
    LEFT JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
    WHERE s.instrument_type = 'OBSERVATION'
        AND tsc.stage_name != ps.name
)
SELECT
    ps.submission_id,
    ps.project_stage_id,
    ps.actual_stage_name,
    ps.actual_stage_order,
    ps.current_template_config_id,
    oq.correct_template_config_id,
    oq.stage_name as correct_template_stage_name,
    -- Cek apakah sudah ada submission yang benar untuk stage ini
    EXISTS(
        SELECT 1
        FROM submissions s2
        WHERE s2.project_stage_id = ps.project_stage_id
            AND s2.template_stage_config_id = oq.correct_template_config_id
            AND s2.instrument_type = 'OBSERVATION'
    ) as has_correct_submission,
    -- Content analysis untuk menentukan question index
    json_array_length(ps.content::json) as answer_count
FROM problematic_submissions ps
JOIN observation_questions oq ON oq.stage_name = ps.actual_stage_name
ORDER BY ps.target_student_id, ps.actual_stage_order;