-- Query untuk test apakah fix templateStageConfigId berfungsi
-- Cek submissions PEER_ASSESSMENT terbaru untuk "Create a schedule" stage

SELECT
  s.id,
  s.template_stage_config_id,
  s.instrument_type,
  s.content,
  s.submitted_at,
  u.name as student_name,
  ts.stage_name,
  ps.order as stage_order
FROM submissions s
JOIN users u ON s.submitted_by_id = u.id
LEFT JOIN project_stages ps ON s.project_stage_id = ps.id
LEFT JOIN template_stage_configs ts ON s.template_stage_config_id = ts.id
WHERE s.instrument_type = 'PEER_ASSESSMENT'
  AND s.template_stage_config_id = 'b96f81dc-f8ac-42db-ab36-2dea79e6e780'  -- Create a schedule stage
ORDER BY s.submitted_at DESC
LIMIT 10;

-- Query untuk membandingkan jumlah submissions per stage
SELECT
  ts.stage_name,
  s.template_stage_config_id,
  COUNT(*) as submission_count,
  COUNT(DISTINCT s.submitted_by_id) as unique_students
FROM submissions s
LEFT JOIN template_stage_configs ts ON s.template_stage_config_id = ts.id
WHERE s.instrument_type = 'PEER_ASSESSMENT'
GROUP BY ts.stage_name, s.template_stage_config_id
ORDER BY s.submitted_at DESC;

-- Query untuk cek apakah masih ada submissions dengan config lama yang salah
SELECT
  s.template_stage_config_id,
  COUNT(*) as wrong_submissions
FROM submissions s
WHERE s.instrument_type = 'PEER_ASSESSMENT'
  AND s.template_stage_config_id = 'c9fad00b-f3f4-413e-a753-8d9b183c2fd6'  -- Design a plan (should not be used for Create a schedule submissions)
GROUP BY s.template_stage_config_id;