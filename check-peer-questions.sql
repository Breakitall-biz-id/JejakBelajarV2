-- Cek berapa banyak peer assessment questions untuk "Create a schedule" stage
SELECT
    tsc.id as config_id,
    tsc.stage_name,
    tsc.instrument_type,
    COUNT(tq.id) as question_count,
    ARRAY_AGG(tq.question_text) as questions
FROM template_stage_configs tsc
LEFT JOIN template_questions tq ON tsc.id = tq.configId
WHERE tsc.id = 'b96f81dc-f8ac-42db-ab36-2dea79e6e780'  -- Create a schedule
GROUP BY tsc.id, tsc.stage_name, tsc.instrument_type;

-- Cek submissions "Create a schedule" dan format content
SELECT
    s.id,
    s.content,
    jsonb_typeof(s.content) as content_type,
    CASE
        WHEN jsonb_typeof(s.content) = 'object' THEN s.content::jsonb ->> 'answers'
    END as answers_field,
    CASE
        WHEN jsonb_typeof(s.content) = 'object' THEN jsonb_array_length(s.content::jsonb -> 'answers')
    END as answer_count
FROM submissions s
WHERE s.template_stage_config_id = 'b96f81dc-f8ac-42db-ab36-2dea79e6e780'
LIMIT 10;

-- Bandingkan dengan "Design a plan" stage
SELECT
    tsc.id as config_id,
    tsc.stage_name,
    COUNT(tq.id) as question_count,
    ARRAY_AGG(tq.question_text) as questions
FROM template_stage_configs tsc
LEFT JOIN template_questions tq ON tsc.id = tq.configId
WHERE tsc.id = 'c9fad00b-f3f4-413e-a753-8d9b183c2fd6'  -- Design a plan
GROUP BY tsc.id, tsc.stage_name;