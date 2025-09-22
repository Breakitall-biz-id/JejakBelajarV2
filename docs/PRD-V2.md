# Product Requirements Document (PRD): JejakBelajar

**Version**: 2 (Final - Admin-Centric Model)
**Date**: September 20, 2025

This document details the functional, non-functional, workflow, and technical specifications for the **JejakBelajar** platform, based on a centralized, admin-controlled project structure.

## 1. Background & Guiding Principles

**JejakBelajar** is a digital platform designed to facilitate the standardized implementation and documentation of assessments within the *Projek Penguatan Profil Pelajar Pancasila* (P5) framework. The application enables a consistent **Assessment as Learning (AaL)** process across the institution by providing predefined project templates that follow a structured **Project-Based Learning (PjBL)** workflow.

---

## 2. User Roles and Permissions

The platform features three distinct user roles with specific access rights:

* **School Admin**: Acts as the central **Curriculum and Assessment Manager**.
    * Performs CRUD operations on **Academic Terms**, **User Accounts**, and **Classes**.
    * **Designs and manages Project Templates**: This includes defining the 6 PjBL stages, setting the required outputs for each stage (e.g., Journal, Observation), and writing the official questions/statements for all assessment instruments.
    * Assigns teachers and students to classes.
    * Views aggregate school-level reports.

* **Teacher**: Acts as a **Project Facilitator**.
    * **Initiates a new project by selecting from a list of predefined Project Templates** created by the Admin. The teacher cannot alter the stages, outputs, or assessment questions.
    * Fills in project-specific details (e.g., title, theme).
    * Forms and manages student **groups**.
    * Monitors student progress, grades submissions (Journals, Observations), and provides feedback.
    * Views and downloads class and student reports.

* **Student**: The learner participating in the project.
    * Completes tasks according to the **standardized, sequential project timeline** defined in the project template.
    * Fills out the predefined questionnaires and journals as required for each stage.
    * Views feedback from teachers and reports.

---

## 3. Features and Functionality

#### **3.1. Assessment Instruments & Workflow**
* **Instrument Types**: The system provides four types of assessment instruments, which are predefined by the Admin within Project Templates:
    * **Reflection Journal**: An essay-style input field presented as a **Rich Text Editor (RTE)**, allowing students to format their text with options like bold, italics, and lists. This instrument is graded by the Teacher.
    * **Self-Assessment Questionnaire**: A set of statements for students to reflect on themselves.
    * **Peer-Assessment Questionnaire**: A set of statements for students to assess their peers.
    * **Observation Sheet Questionnaire**: A set of statements for teachers to assess students' observable behaviors.

* **Questionnaire Format**: The **Self-Assessment**, **Peer-Assessment**, and **Observation Sheet** instruments are all presented as questionnaires. Each statement must be answered by selecting from four possible responses, which correspond to a specific score:
    * **Always**: 4 points
    * **Often**: 3 points
    * **Sometimes**: 2 points
    * **Never**: 1 point

* **Specific Workflows**:
    * **Peer-Assessment**: In a group of **N** students, each student is required to fill out the questionnaire for the other **N-1** members of their group.

#### **3.2. Automated Reporting**
* The system calculates and converts scores into qualitative reports based on the standardized items and predefined formulas for **µ** and **𝝈**.

---

## 4. Non-Functional Requirements
* Includes User-Friendliness, Responsive Design, Security, Reliability, and **Code Quality** (Modular, Reusable, Clean Code for Maintainability).

---

## 5. Technical Specifications
* **Frontend Framework**: Next.js
* **Styling**: Tailwind CSS
* **UI Component Library**: shadcn/ui, with the main dashboard layout adapted from the **shadcn-blocks** template.
* **Database**: Neon (Serverless PostgreSQL)
* **Authentication**: NextAuth.js (Auth.js) or a similar solution.

---

## 6. REfferences
* **Create Project**  refer ui of create project in /reffrences/create-project.png
* **Dashboard** refer ui of dashboard in /refferences/dashboard.png
* **Detail Project** refer ui of detail project in /refferences/detail-project.png
* **Questionnaires refer ui of self a Self-Assessment Questionnaire , Peer-Assessment, Observation Sheet Questionnaire in /refferences/questionnaires.png

## 7. Complete Application Flow

This flow reflects the Admin-Centric model where teachers select predefined templates.

```mermaid
graph TD
    subgraph School Admin
        A1[Login] --> A2{Manage System};
        A2 --> A3[1. CRUD Academic Terms, Users, Classes];
        A2 --> A4[2. <b>Create/Edit Project Templates</b>];
        A4 --> A5[Define Stages, Outputs, and Questions for each Template];
    end

    subgraph Teacher
        B1[Login] --> B2[Create New Project];
        B2 --> B3[<b>Select a Project Template</b>];
        B3 --> B4[Fill Project Details (Title, Theme)];
        B4 --> B5[Form Student Groups];
        B5 --> B6[Publish Project];
        B6 --> B7{Monitor & Grade};
    end

    subgraph Student
        C1[Login] --> C2[View Active Project];
        C2 --> C3{Work Through Standardized Stages};
        C3 --> C4[<b>Stage 1:</b> Complete Predefined Outputs];
        C4 --> C5[<b>Stage 2:</b> Complete Predefined Outputs];
        C5 --> C6[...]
        C6 --> C7[Project Complete & View Report];
    end

    %% Flow of Interaction
    A3 -- Master data is ready --> B1;
    A5 -- Templates are ready --> B2;
    B6 -- Project instance is active --> C2;
    C4 -- Submissions --> B7;
    C5 -- Submissions --> B7;


-- Table to manage academic terms
CREATE TABLE academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year VARCHAR(10) NOT NULL, -- e.g., '2025/2026'
    semester ENUM('ODD', 'EVEN') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE',
    UNIQUE(academic_year, semester)
);

-- Table for all system users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for classes, linked to an academic term
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    academic_term_id UUID REFERENCES academic_terms(id) ON DELETE RESTRICT,
    UNIQUE(name, academic_term_id)
);

-- (Pivot tables for assignments, projects, groups, and members remain largely the same)
CREATE TABLE user_class_assignments (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, class_id)
);

-- NEW: Central table for defining project templates
CREATE TABLE project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- NEW: Defines the stages and required instruments for each template
CREATE TABLE template_stage_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES project_templates(id) ON DELETE CASCADE,
    stage_name VARCHAR(255) NOT NULL,
    instrument_type ENUM('JOURNAL', 'SELF_ASSESSMENT', 'PEER_ASSESSMENT', 'OBSERVATION') NOT NULL,
    display_order INT NOT NULL
);

-- NEW: Stores the predefined questions for each instrument in a template
CREATE TABLE template_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES template_stage_configs(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL
);

-- MODIFIED: Projects table now links to a template
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    theme VARCHAR(255),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    template_id UUID REFERENCES project_templates(id) ON DELETE RESTRICT,
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE group_members (
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, student_id)
);

-- MODIFIED: Submissions table links to template questions
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- For questionnaires, content is JSON: {"template_question_id": score}
    -- For journals, content is JSON: {"text": "...", "html": "..."}
    content JSONB,
    
    -- Extra context for the submission
    template_stage_config_id UUID REFERENCES template_stage_configs(id),
    target_student_id UUID REFERENCES users(id) ON DELETE CASCADE NULL,

    -- Grading from the teacher
    score INT,
    feedback TEXT,

    submitted_at TIMESTAMPTZ DEFAULT now()
);