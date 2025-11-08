-- CHECK TEMPLATE COVERAGE FOR ALL STAGES
-- Pastikan setiap stage memiliki observation template yang sesuai

-- ==================================================
-- Cek stages yang tidak punya observation template
-- ==================================================
SELECT
    'MISSING TEMPLATES' as issue_type,
    p.title as project_title,
    ps.id as stage_id,
    ps.name as stage_name,
    ps.order as stage_order,
    'No observation template found' as description
FROM project_stages ps
JOIN projects p ON ps.project_id = p.id
LEFT JOIN template_stage_configs tsc ON tsc.stage_name = ps.name
    AND tsc.instrument_type = 'OBSERVATION'
WHERE tsc.id IS NULL
ORDER BY p.title, ps.order;

-- ==================================================
-- Cek template yang tidak punya stages
-- ==================================================
SELECT
    'ORPHAN TEMPLATES' as issue_type,
    tsc.id as template_id,
    tsc.stage_name,
    COUNT(tq.id) as question_count,
    'Template has no matching project stage' as description
FROM template_stage_configs tsc
LEFT JOIN project_stages ps ON ps.name = tsc.stage_name
LEFT JOIN template_questions tq ON tq.config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
    AND ps.id IS NULL
GROUP BY tsc.id, tsc.stage_name
ORDER BY tsc.stage_name;

-- ==================================================
-- Cek coverage ratio
-- ==================================================
SELECT
    'COVERAGE ANALYSIS' as analysis_type,
    COUNT(DISTINCT ps.id) as total_stages_with_observation,
    COUNT(DISTINCT tsc.id) as total_observation_templates,
    COUNT(DISTINCT ps.id) - COUNT(DISTINCT tsc.id) as missing_templates,
    CASE
        WHEN COUNT(DISTINCT ps.id) = COUNT(DISTINCT tsc.id) THEN 'PERFECT COVERAGE ✓'
        WHEN COUNT(DISTINCT tsc.id) > COUNT(DISTINCT ps.id) THEN 'EXTRA TEMPLATES ⚠️'
        ELSE 'MISSING TEMPLATES ⚠️'
    END as coverage_status
FROM project_stages ps
FULL OUTER JOIN template_stage_configs tsc ON tsc.stage_name = ps.name
    AND tsc.instrument_type = 'OBSERVATION'
WHERE EXISTS (
    SELECT 1 FROM projects p WHERE p.id = ps.project_id
    OR EXISTS (SELECT 1 FROM projects p2 JOIN project_stages ps2 ON ps2.project_id = p2.id WHERE ps2.name = tsc.stage_name)
);

-- ==================================================
-- Cek template dengan questions
-- ==================================================
SELECT
    'TEMPLATE QUESTIONS' as analysis_type,
    tsc.stage_name,
    COUNT(tq.id) as question_count,
    STRING_AGG(tq.question_text, '; ') as sample_questions
FROM template_stage_configs tsc
LEFT JOIN template_questions tq ON tq.config_id = tsc.id
WHERE tsc.instrument_type = 'OBSERVATION'
GROUP BY tsc.id, tsc.stage_name
ORDER BY tsc.stage_name;