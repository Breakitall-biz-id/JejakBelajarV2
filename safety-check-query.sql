-- Query untuk safety test sebelum running quick fix

-- Step 1: Cek apakah ada stage dengan multiple OBSERVATION templates
SELECT
    ps.name as stage_name,
    COUNT(tsc.id) as observation_template_count,
    STRING_AGG(tsc.id::text, ', ') as template_ids,
    STRING_AGG(tsc.display_order::text, ', ') as display_orders
FROM project_stages ps
JOIN template_stage_configs tsc ON ps.name = tsc.stage_name
WHERE tsc.instrument_type = 'OBSERVATION'
GROUP BY ps.name
HAVING COUNT(tsc.id) > 1;

-- Step 2: Cek apakah submission answers length bervariasi (indikasi multiple templates)
SELECT
    ps.name as stage_name,
    s.template_stage_config_id,
    jsonb_array_length(s.content->'answers') as answers_length,
    COUNT(*) as submission_count
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
WHERE s.submitted_by = 'TEACHER'
  AND s.target_student_id IS NOT NULL
  AND s.content->'answers' IS NOT NULL
GROUP BY ps.name, s.template_stage_config_id, jsonb_array_length(s.content->'answers')
ORDER BY ps.name, answers_length;

-- Step 3: Sample check untuk 1 stage (lihat actual questions vs answers)
SELECT
    ps.name as stage_name,
    s.template_stage_config_id as current_config,
    tsc_q.question_text,
    jsonb_array_length(s.content->'answers') as answer_count,
    COUNT(tq.id) as question_count_in_template
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
LEFT JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
LEFT JOIN template_questions tq ON tsc.id = tq.config_id
LEFT JOIN template_questions tsc_q ON tsc.id = tsc_q.config_id
WHERE s.submitted_by = 'TEACHER'
  AND s.target_student_id IS NOT NULL
  AND ps.name = 'Create a schedule'  -- Ganti dengan stage name yang mau dicek
GROUP BY ps.name, s.template_stage_config_id, tsc_q.question_text, jsonb_array_length(s.content->'answers'), COUNT(tq.id)
LIMIT 10;