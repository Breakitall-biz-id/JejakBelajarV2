# Product Requirements Document (PRD): JejakBelajar

**Version**: 7.1 (Definitive & Highly Detailed)
**Date**: September 25, 2025

## 1. Introduction & Core Concepts

### 1.1. Vision
[cite_start]**JejakBelajar** is a digital platform designed to facilitate the standardized implementation and documentation of **Assessment as Learning (AaL)** within the *Projek Penguatan Profil Pelajar Pancasila* (P5) framework[cite: 1]. [cite_start]The platform aims to create a consistent, structured, and digitally native assessment experience for high school projects, moving the entire process online[cite: 58].

### 1.2. Guiding Principles & Conceptual Framework
[cite_start]The application is architected around the **Assessment as Learning (AaL) Model** [cite: 26][cite_start], which is built on core theoretical foundations including Progressivism, Social Constructivism, Metacognition, and Self-Regulated Learning[cite: 23, 25, 26, 27, 28]. [cite_start]This model is expressed through five key components that guide the platform's design[cite: 43]:
1.  [cite_start]**Goal**: Defining learning objectives at the project's outset[cite: 44].
2.  [cite_start]**Success Criteria**: Establishing transparent assessment criteria for the entire project[cite: 45].
3.  [cite_start]**Task**: Providing structured, sequential assignments through a Project-Based Learning workflow[cite: 46].
4.  [cite_start]**Feedback**: Integrating multi-source feedback from peers (`Peer-assessment`), teachers (`Teacher-assessment`), and self-reflection (`Self-assessment`)[cite: 47].
5.  [cite_start]**Reporting**: Empowering students to report on their own learning, culminating in a **Student-Led Conference**[cite: 48, 50].

[cite_start]The practical implementation of this model is achieved through a standardized **Project-Based Learning (PjBL)** syntax[cite: 41, 49].

---

## 2. User Roles and Permissions

The platform features three distinct user roles with specific, segregated access rights.

### 2.1. School Admin
Acts as the central **Curriculum and Assessment Manager**, responsible for the structural and academic integrity of all projects.
* **Academic Structure Management**: Performs full CRUD operations on Academic Terms (Year & Semester) and Classes.
* **Account Management**: Performs full CRUD operations on Teacher and Student accounts.
* **User Assignment**: Assigns teachers and students to their respective classes.
* **Project Template Management**: Has exclusive rights to create, edit, and manage **Project Templates**. This critical function includes:
    * [cite_start]Defining the overall **Success Criteria** for a project template[cite: 45].
    * [cite_start]Defining the 6 PjBL stages for a template[cite: 49].
    * Defining **one or more required output instruments** for each stage (e.g., Stage 1 can require both a Reflection Journal and a Self-Assessment).
    * [cite_start]Writing the official, unchangeable **guiding prompt** for all `Reflection Journal` instruments[cite: 62].
    * [cite_start]Writing the official, unchangeable **questions/statements** for all questionnaire-based instruments (`Self-Assessment`, `Peer-Assessment`, `Observation Sheet`)[cite: 62].
    * [cite_start]Defining the detailed **scoring rubric criteria** for each question and journal indicator, specifying the meaning of scores 1, 2, 3, and 4[cite: 67, 71].
* **Monitoring**: Views aggregate, school-level reports and system usage statistics.

### 2.2. Teacher
Acts as a **Project Facilitator**, guiding students through predefined learning flows.
* **Project Instantiation**: Initiates a new project by **selecting from a list of predefined Project Templates**.
* **Project Contextualization**: Fills in project-specific details such as the official Title and Theme.
* **Group Management**: Forms and manages student groups within a project instance.
* **Facilitation & Assessment**: Monitors student progress, provides written feedback, and assesses student work. This includes:
    * Grading `Reflection Journals` based on the student's writing.
    * Filling out `Observation Sheets` for every student in the class.
    * During assessment, the User Interface **must display the relevant, Admin-defined rubric criteria** to the teacher to ensure objective and consistent grading.
* **Reporting**: Views and downloads detailed reports for their assigned classes and students.
* **Limitations**: The Teacher **cannot** alter the stages, outputs, assessment questions, or scoring rubrics defined in the Admin's template.

### 2.3. Student
The learner who actively participates in the project and the assessment process.
* **Task Completion**: Completes **all required outputs** for a given stage in sequence before the next stage is unlocked. This includes:
    * Writing in a **Reflection Journal** using a **Rich Text Editor**.
    * Completing **Self-Assessment Questionnaires**.
    * Completing **Peer-Assessment Questionnaires** for all other **N-1** members of their group.
* **Feedback Loop**: Receives and views feedback from their teacher and anonymized summary scores from their peers.
* [cite_start]**Reporting**: Prepares a portfolio and presents findings during a **Student-Led Conference**[cite: 50].

---

## 3. Detailed Workflows and Features

### 3.1. Admin Workflow: Project Template Management
This workflow allows the Admin to create the standardized project structures.
1.  **Initiate Template Creation**: Admin navigates to the "Project Templates" section.
2.  **Define Template Metadata**: Admin enters a unique **Template Name**, a **Description**, and defines the overall **Success Criteria** for the template in a Rich Text Editor.
3.  **Configure Stages**: The system presents the 6 PjBL stages. The Admin configures each stage by adding one or more output instruments.
4.  **Define Instrument Content & Rubrics**:
    * If the output is `SELF_ASSESSMENT`, `PEER_ASSESSMENT`, or `OBSERVATION`, the Admin writes the specific **questions/statements**. For each statement, the Admin also writes the descriptive **criteria for each score level (4, 3, 2, 1)**.
    * If the output is `JOURNAL`, the Admin writes a **guiding prompt**. The Admin then defines the **indicators** to be assessed (e.g., "Mengajukan pertanyaan terbuka...") and writes the descriptive **criteria for each score level (4, 3, 2, 1)** for each indicator.
5.  **Save Template**: The Admin saves the completed template, making it available to teachers.

### 3.2. Teacher Workflow: Project Instantiation and Assessment
1.  **Select Project Template**: Teacher selects an active template from a list.
2.  **Fill Project Details**: Teacher enters a unique **Title** and **Theme**.
3.  **Manage Groups**: Teacher creates groups and assigns students.
4.  **Publish Project**, making it visible to students.
5.  **Assess Student Work**:
    * For an `Observation Sheet` stage, the teacher is presented with a class list and can assess each student. The UI will display the relevant rubric criteria for each question to guide the teacher.
    * For a submitted `Reflection Journal`, the teacher views the student's text alongside the full scoring rubric and assigns a score and feedback for each indicator.

### 3.3. Student Workflow: Project Execution
1.  **Access Project**: Student selects the active project and reviews the overall **Success Criteria**.
2.  **Enter Stage**: Student enters the current active stage. Subsequent stages are locked.
3.  **Complete Outputs**: The student sees a checklist of required outputs for the stage.
    * If **Reflection Journal**, a **Rich Text Editor** is displayed with the Admin's guiding prompt.
    * If **Self-Assessment**, a questionnaire is displayed for the student to rate themselves.
    * If **Peer-Assessment**, the system displays a list of the student's **N-1** group members. The student must complete the questionnaire for each peer.
4.  **Proceed**: Once all outputs for a stage are submitted, the next stage is unlocked.

### 3.4. Core Assessment Logic & Reporting
* [cite_start]**Instrument Types**: The platform supports four types of assessment instruments: `Reflection Journal`, `Self-Assessment Questionnaire`, `Peer-Assessment Questionnaire`, `Observation Sheet Questionnaire`[cite: 57].
* [cite_start]**Scoring Scale**: All scorable items across all instruments use a 1-4 point scale[cite: 64]. [cite_start]Questionnaire responses are explicitly mapped[cite: 69]:
    * **Always**: 4 points
    * **Often**: 3 points
    * **Sometimes**: 2 points
    * **Never**: 1 point
* [cite_start]**Dimensions**: Scores are aggregated under the following dimensions: Faith and Piety, Critical Reasoning, Creativity, Collaboration, Independence, and Communication[cite: 73].
* [cite_start]**Quantitative Score Formula**: The achievement score (X) for each dimension is calculated using the formula[cite: 76]:
    $$X = \frac{\text{sum of all item scores}}{\text{total items} \times 4} \times 100$$
* [cite_start]**Qualitative Score Conversion**: The quantitative score (X) is converted into a qualitative category (Excellent, Good, etc.) [cite: 83] using a standardized interval scale. [cite_start]The parameters are calculated as follows[cite: 85, 86]:
    * **Ideal Mean (µ)** = ½ (ideal minimum score + ideal maximum score)
    * **Ideal Standard Deviation (𝝈)** = ½ (ideal maximum score - ideal minimum score)

---

## 4. Non-Functional Requirements
* **User Experience**: Intuitive, responsive, and accessible on desktop and mobile.
* **Code Quality**: Modular, reusable components, clean, and maintainable.
* **Security & Reliability**: Role-based access control and automated backups.

---

## 5. Technical Specifications
* **Frontend Framework**: Next.js
* **Styling**: Tailwind CSS
* **UI Component Library**: shadcn/ui (using the **shadcn-blocks** dashboard template).
* **Database**: Neon (Serverless PostgreSQL)
* **Authentication**: NextAuth.js (Auth.js).

---

## 6. Appendix A: Application Flow Diagram

```mermaid
graph TD
    subgraph School Admin
        A1[Login] --> A2{Manage System};
        A2 --> A3[1. CRUD Academic Terms, Users, Classes];
        A2 --> A4[2. <b>Create/Edit Project Templates</b>];
        A4 --> A5[Define Stages, Outputs, Questions & <b>Rubrics</b>];
    end

    subgraph Teacher
        B1[Login] --> B2[Create New Project];
        B2 --> B3[<b>Select a Project Template</b>];
        B3 --> B4[Fill Project Details (Title, Theme)];
        B4 --> B5[Form Student Groups];
        B5 --> B6[Publish Project];
        B6 --> B7{Monitor & Grade <b>with Rubrics</b>};
    end

    subgraph Student
        C1[Login] --> C2[View Active Project & Success Criteria];
        C2 --> C3{Work Through Standardized Stages};
        C3 --> C4[<b>Stage 1:</b> Complete <b>All</b> Predefined Outputs];
        C4 --> C5[<b>Stage 2:</b> Complete <b>All</b> Predefined Outputs];
        C5 --> C6[...]
        C6 --> C7[Project Complete & View Report];
    end

    %% Flow of Interaction
    A3 -- Master data is ready --> B1;
    A5 -- Templates are ready --> B2;
    B6 -- Project instance is active --> C2;
    C4 -- Submissions --> B7;
    C5 -- Submissions --> B7;


## 7. This schema is the final version, updated to support the Admin's ability to define scoring rubrics directly in the database.

```sql
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

-- Pivot table to assign users to classes
CREATE TABLE user_class_assignments (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, class_id)
);

-- Central table for defining project templates, managed by Admin
CREATE TABLE project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    success_criteria JSONB, -- NEW: Stores the overall project success criteria
    created_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Defines the stages and required instruments for each template.
CREATE TABLE template_stage_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES project_templates(id) ON DELETE CASCADE,
    stage_name VARCHAR(255) NOT NULL,
    instrument_type ENUM('JOURNAL', 'SELF_ASSESSMENT', 'PEER_ASSESSMENT', 'OBSERVATION') NOT NULL,
    display_order INT NOT NULL
);

-- Stores the predefined questions/prompts AND their scoring rubrics.
CREATE TABLE template_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES template_stage_configs(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL, -- This is the question, statement, or journal indicator
    rubric_criteria JSONB -- UPDATED: Stores rubric criteria, e.g., {"4": "Description for score 4", "3": "..."}
);

-- Project instances created by Teachers, linked to a template
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

-- Table for student groups within a project instance
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE
);

-- Pivot table for group members
CREATE TABLE group_members (
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, student_id)
);

-- Table to store all student submissions and teacher assessments
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Content of the submission
    -- For questionnaires: {"template_question_id": score, ...}
    -- For journals: {"html_content": "<p>...</p>"}
    -- For observations by teacher, this can be the same as questionnaires.
    content JSONB,
    
    -- Context for the submission
    template_stage_config_id UUID REFERENCES template_stage_configs(id),
    target_student_id UUID REFERENCES users(id) ON DELETE CASCADE NULL, -- For Peer-Assessment

    -- Grading from the teacher
    score INT,
    feedback TEXT,

    submitted_at TIMESTAMPTZ DEFAULT now()
);