# Product Requirements Document (PRD): JejakBelajar

**Version**: 2.0 (Final)
**Date**: September 19, 2025

This document details the functional, non-functional, workflow, and technical specifications for the **JejakBelajar** platform.

## 1. Background

[cite_start]**JejakBelajar** is a digital platform designed to facilitate the implementation and documentation of assessments within the *Projek Penguatan Profil Pelajar Pancasila* (P5) framework[cite: 1]. [cite_start]Its primary goal is to digitize formative, reflective, and participatory assessment processes, enabling them to be conducted in a structured manner by both teachers and students[cite: 1]. [cite_start]The platform's name is **"JejakBelajar: Your Process, Your Story, Your Value."** [cite: 1]

---

## 2. User Roles and Permissions

The platform features three distinct user roles with specific access rights:

* **School Admin**: Responsible for managing the school's master data.
    * [cite_start]Performs **CRUD** (Create, Read, Update, Delete) operations on **Academic Terms** (Year & Semester) and sets the active term[cite: 1].
    * [cite_start]Performs **CRUD** on **Teacher** and **Student** accounts[cite: 1].
    * [cite_start]Performs **CRUD** on **Classes** based on the active academic term[cite: 1].
    * [cite_start]**Assigns** teachers and students to their respective classes[cite: 1].
    * [cite_start]Views aggregate school-level reports and system usage statistics[cite: 1].
    * [cite_start]**Cannot** modify or grade student submissions[cite: 1].

* **Teacher**: Acts as a project facilitator.
    * [cite_start]Creates and manages **projects** for assigned classes within the active academic term[cite: 1].
    * [cite_start]Forms and manages student **groups** within a project[cite: 1].
    * [cite_start]Fills out **observation sheets** and grades student **reflection journals**[cite: 1].
    * [cite_start]Provides written **feedback** on students' daily notes[cite: 1].
    * [cite_start]Views and downloads individual and class-wide **assessment reports**[cite: 1].

* **Student**: The learner participating in the project.
    * [cite_start]Accesses project details and views their group members for the active academic term[cite: 1].
    * [cite_start]Completes tasks according to a **sequential, non-skippable project timeline**[cite: 3].
    * [cite_start]Fills out **self-assessment questionnaires**, **peer-assessment forms**, **reflection journals**, and **daily notes**[cite: 1].
    * [cite_start]Views feedback from teachers and anonymized summary scores from peer assessments[cite: 1].

---

## 3. Features and Functionality

#### **3.1. Project and Class Management**
* [cite_start]Teachers can create a project framework containing a series of stages for students to complete[cite: 1].
* [cite_start]Project stages are **sequential**, meaning a student must complete one stage before the next one is unlocked[cite: 3].
* [cite_start]The project stages and their required outputs are based on the Project-Based Learning (PjBL) syntax outlined in the source document[cite: 3].

#### **3.2. Digital Assessment Instruments**
* [cite_start]The system provides five types of instruments: Self-Assessment Questionnaire, Peer-Assessment Questionnaire (among group members), Observation Sheet (filled by teacher), Reflection Journal (graded by teacher), and Daily Notes (with teacher feedback)[cite: 1, 3].

#### **3.3. Automated Reporting**
* [cite_start]The system automatically calculates the achievement score for each dimension using the formula[cite: 12, 13]:
    $$Score = \frac{\text{sum of all item scores}}{\text{total items} \times 4} \times 100$$
* [cite_start]Quantitative scores are converted into qualitative criteria (e.g., Highly Developed, Developing as Expected) based on a predefined categorization norm[cite: 18, 19, 21].

---

## 4. Non-Functional Requirements
* [cite_start]**User-Friendly**: An intuitive and easy-to-navigate interface[cite: 1].
* [cite_start]**Responsive Design**: Fully accessible on both desktop and mobile devices[cite: 1].
* **Language**: The UI will be in English.
* [cite_start]**Security**: Segregated login access and clearly defined permissions for each role[cite: 1].
* [cite_start]**Reliability**: Automated data backup system to prevent data loss[cite: 1].

---

## 5. Technical Specifications
* **Frontend Framework**: Next.js
* **Styling**: Tailwind CSS
* **UI Component Library**: shadcn/ui, with the main dashboard layout adapted from the **shadcn-blocks** template.
* **Database**: Neon (Serverless PostgreSQL)
* **Authentication**: NextAuth.js (Auth.js) or a similar solution to handle login, sessions, and multi-role route protection.
* **Code Structure: Most be modular, Component Reusable, Do not build one module at one file, clean code

---

## 6. Complete Application Flow

This diagram illustrates the detailed, end-to-end workflow for all three user roles, accurately reflecting the PjBL syntax from the source document.

```mermaid
graph TD
    subgraph School Admin
        A1[Login as Admin] --> A2{Setup Master Data};
        A2 --> A3[1. CRUD Academic Term (Year & Semester)];
        A2 --> A4[2. CRUD Teacher & Student Accounts];
        A2 --> A5[3. CRUD Classes];
        A2 --> A6[4. Assign Users to Classes];
    end

    subgraph Teacher
        B1[Login as Teacher] --> B2[View Assigned Classes];
        B2 --> B3[Create New Project];
        B3 --> B4[Set Project Details & Stages per PjBL];
        B4 --> B5[Form Student Groups];
        B5 --> B6[Publish Project];
        B6 --> B7{Monitor, Grade & Give Feedback};
        B7 --> B8[Fill Observation Sheets (Stages 2, 4, 5)];
        B7 --> B9[Grade Reflection Journals (Stages 1, 4, 6)];
        B7 --> B10[View Student Progress per Stage];
        B10 --> B11[Download Final Reports];
    end

    subgraph Student
        C1[Login] --> C2[View Active Project & Group];
        C2 --> C3["<b>Stage 1:</b> Start with the essential question"];
        C3 -- Output: Submit Reflection Journal --> C4["<b>Stage 2:</b> Design a plan for the project"];
        C4 -- Output: Submit Self & Peer Questionnaires --> C5["<b>Stage 3:</b> Create a schedule"];
        C5 -- Output: Submit Self & Peer Questionnaires --> C6["<b>Stage 4:</b> Monitor the progress of the project"];
        C6 -- Output: Submit Questionnaires & Reflection Journal --> C7["<b>Stage 5:</b> Assess the outcome"];
        C7 -- Output: Product/Presentation (Graded by Teacher) --> C8["<b>Stage 6:</b> Evaluate the experiences"];
        C8 -- Output: Submit Final Reflection Journal --> C9[Project Complete & View Report];
    end

    %% Flow of Interaction
    A6 -- Data is ready --> B1;
    B6 -- Project is active --> C2;
    C3 -- Submission --> B7;
    C4 -- Submission --> B7;
    C5 -- Submission --> B7;
    C6 -- Submission --> B7;
    C7 -- Graded via Observation by Teacher --> B7;
    C8 -- Submission --> B7;
    B9 -- Feedback & grades are visible --> C9;






    -- Table to manage academic terms
CREATE TABLE academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year VARCHAR(10) NOT NULL, -- e.g., '2025/2026'
    semester ENUM('ODD', 'EVEN') NOT NULL, -- ODD for Ganjil, EVEN for Genap
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE',
    UNIQUE(academic_year, semester) -- Ensures each semester only exists once per year
);

-- Table for all system users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL, -- Crucial for multi-role authentication
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for classes, linked to an academic term
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    academic_term_id UUID REFERENCES academic_terms(id) ON DELETE RESTRICT, -- Prevents term deletion if classes are linked
    UNIQUE(name, academic_term_id) -- Class names must be unique within a term
);

-- Pivot table to assign users to classes
CREATE TABLE user_class_assignments (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, class_id)
);

-- Table for projects created by teachers
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    theme VARCHAR(255),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL, -- The teacher who created the project
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for student groups within a project
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE
);

-- Pivot table for group members
CREATE TABLE group_members (
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Refers to a user with the STUDENT role
    PRIMARY KEY (group_id, student_id)
);

-- Table to store all student submissions
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    project_stage_name VARCHAR(255) NOT NULL, -- e.g., 'Start with the essential question'
    instrument_type ENUM('JOURNAL', 'SELF_ASSESSMENT', 'PEER_ASSESSMENT', 'OBSERVATION') NOT NULL,

    -- For Peer Assessments, this identifies the student being assessed
    target_student_id UUID REFERENCES users(id) ON DELETE CASCADE NULL,

    -- The actual content of the submission, stored as JSON
    content JSONB,

    -- Grading from the teacher (for Journals & Observations)
    score INT,
    feedback TEXT,

    submitted_at TIMESTAMPTZ DEFAULT now()
);