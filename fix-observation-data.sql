-- Query untuk memperbaiki data observasi yang tersimpan dengan template_stage_config_id yang salah
-- LOGIKA:
-- 1. Identifikasi submission observasi yang salah (template_stage_config_id tidak sesuai dengan stage_name)
-- 2. Cari template_stage_config_id yang seharusnya digunakan untuk stage tersebut
-- 3. Update submission dengan template_stage_config_id yang benar
-- 4. Sesuaikan content answers jika perlu (berdasarkan jumlah pertanyaan di stage yang benar)

-- Langkah 1: Tampilkan data yang akan diperbaiki
SELECT
    'DATA TO BE FIXED' as analysis,
    s.id as submission_id,
    ps.name as stage_name,
    ps.order as stage_order,
    s.template_stage_config_id as current_wrong_config,
    correct_tsc.id as correct_config,
    s.content as current_content,
    correct_tsc.stage_name as correct_stage_name
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
    AND correct_tsc.instrument_type = 'OBSERVATION'
WHERE s.instrument_type = 'OBSERVATION'
    AND wrong_tsc.stage_name != ps.name
ORDER BY ps.name, s.submitted_at;

-- Langkah 2: Update template_stage_config_id untuk submission yang salah
UPDATE submissions s
SET template_stage_config_id = correct_tsc.id
FROM project_stages ps
JOIN template_stage_configs wrong_tsc ON s.template_stage_config_id = wrong_tsc.id
JOIN template_stage_configs correct_tsc ON correct_tsc.stage_name = ps.name
    AND correct_tsc.instrument_type = 'OBSERVATION'
WHERE s.instrument_type = 'OBSERVATION'
    AND s.project_stage_id = ps.id
    AND wrong_tsc.stage_name != ps.name;

-- Langkah 3: Verifikasi hasil update
SELECT
    'FIXED DATA' as status,
    s.id as submission_id,
    ps.name as stage_name,
    ps.order as stage_order,
    s.template_stage_config_id as corrected_config,
    tsc.stage_name as template_stage_name,
    s.content,
    CASE
        WHEN ps.name = tsc.stage_name THEN 'FIXED - Names match'
        ELSE 'STILL WRONG - Names dont match'
    END as fix_status
FROM submissions s
JOIN project_stages ps ON s.project_stage_id = ps.id
JOIN template_stage_configs tsc ON s.template_stage_config_id = tsc.id
WHERE s.instrument_type = 'OBSERVATION'
    AND s.project_id = 'a217c688-2b8a-4d14-9601-ad9aa158367d' -- ganti dengan project_id yang spesifik jika perlu
ORDER BY s.target_student_id, ps.order, s.submitted_at;