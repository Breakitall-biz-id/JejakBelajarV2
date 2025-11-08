-- Query untuk analisis data observasi yang bermasalah
-- Melihat semua submission observasi yang tersimpan dengan template_stage_config_id yang sama tapi beda stage

SELECT
    s.id as submission_id,
    s.project_stage_id,
    s.template_stage_config_id,
    s.content,
    s.submitted_at,
    u.name as teacher_name,
    s.target_student_id,
    ts.student_name,
    ps.name as actual_stage_name,
    ps.order as actual_stage_order,
    tsc.stage_name as template_stage_name,
    -- Deteksi masalah
    CASE
        WHEN ps.name != tsc.stage_name THEN 'MISMATCH - Stage names different'
        WHEN ps.order IS NULL THEN 'ERROR - No project stage mapping'
        ELSE 'OK'
    END as issue_status
FROM submissions s
JOIN users u ON s.submitted_by_id = u.id
JOIN users ts ON s.target_student_id = ts.id
LEFT JOIN project_stages ps ON s.project_stage_id = ps.id
LEFT JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE s.instrument_type = 'OBSERVATION'
    AND tsc.stage_name != ps.name
ORDER BY s.target_student_id, ps.order, s.submitted_at;