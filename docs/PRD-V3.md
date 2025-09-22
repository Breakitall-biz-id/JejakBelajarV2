# Product Requirements Document (PRD): JejakBelajar

**Version**: 3.0 (Definitive - Detailed Workflows)
**Date**: September 21, 2025

## 1. Introduction & Core Concepts

### 1.1. Vision
**JejakBelajar** is a digital platform designed to facilitate the standardized implementation and documentation of **Assessment as Learning (AaL)** within the *Projek Penguatan Profil Pelajar Pancasila* (P5) framework. The platform aims to create a consistent, structured, and digitally native assessment experience for high school projects.

### 1.2. Guiding Principles
The application is architected around the **Assessment as Learning (AaL) Model**, built on core theoretical foundations to guide the platform's design through five key components: Goal, Success Criteria, Task, Feedback, and Reporting. The practical implementation of this model is achieved through a standardized **Project-Based Learning (PjBL)** syntax.

---

## 2. User Roles and Permissions

(User Roles and Permissions remain the same as Version 2)

### 2.1. School Admin
Acts as the central **Curriculum and Assessment Manager**. Responsibilities include managing academic terms, user accounts, classes, and designing **Project Templates**.

### 2.2. Teacher
Acts as a **Project Facilitator**. Responsibilities include instantiating projects from templates, managing groups, and assessing student work.

### 2.3. Student
The learner who actively participates in the project. Responsibilities include completing all required outputs for each stage in sequence.

---

## 3. Detailed Workflows and Features

This section details the primary step-by-step workflows for each user role.

### 3.1. Admin Workflow: Project Template Management
This workflow allows the Admin to create the standardized project structures that teachers will use.

1.  **Initiate Template Creation**: Admin navigates to the "Project Templates" section and clicks "Create New Template".
2.  **Define Template Metadata**: Admin enters a unique **Template Name** (e.g., "Essential Oils Project - Standard Model") and a **Description**.
3.  **Configure Stages**: The system presents the 6 unchangeable PjBL stages. The Admin configures each stage:
    * `Stage 1: Start with the essential question`
    * `Stage 2: Design a plan for the project`
    * ...and so on.
4.  **Define Stage Outputs**: For each stage, the Admin clicks an "Add Output" button. They can add **multiple outputs** per stage. For each output, they select an instrument type (`JOURNAL`, `SELF_ASSESSMENT`, `PEER_ASSESSMENT`, `OBSERVATION`).
5.  **Define Instrument Content**:
    * If the output type is `SELF_ASSESSMENT`, `PEER_ASSESSMENT`, or `OBSERVATION`, the system will prompt the Admin to write the specific **questions or statements** for that questionnaire.
    * If the output type is `JOURNAL`, the system will prompt the Admin to write a single **guiding prompt or description** for the reflection.
6.  **Save Template**: Once all stages are configured, the Admin saves the template, making it available for teachers to select.

### 3.2. Teacher Workflow: Project Instantiation and Management
This workflow allows a teacher to launch a new project for their class using a predefined template.

1.  **Initiate Project Creation**: Teacher navigates to their dashboard and clicks "Create New Project".
2.  **Select Project Template**: The teacher is presented with a dropdown list of all active **Project Templates** created by the Admin. They select the one they wish to use.
3.  **Fill Project Details**: The teacher enters project-specific information that contextualizes the template, such as the official **Project Title** (e.g., "Cinnamon Stick Essential Oil Project - Class XA") and **Theme**.
4.  **Manage Groups**: The teacher proceeds to the "Group Management" tab for this project. They create groups (e.g., "Group 1", "Group 2") and assign students from their class list to each group.
5.  **Publish Project**: The teacher clicks "Publish". The project now becomes active and visible to all assigned students on their dashboards.

### 3.3. Student Workflow: Project Execution
This workflow details the core learning loop for a student progressing through a project.

1.  **Access Project**: From their dashboard, the student clicks on an active project.
2.  **View Stages**: The system displays the list of 6 project stages. Only the current, uncompleted stage is active (clickable). All subsequent stages are locked.
3.  **Enter Stage**: The student clicks on the active stage.
4.  **View Stage Outputs**: Inside the stage view, the system displays a checklist of **all required assessment outputs** for that stage (e.g., for Stage 2, it might show "1. Self-Assessment", "2. Peer-Assessment").
5.  **Complete Individual Outputs**: The student clicks on an output from the checklist to complete it.
    * If **Reflection Journal**, a **Rich Text Editor** is displayed with the Admin's guiding prompt. The student writes and submits their reflection.
    * If **Self-Assessment**, a questionnaire with the Admin's predefined statements is displayed. The student answers each statement using the 4-point scale (Always, Often, etc.) and submits.
    * If **Peer-Assessment**, the system first displays a list of the student's **N-1** group members. The student must select a peer, complete the questionnaire for that peer, and submit. This process is repeated until all peers have been assessed.
6.  **Complete Stage**: Once all required outputs in the checklist are submitted, the stage is marked as complete. The system then automatically **unlocks the next stage** in the sequence. This loop repeats until all 6 stages are finished.

### 3.4. Core Assessment Logic & Reporting
* **Scoring**: All questionnaire items use a 4-point scale (Always: 4, Often: 3, Sometimes: 2, Never: 1).
* **Formulas**: Scores are aggregated per dimension and converted to qualitative reports using the predefined formulas for **X**, **µ**, and **𝝈**.

---

## 4. Non-Functional Requirements & Technical Specifications
(These sections remain the same as Version 5.2, covering User Experience, Code Quality, Security, and the Tech Stack: Next.js, shadcn/ui, Neon DB, etc.)

---

## 5. Database Schema Design
(The database schema from Version 5.2 remains the correct design to support these detailed workflows.)

```sql
-- (Database schema remains the same as the previous version)