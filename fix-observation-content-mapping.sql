-- Query untuk memperbaiki content observasi yang mungkin memiliki format yang berbeda
-- antara stage yang lama dan stage yang baru

-- Pertama, analisis struktur content yang ada
SELECT
    s.id,
    ps.name as stage_name,
    ps.order as stage_order,
    json_typeof(s.content) as content_type,
    json_array_length(s.content::json) as answer_count,
    s.content,
    -- Pertanyaan yang seharusnya ada di stage ini
    (
        SELECT COUNT(*)
        FROM template_questions tq
        JOIN template_stage_configs tsc ON tq.config_id = tsc.id
        WHERE tsc.stage_name = ps.name AND tsc.instrument_type = 'OBSERVATION'
    ) as expected_question_count
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
WHERE s.instrument_type = 'OBSERVATION'
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
ORDER BY ps.order, s.submitted_at;

-- Query untuk menemukan mapping yang benar antara content dan questions
WITH correct_questions AS (
    SELECT
        tsc.stage_name,
        tq.id as question_id,
        tq.question_text,
        ROW_NUMBER() OVER (PARTITION BY tsc.stage_name ORDER BY tq.id) as question_index
    FROM template_questions tq
    JOIN template_stage_configs tsc ON tq.config_id = tsc.id
    WHERE tsc.instrument_type = 'OBSERVATION'
        AND tsc.stage_name IN (
            SELECT DISTINCT ps.name
            FROM project_stages ps
            WHERE ps.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
        )
)
SELECT
    s.id as submission_id,
    ps.name as stage_name,
    ps.order as stage_order,
    s.content as original_content,
    cq.question_index,
    cq.question_id,
    cq.question_text,
    -- Extract answer at this index
    (s.content::json ->> (cq.question_index - 1))::int as answer_at_index
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN correct_questions cq ON cq.stage_name = ps.name
WHERE s.instrument_type = 'OBSERVATION'
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d'
    AND json_array_length(s.content::json) >= cq.question_index
ORDER BY ps.order, s.submitted_at, cq.question_index;