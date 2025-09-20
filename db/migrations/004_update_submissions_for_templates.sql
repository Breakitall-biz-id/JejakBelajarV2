-- Update submissions table to work with template questions
-- This migration restructures submissions to support the new template-based system

-- Add template_stage_config_id column to submissions
ALTER TABLE submissions ADD COLUMN template_stage_config_id UUID REFERENCES template_stage_configs(id) ON DELETE SET NULL;

-- Add constraints and indexes for better performance
CREATE INDEX idx_submissions_template_config_id ON submissions(template_stage_config_id) WHERE template_stage_config_id IS NOT NULL;

-- Create composite index for common query patterns
CREATE INDEX idx_submissions_student_project_config ON submissions(student_id, project_id, template_stage_config_id);

-- Update existing submissions to link with template configs where possible
-- This is a complex migration that would need data mapping logic
-- For now, we'll set template_stage_config_id to NULL for existing records
-- In production, this would require a data migration script

-- Add check constraint to ensure either template_stage_config_id or project_stage_id is not null
-- Note: This might fail if there are existing NULL records, so we'll handle it carefully
DO $$
BEGIN
    -- Check if there are any existing submissions that would violate the constraint
    IF EXISTS (SELECT 1 FROM submissions WHERE project_stage_id IS NULL AND template_stage_config_id IS NULL) THEN
        RAISE NOTICE 'Found submissions without stage reference - cannot add constraint yet';
    ELSE
        ALTER TABLE submissions ADD CONSTRAINT chk_submissions_stage_reference
        CHECK (project_stage_id IS NOT NULL OR template_stage_config_id IS NOT NULL);
        RAISE NOTICE 'Added stage reference constraint successfully';
    END IF;
END $$;

-- Add comment to document the new structure
COMMENT ON TABLE submissions IS 'Stores student submissions for both template-based and custom projects. Template-based projects use template_stage_config_id, while custom projects use project_stage_id.';

-- Add comments for new column
COMMENT ON COLUMN submissions.template_stage_config_id IS 'Reference to template stage configuration for template-based projects';
COMMENT ON COLUMN submissions.content IS 'JSON structure: For questionnaires: {"template_question_id": score}, For journals: {"text": "...", "html": "..."}';