-- Add template system for PRD-V2 admin-centric model
-- This migration adds project templates, stage configs, and predefined questions

-- Create project_templates table
CREATE TABLE project_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create template_stage_configs table
CREATE TABLE template_stage_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
    stage_name VARCHAR(255) NOT NULL,
    instrument_type instrument_type NOT NULL,
    display_order INTEGER NOT NULL,
    description TEXT,
    estimated_duration VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(template_id, display_order)
);

-- Create template_questions table
CREATE TABLE template_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_id UUID NOT NULL REFERENCES template_stage_configs(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'STATEMENT' NOT NULL,
    scoring_guide TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add template_id to projects table
ALTER TABLE projects ADD COLUMN template_id UUID REFERENCES project_templates(id) ON DELETE RESTRICT;

-- Create indexes for better performance
CREATE INDEX idx_projects_template_id ON projects(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX idx_template_questions_config_id ON template_questions(config_id);
CREATE INDEX idx_template_stage_configs_template_id ON template_stage_configs(template_id);

-- Insert default templates (these would be created by admin in production)
-- For development purposes, we'll create some sample templates
INSERT INTO project_templates (template_name, description, created_by_id, is_active) VALUES
('Standard P5 Template', 'Complete 6-stage PjBL project with all assessment instruments', NULL, true),
('Mini Project Template', 'Simplified 4-stage project for shorter timeframes', NULL, true),
('Research Focus Template', 'Research-intensive project with emphasis on documentation', NULL, true);

-- Add sample stage configs for Standard P5 Template
-- This would typically be done through admin interface
INSERT INTO template_stage_configs (template_id, stage_name, instrument_type, display_order, description, estimated_duration) VALUES
((SELECT id FROM project_templates WHERE template_name = 'Standard P5 Template'), 'Planning & Research', 'JOURNAL', 1, 'Identify environmental issues and research potential solutions', '2 weeks'),
((SELECT id FROM project_templates WHERE template_name = 'Standard P5 Template'), 'Planning & Research', 'SELF_ASSESSMENT', 1, 'Initial self-reflection on research capabilities', '2 weeks'),
((SELECT id FROM project_templates WHERE template_name = 'Standard P5 Template'), 'Implementation', 'JOURNAL', 2, 'Execute the planned environmental solution', '3 weeks'),
((SELECT id FROM project_templates WHERE template_name = 'Standard P5 Template'), 'Implementation', 'PEER_ASSESSMENT', 2, 'Peer review of implementation progress', '3 weeks'),
((SELECT id FROM project_templates WHERE template_name = 'Standard P5 Template'), 'Evaluation & Reflection', 'JOURNAL', 3, 'Assess the impact and reflect on learning outcomes', '2 weeks'),
((SELECT id FROM project_templates WHERE template_name = 'Standard P5 Template'), 'Evaluation & Reflection', 'SELF_ASSESSMENT', 3, 'Self-evaluation of learning outcomes', '2 weeks'),
((SELECT id FROM project_templates WHERE template_name = 'Standard P5 Template'), 'Evaluation & Reflection', 'OBSERVATION', 3, 'Teacher observation of student performance', '2 weeks'),
((SELECT id FROM project_templates WHERE template_name = 'Standard P5 Template'), 'Presentation', 'PEER_ASSESSMENT', 4, 'Peer evaluation of final presentation', '1 week'),
((SELECT id FROM project_templates WHERE template_name = 'Standard P5 Template'), 'Presentation', 'OBSERVATION', 4, 'Teacher assessment of presentation quality', '1 week');

-- Update existing projects to use a default template for backward compatibility
UPDATE projects SET template_id = (SELECT id FROM project_templates WHERE template_name = 'Standard P5 Template' LIMIT 1) WHERE template_id IS NULL;