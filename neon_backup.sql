--
-- PostgreSQL database dump
--

\restrict 0kx7tLXBQu6HtabawBpwczKPAOJSNyDUtI3Vkx7P3JTJdDPXfjQElfM9kzQtO61

-- Dumped from database version 17.8 (ad62774)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.user_class_assignments DROP CONSTRAINT IF EXISTS user_class_assignments_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_class_assignments DROP CONSTRAINT IF EXISTS user_class_assignments_class_id_classes_id_fk;
ALTER TABLE IF EXISTS ONLY public.template_stage_configs DROP CONSTRAINT IF EXISTS template_stage_configs_template_id_project_templates_id_fk;
ALTER TABLE IF EXISTS ONLY public.template_questions DROP CONSTRAINT IF EXISTS template_questions_dimension_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_questions DROP CONSTRAINT IF EXISTS template_questions_config_id_template_stage_configs_id_fk;
ALTER TABLE IF EXISTS ONLY public.template_journal_rubrics DROP CONSTRAINT IF EXISTS template_journal_rubrics_dimension_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_journal_rubrics DROP CONSTRAINT IF EXISTS template_journal_rubrics_config_id_template_stage_configs_id_fk;
ALTER TABLE IF EXISTS ONLY public.teacher_feedbacks DROP CONSTRAINT IF EXISTS teacher_feedbacks_teacher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.teacher_feedbacks DROP CONSTRAINT IF EXISTS teacher_feedbacks_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.teacher_feedbacks DROP CONSTRAINT IF EXISTS teacher_feedbacks_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_template_stage_config_id_template_stage_configs_id_;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_target_student_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_submitted_by_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_project_stage_id_project_stages_id_fk;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_project_id_projects_id_fk;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_assessed_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_template_id_project_templates_id_fk;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_teacher_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_class_id_classes_id_fk;
ALTER TABLE IF EXISTS ONLY public.project_templates DROP CONSTRAINT IF EXISTS project_templates_created_by_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.project_stages DROP CONSTRAINT IF EXISTS project_stages_project_id_projects_id_fk;
ALTER TABLE IF EXISTS ONLY public.project_stage_progress DROP CONSTRAINT IF EXISTS project_stage_progress_student_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.project_stage_progress DROP CONSTRAINT IF EXISTS project_stage_progress_project_stage_id_project_stages_id_fk;
ALTER TABLE IF EXISTS ONLY public.project_stage_instruments DROP CONSTRAINT IF EXISTS project_stage_instruments_project_stage_id_project_stages_id_fk;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_project_id_projects_id_fk;
ALTER TABLE IF EXISTS ONLY public.group_members DROP CONSTRAINT IF EXISTS group_members_student_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.group_members DROP CONSTRAINT IF EXISTS group_members_group_id_groups_id_fk;
ALTER TABLE IF EXISTS ONLY public.group_comments DROP CONSTRAINT IF EXISTS group_comments_target_member_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.group_comments DROP CONSTRAINT IF EXISTS group_comments_group_id_groups_id_fk;
ALTER TABLE IF EXISTS ONLY public.group_comments DROP CONSTRAINT IF EXISTS group_comments_author_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.dimensions DROP CONSTRAINT IF EXISTS dimensions_created_by_admin_id_fkey;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS classes_academic_term_id_academic_terms_id_fk;
ALTER TABLE IF EXISTS ONLY public.accounts DROP CONSTRAINT IF EXISTS accounts_user_id_users_id_fk;
DROP INDEX IF EXISTS public.template_stage_configs_template_order_idx;
DROP INDEX IF EXISTS public.teacher_feedbacks_teacher_idx;
DROP INDEX IF EXISTS public.teacher_feedbacks_student_idx;
DROP INDEX IF EXISTS public.teacher_feedbacks_project_idx;
DROP INDEX IF EXISTS public.project_stages_project_order_idx;
DROP INDEX IF EXISTS public.project_stage_progress_student_stage_idx;
DROP INDEX IF EXISTS public.group_comments_idx;
DROP INDEX IF EXISTS public.classes_name_term_idx;
DROP INDEX IF EXISTS public.academic_terms_year_semester_idx;
ALTER TABLE IF EXISTS ONLY public.verifications DROP CONSTRAINT IF EXISTS verifications_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.user_class_assignments DROP CONSTRAINT IF EXISTS user_class_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.template_stage_configs DROP CONSTRAINT IF EXISTS template_stage_configs_pkey;
ALTER TABLE IF EXISTS ONLY public.template_questions DROP CONSTRAINT IF EXISTS template_questions_pkey;
ALTER TABLE IF EXISTS ONLY public.template_journal_rubrics DROP CONSTRAINT IF EXISTS template_journal_rubrics_pkey;
ALTER TABLE IF EXISTS ONLY public.teacher_feedbacks DROP CONSTRAINT IF EXISTS teacher_feedbacks_teacher_student_project_idx;
ALTER TABLE IF EXISTS ONLY public.teacher_feedbacks DROP CONSTRAINT IF EXISTS teacher_feedbacks_pkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_token_unique;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_pkey;
ALTER TABLE IF EXISTS ONLY public.project_templates DROP CONSTRAINT IF EXISTS project_templates_template_name_unique;
ALTER TABLE IF EXISTS ONLY public.project_templates DROP CONSTRAINT IF EXISTS project_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.project_stages DROP CONSTRAINT IF EXISTS project_stages_pkey;
ALTER TABLE IF EXISTS ONLY public.project_stage_progress DROP CONSTRAINT IF EXISTS project_stage_progress_pkey;
ALTER TABLE IF EXISTS ONLY public.project_stage_instruments DROP CONSTRAINT IF EXISTS project_stage_instruments_pkey;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_pkey;
ALTER TABLE IF EXISTS ONLY public.group_members DROP CONSTRAINT IF EXISTS group_members_pkey;
ALTER TABLE IF EXISTS ONLY public.group_comments DROP CONSTRAINT IF EXISTS group_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.dimensions DROP CONSTRAINT IF EXISTS dimensions_pkey;
ALTER TABLE IF EXISTS ONLY public.dimensions DROP CONSTRAINT IF EXISTS dimensions_name_unique;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS classes_pkey;
ALTER TABLE IF EXISTS ONLY public.accounts DROP CONSTRAINT IF EXISTS accounts_pkey;
ALTER TABLE IF EXISTS ONLY public.academic_terms DROP CONSTRAINT IF EXISTS academic_terms_pkey;
ALTER TABLE IF EXISTS ONLY drizzle.__drizzle_migrations DROP CONSTRAINT IF EXISTS __drizzle_migrations_pkey;
ALTER TABLE IF EXISTS drizzle.__drizzle_migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.verifications;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_class_assignments;
DROP TABLE IF EXISTS public.template_stage_configs;
DROP TABLE IF EXISTS public.template_questions;
DROP TABLE IF EXISTS public.template_journal_rubrics;
DROP TABLE IF EXISTS public.teacher_feedbacks;
DROP TABLE IF EXISTS public.submissions;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.project_templates;
DROP TABLE IF EXISTS public.project_stages;
DROP TABLE IF EXISTS public.project_stage_progress;
DROP TABLE IF EXISTS public.project_stage_instruments;
DROP TABLE IF EXISTS public.groups;
DROP TABLE IF EXISTS public.group_members;
DROP TABLE IF EXISTS public.group_comments;
DROP TABLE IF EXISTS public.dimensions;
DROP TABLE IF EXISTS public.classes;
DROP TABLE IF EXISTS public.accounts;
DROP TABLE IF EXISTS public.academic_terms;
DROP SEQUENCE IF EXISTS drizzle.__drizzle_migrations_id_seq;
DROP TABLE IF EXISTS drizzle.__drizzle_migrations;
DROP FUNCTION IF EXISTS public.show_db_tree();
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.term_status;
DROP TYPE IF EXISTS public.stage_progress_status;
DROP TYPE IF EXISTS public.semester;
DROP TYPE IF EXISTS public.project_status;
DROP TYPE IF EXISTS public.instrument_type;
DROP SCHEMA IF EXISTS drizzle;
--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


--
-- Name: instrument_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.instrument_type AS ENUM (
    'JOURNAL',
    'SELF_ASSESSMENT',
    'PEER_ASSESSMENT',
    'OBSERVATION',
    'DAILY_NOTE'
);


--
-- Name: project_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_status AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


--
-- Name: semester; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.semester AS ENUM (
    'ODD',
    'EVEN'
);


--
-- Name: stage_progress_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.stage_progress_status AS ENUM (
    'LOCKED',
    'IN_PROGRESS',
    'COMPLETED'
);


--
-- Name: term_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.term_status AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'ADMIN',
    'TEACHER',
    'STUDENT'
);


--
-- Name: show_db_tree(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.show_db_tree() RETURNS TABLE(tree_structure text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- First show all databases
    RETURN QUERY
    SELECT ':file_folder: ' || datname || ' (DATABASE)'
    FROM pg_database 
    WHERE datistemplate = false;

    -- Then show current database structure
    RETURN QUERY
    WITH RECURSIVE 
    -- Get schemas
    schemas AS (
        SELECT 
            n.nspname AS object_name,
            1 AS level,
            n.nspname AS path,
            'SCHEMA' AS object_type
        FROM pg_namespace n
        WHERE n.nspname NOT LIKE 'pg_%' 
        AND n.nspname != 'information_schema'
    ),

    -- Get all objects (tables, views, functions, etc.)
    objects AS (
        SELECT 
            c.relname AS object_name,
            2 AS level,
            s.path || ' → ' || c.relname AS path,
            CASE c.relkind
                WHEN 'r' THEN 'TABLE'
                WHEN 'v' THEN 'VIEW'
                WHEN 'm' THEN 'MATERIALIZED VIEW'
                WHEN 'i' THEN 'INDEX'
                WHEN 'S' THEN 'SEQUENCE'
                WHEN 'f' THEN 'FOREIGN TABLE'
            END AS object_type
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN schemas s ON n.nspname = s.object_name
        WHERE c.relkind IN ('r','v','m','i','S','f')

        UNION ALL

        SELECT 
            p.proname AS object_name,
            2 AS level,
            s.path || ' → ' || p.proname AS path,
            'FUNCTION' AS object_type
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        JOIN schemas s ON n.nspname = s.object_name
    ),

    -- Combine schemas and objects
    combined AS (
        SELECT * FROM schemas
        UNION ALL
        SELECT * FROM objects
    )

    -- Final output with tree-like formatting
    SELECT 
        REPEAT('    ', level) || 
        CASE 
            WHEN level = 1 THEN '└── :open_file_folder: '
            ELSE '    └── ' || 
                CASE object_type
                    WHEN 'TABLE' THEN ':bar_chart: '
                    WHEN 'VIEW' THEN ':eye: '
                    WHEN 'MATERIALIZED VIEW' THEN ':newspaper: '
                    WHEN 'FUNCTION' THEN ':zap: '
                    WHEN 'INDEX' THEN ':mag: '
                    WHEN 'SEQUENCE' THEN ':1234: '
                    WHEN 'FOREIGN TABLE' THEN ':globe_with_meridians: '
                    ELSE ''
                END
        END || object_name || ' (' || object_type || ')'
    FROM combined
    ORDER BY path;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: academic_terms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.academic_terms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    academic_year character varying(10) NOT NULL,
    semester public.semester NOT NULL,
    status public.term_status DEFAULT 'INACTIVE'::public.term_status NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id text NOT NULL,
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    access_token text,
    refresh_token text,
    id_token text,
    access_token_expires_at timestamp with time zone,
    refresh_token_expires_at timestamp with time zone,
    scope text,
    password text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    academic_term_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: dimensions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dimensions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_by_admin_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: group_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    author_id uuid NOT NULL,
    target_member_id uuid NOT NULL,
    comment text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_members (
    group_id uuid NOT NULL,
    student_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    project_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_stage_instruments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_stage_instruments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_stage_id uuid NOT NULL,
    instrument_type public.instrument_type NOT NULL,
    is_required boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    description text
);


--
-- Name: project_stage_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_stage_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_stage_id uuid NOT NULL,
    student_id uuid NOT NULL,
    status public.stage_progress_status DEFAULT 'LOCKED'::public.stage_progress_status NOT NULL,
    unlocked_at timestamp with time zone,
    completed_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    "order" integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    unlocks_at timestamp with time zone,
    due_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_name character varying(255) NOT NULL,
    description text,
    created_by_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    theme character varying(255),
    class_id uuid NOT NULL,
    teacher_id uuid,
    status public.project_status DEFAULT 'DRAFT'::public.project_status NOT NULL,
    published_at timestamp with time zone,
    archived_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    template_id uuid
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token text NOT NULL,
    user_id uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address text,
    user_agent text
);


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    project_stage_id uuid,
    target_student_id uuid,
    content jsonb NOT NULL,
    score numeric(5,2),
    feedback text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    assessed_by uuid,
    assessed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    template_stage_config_id uuid,
    submitted_by character varying(50) DEFAULT 'STUDENT'::character varying NOT NULL,
    submitted_by_id uuid NOT NULL
);


--
-- Name: teacher_feedbacks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_feedbacks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid NOT NULL,
    student_id uuid NOT NULL,
    project_id uuid NOT NULL,
    feedback text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: template_journal_rubrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.template_journal_rubrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    config_id uuid NOT NULL,
    indicator_text text NOT NULL,
    criteria jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    dimension_id uuid
);


--
-- Name: template_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.template_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    config_id uuid NOT NULL,
    question_text text NOT NULL,
    question_type character varying(50) DEFAULT 'STATEMENT'::character varying NOT NULL,
    scoring_guide text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    rubric_criteria text,
    dimension_id uuid
);


--
-- Name: template_stage_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.template_stage_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    stage_name character varying(255) NOT NULL,
    instrument_type public.instrument_type NOT NULL,
    display_order integer NOT NULL,
    description text,
    estimated_duration character varying(50),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_class_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_class_assignments (
    user_id uuid NOT NULL,
    class_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role public.user_role DEFAULT 'STUDENT'::public.user_role NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    image text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: academic_terms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.academic_terms (id, academic_year, semester, status, starts_at, ends_at, created_at, updated_at) FROM stdin;
34b9690e-588d-4e7d-a5a7-370c420bf626	2026/2027	EVEN	INACTIVE	2025-09-22 00:00:00+00	2025-09-23 00:00:00+00	2025-09-21 03:10:14.714345+00	2025-09-21 03:10:14.714345+00
9f003434-e392-4a28-ab92-ec9a007c9f09	2027/2028	ODD	INACTIVE	2025-09-26 00:00:00+00	2025-09-26 00:00:00+00	2025-09-21 03:10:38.272949+00	2025-09-21 03:10:38.272949+00
2b105788-1350-40b2-8d25-d8423d6929d0	2027/2028	EVEN	INACTIVE	2025-09-30 00:00:00+00	2025-10-16 00:00:00+00	2025-09-21 03:11:04.264694+00	2025-09-21 03:11:04.264694+00
c1daf6f2-610d-4e48-9d73-0ce1baeef091	2028/2029	ODD	INACTIVE	2025-10-29 00:00:00+00	2025-12-04 00:00:00+00	2025-09-21 03:11:26.320531+00	2025-09-21 03:11:26.320531+00
3bc83240-ac6c-4205-8e3a-dbdd44b40674	2027/2029	ODD	INACTIVE	2025-09-28 00:00:00+00	2025-09-30 00:00:00+00	2025-09-28 12:40:18.933662+00	2025-09-28 12:40:18.933662+00
1cea5909-9752-4793-9d27-ba9575b43ac4	2025/2026	EVEN	INACTIVE	2025-09-20 00:00:00+00	2025-09-25 00:00:00+00	2025-09-19 17:41:10.871424+00	2025-09-19 17:41:10.871424+00
424ce85d-f4a5-4026-9ae1-b7fb89ce3d93	2026/2027	ODD	ACTIVE	2025-09-16 00:00:00+00	2025-09-18 00:00:00+00	2025-09-19 18:59:13.523156+00	2025-09-19 18:59:13.523156+00
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounts (id, account_id, provider_id, user_id, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at) FROM stdin;
484b3e32-28e9-4096-a3ba-df15a68929f2	cdebd811-1ce2-46c7-96d0-604db5785205	credential	cdebd811-1ce2-46c7-96d0-604db5785205	\N	\N	\N	\N	\N	\N	06c0a28bfd48b4c41fedd99c1df19064:af1f6aad702ad045a6f30eb7ddd17fb89b1d871a50087a3e9522d08bbccde2f4efb1b95cff74413eeecd8e99ed9327f42d7dcbccece3af4cd2de775fc9267391	2025-09-19 17:30:02.601+00	2025-09-19 17:30:02.601+00
5efe6d89-e056-43f7-94d7-4ea02e3b2a82	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	credential	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	\N	\N	\N	\N	\N	\N	b61cd268d4b81484fb01391ecc36f417:abd587487a8513de9c98ad8290ae9fac37ae0aa9cd60129d7cda635e6b1b8660ea040f6a6ba2783408f848e73cf7e3c1016469d757ec341201b3d8951b3322a3	2025-09-20 08:10:40.028+00	2025-09-20 08:10:40.028+00
41f4a35b-beb6-4309-917b-24c7f96a19d6	7a030f0c-a394-4d95-bf8e-60979d5660e0	credential	7a030f0c-a394-4d95-bf8e-60979d5660e0	\N	\N	\N	\N	\N	\N	25307578934db76609f72d03d2d827e1:752959f78ed280124fc286f20db3e29ecb0326209e9126c78340f3e34f1a887d8a2f818642b9d540a89d75226cd4fb26695c638a5d8ec0ae7863ca1d1c270562	2025-09-21 06:35:35.718+00	2025-09-21 06:35:35.718+00
51f3a659-0b1c-499b-b92f-4935e02a8f71	e0fe36a0-c6eb-48a7-92e0-cb54d59e1cb7	credential	e0fe36a0-c6eb-48a7-92e0-cb54d59e1cb7	\N	\N	\N	\N	\N	\N	e1bc6de4892f710ea7faaa048b887ea7:06beaa270d230d510fdffb5ab99585395ab96cdfd12ba8a601d6f92d8230db9a409c6064b19960950364e6ee92346677a678aa6935b70aa72115be2ff395d99c	2025-09-22 14:52:02.423+00	2025-09-22 14:52:02.423+00
7ffa8fd6-f4ba-47e9-ab2b-b835b2a6c834	ff6d026f-f648-43be-b640-c42e64095ddc	credential	ff6d026f-f648-43be-b640-c42e64095ddc	\N	\N	\N	\N	\N	\N	b8f66d1ace033e4ac62ce31a41526862:b54053cff8655378ee9cec5f4e9425e9692ad1d772dbe37240a69a94047747e42b6522325031b45978a2dc10af811c674c7c848ebacc37c5265caecf68fa6e34	2025-09-22 14:59:53.318+00	2025-09-22 14:59:53.318+00
7df98190-8a69-4b04-9cc4-44ccc6a078cf	aldi@siswa.sch.id	credential	a1000001-0000-0000-0000-000000000001	\N	\N	\N	\N	\N	\N	f839df370675cf20be11b7129c787551:f8f904ef2f16c96df447991bcd15e8f231e64fce023d0296cf0d8bf459c5f0e5e05533e425c0e7d6e8eeb092026e3b79c54e7348bf350231df5d4e1cf729fe67	2026-05-07 18:01:31.984487+00	2026-05-07 18:01:31.984487+00
d7cbc53a-a700-4f83-9236-5b99be3c7023	budi@siswa.sch.id	credential	a1000001-0000-0000-0000-000000000002	\N	\N	\N	\N	\N	\N	a64fd0a963aa97debae46c28dcb7855d:92c17ed62b1b3d305069037a8802be6cf00ecdeac81a224c621de35322b4b575a4c059487321898740c4d6d7a47eeb83cd68abe43b2fc6eed6833ebb226f772c	2026-05-07 18:01:31.984487+00	2026-05-07 18:01:31.984487+00
236a70a0-f081-4137-b77e-3b87b31a94f2	citra@siswa.sch.id	credential	a1000001-0000-0000-0000-000000000003	\N	\N	\N	\N	\N	\N	c2d80fb185d57c5a7cbfb7d46407c226:7582c667df7cd4953481a1d454ee935a38ef2d476bf138730d69c0da98ccfee7eb3dcd466d9bfeb06808c3cc7d378792f0fcd15a48c1d30d98c0d3d31b83609d	2026-05-07 18:01:31.984487+00	2026-05-07 18:01:31.984487+00
ca222659-b86c-45f8-92ac-94bd637cc35c	dina@siswa.sch.id	credential	a1000001-0000-0000-0000-000000000004	\N	\N	\N	\N	\N	\N	3c31c98090bde3b9278b5b65ba3fc822:57ed593e07d555792c038857e98ee1f8f11a8551ebf9b6e12a1702187dc10161dffd09bacf5d6b719ece260991f8ed06164678adf50283b43e1429ca2866a33f	2026-05-07 18:01:31.984487+00	2026-05-07 18:01:31.984487+00
ef8f17cd-de54-46bb-bf8b-dd4b6f4824bf	eko@siswa.sch.id	credential	a1000001-0000-0000-0000-000000000005	\N	\N	\N	\N	\N	\N	d90df2b96a5901d9c6fdf236477660bd:b06b37d0b3ce922101a754e98e249bdd0e1f407db9c87b110d2bf8bd7e1cc7ea3b4c7ddd32be4f347b0a937157c513c0ff05c561b165f4de04ad3095d95ea84f	2026-05-07 18:01:31.984487+00	2026-05-07 18:01:31.984487+00
38aca06f-2a3d-4b9c-b406-c22d115831a0	farah@siswa.sch.id	credential	a1000001-0000-0000-0000-000000000006	\N	\N	\N	\N	\N	\N	bc88425e62e9383a1903be5e061c5ee2:743bc0f1317b47dbb5628302cc63ec4c19cf723f35175a9aa1b939b92a2daeb90d09ea296db60d226c165c585fc9077b1cf3b754bb1b63e1d4c6be0d2c19aff7	2026-05-07 18:01:31.984487+00	2026-05-07 18:01:31.984487+00
7b5c0542-a999-4c83-a2e6-7b9f3e57c241	gilang@siswa.sch.id	credential	a1000001-0000-0000-0000-000000000007	\N	\N	\N	\N	\N	\N	63d58aae5153f968699fa78d65f250dc:2dfeb5823eb3348a0a7433aa9212e7976e4aa36e0120a543c3b943cd47b95035346536cb32ecf96278567c32db52daafba4f475ffdc5ab642efa60738f2c5706	2026-05-07 18:01:31.984487+00	2026-05-07 18:01:31.984487+00
78ade505-9c28-4706-961f-78b358fdf7b6	hana@siswa.sch.id	credential	a1000001-0000-0000-0000-000000000008	\N	\N	\N	\N	\N	\N	1cb07995b5dbdf079c4816c546462fb3:490ba3507dfb2b429a6155c3a29fa01c31110ae540163bf1e52e978e6e877a62ecf7f414f170870f278c7c5add930b2863b4316eb7048ba80610015a5e535df9	2026-05-07 18:01:31.984487+00	2026-05-07 18:01:31.984487+00
3ef63705-77de-4695-816c-7b93ada60085	irfan@siswa.sch.id	credential	a1000001-0000-0000-0000-000000000009	\N	\N	\N	\N	\N	\N	4fcf7826f07d58abc73cde3907e4c0d6:9d73880ac38bbc3c57f0e997c94e0db9611566ccfc200cc5bb12b5c02622ece5d1f98835e82d0f244010dc0e3897ca517076f8c3a0c8b52a88a596e1b8a19608	2026-05-07 18:01:31.984487+00	2026-05-07 18:01:31.984487+00
9e0e1ba5-08ad-4ac7-8bcd-ca4e70bdf46a	jasmine@siswa.sch.id	credential	a1000001-0000-0000-0000-000000000010	\N	\N	\N	\N	\N	\N	b181ce30ac7d9519b54244c1cb67a97a:08d33304b48dce800bd9f1cbd336f9555da86412a147da9fb10bf61d18bc0234c236dcb9684869e9ef0ea8a87501404ce8794f7fc1e3ca9d5302fd7cbaf550e4	2026-05-07 18:01:31.984487+00	2026-05-07 18:01:31.984487+00
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.classes (id, name, academic_term_id, created_at, updated_at) FROM stdin;
3e96522e-34ba-4537-bad6-280219c4d778	Emina 2	424ce85d-f4a5-4026-9ae1-b7fb89ce3d93	2025-09-21 04:17:08.977194+00	2025-09-21 04:17:08.977194+00
82913766-f21a-44a9-a4b0-b392ac2aee53	IPAS 1	3bc83240-ac6c-4205-8e3a-dbdd44b40674	2025-09-28 12:42:28.984883+00	2025-09-28 12:42:28.984883+00
\.


--
-- Data for Name: dimensions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dimensions (id, name, description, created_by_admin_id, created_at, updated_at) FROM stdin;
e0ba6943-f5e5-4532-99a2-d38686511d52	Kolaborasi	Kemampuan bekerja sama secara efektif dalam tim dan berkontribusi pada tujuan bersama	\N	2025-10-04 14:32:22.691409+00	2025-10-04 14:32:22.691409+00
088a1baa-1614-4f5a-acc4-769d4046b57f	Keimanan dan ketakwaan terhadap Tuhan Yang Maha Esa \r\n	Keimanan dan ketakwaan terhadap Tuhan Yang Maha Esa \n	\N	2025-10-04 14:32:22.691409+00	2025-10-04 14:32:22.691409+00
7f4e9777-eee0-4f28-9718-97d592c4d097	Penalaran kritis\n\n	Penalaran kritis	\N	2025-10-04 14:32:22.691409+00	2025-10-04 14:32:22.691409+00
c1ff32f1-1b06-43b1-a51f-c41e8393a543	Komunikasi	Komunikasi untuk mencapai tujuan bersama\n	\N	2025-10-04 14:32:22.691409+00	2025-10-04 14:32:22.691409+00
a35fb937-753b-4cc0-831d-8db0ee76cbfc	Kemandirian	Menunjukkan inisiatif\nMelakukan refleksi diri\nMenentapkan pengembangan diri\n	\N	2025-10-04 14:32:22.691409+00	2025-10-04 14:32:22.691409+00
d6db1aca-7539-4c13-88d3-e5c4d1ebda49	Kreativitas	Menghasilkan gagasan orisinal\nKeluwesan berpikir dalam mencari alternatif solusi\n	\N	2025-10-04 14:32:22.691409+00	2025-10-04 14:32:22.691409+00
\.


--
-- Data for Name: group_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_comments (id, group_id, author_id, target_member_id, comment, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: group_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_members (group_id, student_id, joined_at, updated_at) FROM stdin;
d4000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000001	2026-05-07 16:59:16.321066+00	\N
d4000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000002	2026-05-07 16:59:16.321066+00	\N
d4000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000003	2026-05-07 16:59:16.321066+00	\N
d4000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000004	2026-05-07 16:59:16.321066+00	\N
d4000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000005	2026-05-07 16:59:16.321066+00	\N
d4000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000006	2026-05-07 16:59:16.321066+00	\N
d4000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000007	2026-05-07 16:59:16.321066+00	\N
d4000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000008	2026-05-07 16:59:16.321066+00	\N
d4000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000009	2026-05-07 16:59:16.321066+00	\N
d4000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000010	2026-05-07 16:59:16.321066+00	\N
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.groups (id, name, project_id, created_at, updated_at) FROM stdin;
d4000001-0000-0000-0000-000000000001	Kelompok Sereh	b2000001-0000-0000-0000-000000000001	2026-05-07 16:59:16.321066+00	2026-05-07 16:59:16.321066+00
d4000001-0000-0000-0000-000000000002	Kelompok Lavender	b2000001-0000-0000-0000-000000000001	2026-05-07 16:59:16.321066+00	2026-05-07 16:59:16.321066+00
\.


--
-- Data for Name: project_stage_instruments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_stage_instruments (id, project_stage_id, instrument_type, is_required, created_at, updated_at, description) FROM stdin;
\.


--
-- Data for Name: project_stage_progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_stage_progress (id, project_stage_id, student_id, status, unlocked_at, completed_at, updated_at) FROM stdin;
68ab4f4b-7c30-4adc-ab16-5f8886b13755	c3000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000001	COMPLETED	2026-04-07 16:19:35.191663+00	2026-04-12 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
3f1e9fce-b8f9-4a73-969a-532e36c47bc7	c3000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000002	COMPLETED	2026-04-07 16:19:35.191663+00	2026-04-12 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
1eeaf82f-39fb-4e57-ace4-58c21c2ff748	c3000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000003	COMPLETED	2026-04-07 16:19:35.191663+00	2026-04-12 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
b637d16b-c527-44b4-9dc6-bf2b6f96e7ce	c3000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000004	COMPLETED	2026-04-07 16:19:35.191663+00	2026-04-12 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
2a4e852f-b803-41e7-aa03-63e09e4f2a0d	c3000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000005	COMPLETED	2026-04-07 16:19:35.191663+00	2026-04-12 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
06057178-7cfd-4698-8eea-4721cd03ecee	c3000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000006	COMPLETED	2026-04-07 16:19:35.191663+00	2026-04-12 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
9cfcf0be-2ff7-4f00-b96c-cbd937fa33c4	c3000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000007	COMPLETED	2026-04-07 16:19:35.191663+00	2026-04-12 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
488a8703-d0d0-49bd-8bfd-6d1c12eaac9d	c3000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000008	COMPLETED	2026-04-07 16:19:35.191663+00	2026-04-12 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
fad3a263-13e7-41df-b0f0-7a0c72d348ca	c3000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000009	COMPLETED	2026-04-07 16:19:35.191663+00	2026-04-12 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
78bf1518-42a5-457d-8cb2-998d131b6bfd	c3000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000010	COMPLETED	2026-04-07 16:19:35.191663+00	2026-04-12 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
01858305-bf39-4db8-b661-1c4ba6072672	c3000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000001	COMPLETED	2026-04-12 16:19:35.191663+00	2026-04-19 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
d9ea21ad-5763-406b-bfae-a0bf127f03f1	c3000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000002	COMPLETED	2026-04-12 16:19:35.191663+00	2026-04-19 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
552ed7a0-f095-4b0d-ae0d-ad27c3eb0c0d	c3000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000003	COMPLETED	2026-04-12 16:19:35.191663+00	2026-04-19 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
e5de6225-1f18-445d-ae93-219930135ff5	c3000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000004	COMPLETED	2026-04-12 16:19:35.191663+00	2026-04-19 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
b36ff9a3-9b4c-4b1e-bea8-7df1ac6b8aa7	c3000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000005	COMPLETED	2026-04-12 16:19:35.191663+00	2026-04-19 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
0b18c682-16e9-4e84-92d5-ab4fe2a3bdbd	c3000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000006	COMPLETED	2026-04-12 16:19:35.191663+00	2026-04-19 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
2225d49e-0578-4fd2-8e3d-675dc94d1b0a	c3000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000007	COMPLETED	2026-04-12 16:19:35.191663+00	2026-04-19 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
b1fb5787-dac7-462e-8572-b4847ad71866	c3000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000008	COMPLETED	2026-04-12 16:19:35.191663+00	2026-04-19 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
c717716f-519f-49da-b382-d8cdb10322b3	c3000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000009	COMPLETED	2026-04-12 16:19:35.191663+00	2026-04-19 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
a203b514-70fa-428e-b552-06d1d06165c6	c3000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000010	COMPLETED	2026-04-12 16:19:35.191663+00	2026-04-19 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
abf7473a-16f3-4c26-91ab-2724493f86c4	c3000001-0000-0000-0000-000000000003	a1000001-0000-0000-0000-000000000001	COMPLETED	2026-04-19 16:19:35.191663+00	2026-04-25 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
869f8657-a2b3-4ffb-ac12-c2bdb0893966	c3000001-0000-0000-0000-000000000003	a1000001-0000-0000-0000-000000000002	COMPLETED	2026-04-19 16:19:35.191663+00	2026-04-25 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
13e9001b-9873-4435-b835-10f2cc30807d	c3000001-0000-0000-0000-000000000003	a1000001-0000-0000-0000-000000000003	COMPLETED	2026-04-19 16:19:35.191663+00	2026-04-25 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
537599a9-5c10-44f1-9a51-90cf8f3d42f8	c3000001-0000-0000-0000-000000000003	a1000001-0000-0000-0000-000000000004	COMPLETED	2026-04-19 16:19:35.191663+00	2026-04-25 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
451ac59c-0175-45b4-8ef9-e7b5fbf9f1e5	c3000001-0000-0000-0000-000000000003	a1000001-0000-0000-0000-000000000005	COMPLETED	2026-04-19 16:19:35.191663+00	2026-04-25 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
3cea0c8d-3991-4542-8db8-7dbc96d83aee	c3000001-0000-0000-0000-000000000003	a1000001-0000-0000-0000-000000000006	COMPLETED	2026-04-19 16:19:35.191663+00	2026-04-25 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
ca5a90dd-2e18-48f8-93ea-89da7196aa12	c3000001-0000-0000-0000-000000000003	a1000001-0000-0000-0000-000000000007	COMPLETED	2026-04-19 16:19:35.191663+00	2026-04-25 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
7f9b5b84-3bb5-4a92-a93e-89969f6c3e36	c3000001-0000-0000-0000-000000000003	a1000001-0000-0000-0000-000000000008	COMPLETED	2026-04-19 16:19:35.191663+00	2026-04-25 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
b256414d-01d1-4b3a-8a55-b6bbaf27cd3d	c3000001-0000-0000-0000-000000000003	a1000001-0000-0000-0000-000000000009	COMPLETED	2026-04-19 16:19:35.191663+00	2026-04-25 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
0cb193a2-a066-4f0e-ab83-1f1508589f0f	c3000001-0000-0000-0000-000000000003	a1000001-0000-0000-0000-000000000010	COMPLETED	2026-04-19 16:19:35.191663+00	2026-04-25 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
dad33dde-087c-4bf1-93c5-a0fb9660f76f	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000001	COMPLETED	2026-04-25 16:19:35.191663+00	2026-05-02 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
7df55d27-ab3f-4510-956c-d778c6cab8d2	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000002	COMPLETED	2026-04-25 16:19:35.191663+00	2026-05-02 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
e7ad1004-7190-4093-a945-845de858c3aa	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000003	COMPLETED	2026-04-25 16:19:35.191663+00	2026-05-02 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
04595430-3fe7-42e0-a34e-7cfe418f0699	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000004	COMPLETED	2026-04-25 16:19:35.191663+00	2026-05-02 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
207a5211-d214-4487-a548-8ea61395ce76	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000005	COMPLETED	2026-04-25 16:19:35.191663+00	2026-05-02 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
b9409eaa-fe9d-448e-9e42-d9a653f50cbd	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000006	COMPLETED	2026-04-25 16:19:35.191663+00	2026-05-02 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
68eee39a-dbec-4569-97ff-2d4425ceb12a	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000007	COMPLETED	2026-04-25 16:19:35.191663+00	2026-05-02 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
7bcf771d-5641-41a8-ae63-bc3f373dc016	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000008	COMPLETED	2026-04-25 16:19:35.191663+00	2026-05-02 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
835581f7-c0a5-4a28-b2a9-98856201fddd	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000009	COMPLETED	2026-04-25 16:19:35.191663+00	2026-05-02 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
82f4faee-4ec9-461e-bbbe-ceb0f737cdd1	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000010	COMPLETED	2026-04-25 16:19:35.191663+00	2026-05-02 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
e6eba07e-f36d-4a10-8634-8f679293d7f9	c3000001-0000-0000-0000-000000000005	a1000001-0000-0000-0000-000000000001	COMPLETED	2026-05-02 16:19:35.191663+00	2026-05-05 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
31a07b8f-0baa-4f14-b5f3-393e13eff411	c3000001-0000-0000-0000-000000000005	a1000001-0000-0000-0000-000000000002	COMPLETED	2026-05-02 16:19:35.191663+00	2026-05-05 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
4ca0c8d9-a33e-47b8-829d-41a8f92d9600	c3000001-0000-0000-0000-000000000005	a1000001-0000-0000-0000-000000000003	COMPLETED	2026-05-02 16:19:35.191663+00	2026-05-05 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
988de18e-14e0-4c0d-97cb-3cd0ab9dc508	c3000001-0000-0000-0000-000000000005	a1000001-0000-0000-0000-000000000004	COMPLETED	2026-05-02 16:19:35.191663+00	2026-05-05 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
e536c673-6d17-4a26-8427-7f3baff806ee	c3000001-0000-0000-0000-000000000005	a1000001-0000-0000-0000-000000000005	COMPLETED	2026-05-02 16:19:35.191663+00	2026-05-05 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
a02c4b50-0c8d-4184-8961-b34fc40a426b	c3000001-0000-0000-0000-000000000005	a1000001-0000-0000-0000-000000000006	COMPLETED	2026-05-02 16:19:35.191663+00	2026-05-05 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
03d4e2cb-fddf-4200-9ecf-7328f6df507c	c3000001-0000-0000-0000-000000000005	a1000001-0000-0000-0000-000000000007	COMPLETED	2026-05-02 16:19:35.191663+00	2026-05-05 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
3d8d662f-4bf8-4aee-b0a6-42f5e1ec29c6	c3000001-0000-0000-0000-000000000005	a1000001-0000-0000-0000-000000000008	COMPLETED	2026-05-02 16:19:35.191663+00	2026-05-05 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
3860e44e-cf61-427b-9378-31355d5aad2f	c3000001-0000-0000-0000-000000000005	a1000001-0000-0000-0000-000000000009	COMPLETED	2026-05-02 16:19:35.191663+00	2026-05-05 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
8dbf93f9-1897-40bc-915b-e3b905a78391	c3000001-0000-0000-0000-000000000005	a1000001-0000-0000-0000-000000000010	COMPLETED	2026-05-02 16:19:35.191663+00	2026-05-05 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
91be16a1-2ffb-4496-9d9f-7f8258b8c508	c3000001-0000-0000-0000-000000000006	a1000001-0000-0000-0000-000000000001	COMPLETED	2026-05-05 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
b75f36ea-2911-491d-9d8f-37a82f8fc7a6	c3000001-0000-0000-0000-000000000006	a1000001-0000-0000-0000-000000000002	COMPLETED	2026-05-05 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
51627743-bf3f-4fb9-95e4-e06de9defd3a	c3000001-0000-0000-0000-000000000006	a1000001-0000-0000-0000-000000000003	COMPLETED	2026-05-05 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
032bb7dc-35c9-4ef4-a2a1-262f1ffc2281	c3000001-0000-0000-0000-000000000006	a1000001-0000-0000-0000-000000000004	COMPLETED	2026-05-05 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
fd484894-f8fd-4877-b4c3-ed35a65b9706	c3000001-0000-0000-0000-000000000006	a1000001-0000-0000-0000-000000000005	COMPLETED	2026-05-05 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
68313bb7-a7a4-45a6-9519-ef9ff0ec15a8	c3000001-0000-0000-0000-000000000006	a1000001-0000-0000-0000-000000000006	COMPLETED	2026-05-05 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
99ee5255-0fa6-43bd-8425-4a03469abd3b	c3000001-0000-0000-0000-000000000006	a1000001-0000-0000-0000-000000000007	COMPLETED	2026-05-05 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
2b47d9c4-ccd9-4ee4-99a1-8f1e39b8cfaf	c3000001-0000-0000-0000-000000000006	a1000001-0000-0000-0000-000000000008	COMPLETED	2026-05-05 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
418d4eca-aaf6-41fc-bac1-b13b53db1cb3	c3000001-0000-0000-0000-000000000006	a1000001-0000-0000-0000-000000000009	COMPLETED	2026-05-05 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
5e2851c6-efda-4d01-8d31-d9bc56b42e9f	c3000001-0000-0000-0000-000000000006	a1000001-0000-0000-0000-000000000010	COMPLETED	2026-05-05 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:20:43.641594+00
\.


--
-- Data for Name: project_stages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_stages (id, project_id, "order", name, description, unlocks_at, due_at, created_at, updated_at) FROM stdin;
c3000001-0000-0000-0000-000000000001	b2000001-0000-0000-0000-000000000001	1	Start with the essential question	Mulailah dengan rasa ingin tahu. Pahami masalah utama yang akan dipecahkan dalam proyek ini.	2026-04-07 16:19:35.191663+00	2026-04-12 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:19:35.191663+00
c3000001-0000-0000-0000-000000000002	b2000001-0000-0000-0000-000000000001	2	Design a plan for the project	Waktunya berkolaborasi menyusun rencana aktivitas, strategi, menentukan sumber daya, dan membagi tugas secara adil.	2026-04-12 16:19:35.191663+00	2026-04-19 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:19:35.191663+00
c3000001-0000-0000-0000-000000000003	b2000001-0000-0000-0000-000000000001	3	Create a schedule	Buat garis waktu yang jelas dari awal hingga proyek selesai agar proyek lebih terarah.	2026-04-19 16:19:35.191663+00	2026-04-25 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:19:35.191663+00
c3000001-0000-0000-0000-000000000004	b2000001-0000-0000-0000-000000000001	4	Monitor the students and the progress of the project	Eksekusi rencana proyek, jangan ragu untuk meminta masukan dari guru atau teman sebayamu.	2026-04-25 16:19:35.191663+00	2026-05-02 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:19:35.191663+00
c3000001-0000-0000-0000-000000000005	b2000001-0000-0000-0000-000000000001	5	Assess the output	Waktunya menganalisis produk yang telah dihasilkan.	2026-05-02 16:19:35.191663+00	2026-05-05 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:19:35.191663+00
c3000001-0000-0000-0000-000000000006	b2000001-0000-0000-0000-000000000001	6	Evaluate the experiences	Proyek telah selesai, kini saatnya merefleksikan seluruh proses yang telah dilalui.	2026-05-05 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	2026-05-07 16:19:35.191663+00
\.


--
-- Data for Name: project_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_templates (id, template_name, description, created_by_id, is_active, created_at, updated_at) FROM stdin;
1a961b4a-f120-4391-b4d8-b08eb3e92b21	Default	-	\N	t	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, title, description, theme, class_id, teacher_id, status, published_at, archived_at, created_at, updated_at, template_id) FROM stdin;
b2000001-0000-0000-0000-000000000001	Produk Minyak Atsiri	Proyek pembuatan produk berbasis minyak atsiri dari bahan alam lokal	Kewirausahaan & Lingkungan	3e96522e-34ba-4537-bad6-280219c4d778	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	PUBLISHED	2026-05-07 16:19:35.191663+00	\N	2026-05-07 16:19:35.191663+00	2026-05-07 16:19:35.191663+00	1a961b4a-f120-4391-b4d8-b08eb3e92b21
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, token, user_id, expires_at, created_at, updated_at, ip_address, user_agent) FROM stdin;
69728146-f853-41fe-9106-0e8d85a39c5f	Bgvz2QS4PYheHfBMe72QDE5foc3QUFIk	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-15 15:03:00.027+00	2025-10-08 15:03:00.032+00	2025-10-08 15:03:00.032+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
e4a56801-0aa6-4328-bdd9-36cabac09a92	EJxGOmYkBCcMl6jpIIUGvTfswyTBpTRW	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-01 00:51:03.322+00	2025-09-24 00:51:03.324+00	2025-09-24 00:51:03.325+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
e06e6fac-9492-4da9-827e-644d6e4b89bf	kWUi40X7yA5oso6BAWt4NpTYdypjECWD	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-09-27 08:10:40.101+00	2025-09-20 08:10:40.102+00	2025-09-20 08:10:40.102+00		
1ae06cbd-2e68-4e25-832f-64683b7ce90d	fXcHhtcLH3EqZRLErLpkhbxouXpodBmS	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-16 03:52:57.064+00	2025-10-09 03:52:57.064+00	2025-10-09 03:52:57.064+00	103.95.6.163	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
23a435d8-e849-46a7-a2c2-c74f6be35e21	2NVjPDmdhUUzoR3N46JLAf8enVP8bPPt	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-16 04:02:08.567+00	2025-10-09 04:02:08.568+00	2025-10-09 04:02:08.568+00	114.10.150.104	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
40a5830d-f732-4518-ad6d-4aef7a087edc	s0HpkgsnE5h9OCbl2IzprC8HiCYKN7M5	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-16 04:03:59.605+00	2025-10-09 04:03:59.606+00	2025-10-09 04:03:59.606+00	114.10.150.104	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
78502872-0ade-4ee5-bb5b-b76da8c38d9a	qu5cyFuqj0YlR0J7oR8AazKv1OcaWl6y	7a030f0c-a394-4d95-bf8e-60979d5660e0	2025-09-28 06:35:35.782+00	2025-09-21 06:35:35.783+00	2025-09-21 06:35:35.783+00		
9fcb1c29-c1c3-4e96-a82a-3e813181ccbb	JWLhMVQVuwc1HFViSbbM5tjkZMZJp51P	ff6d026f-f648-43be-b640-c42e64095ddc	2025-09-29 14:59:53.417+00	2025-09-22 14:59:53.418+00	2025-09-22 14:59:53.418+00		
c3ece56d-9c11-4e4d-b630-18cfa0a59021	RL2WNy4CkAEWDzjM2EH4aFNIMz3imMT3	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-04 10:16:16.979+00	2025-09-23 17:48:39.2+00	2025-09-27 10:16:16.979+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
51177cb2-a635-4622-aafc-6561e96397e6	XL95afFWcjxhJ7FuQJx68wBbsQr5e9TZ	cdebd811-1ce2-46c7-96d0-604db5785205	2025-09-29 16:19:03.376+00	2025-09-22 16:19:03.381+00	2025-09-22 16:19:03.381+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
9ef4e75a-f1a2-4839-8009-da05ca67dbc7	yeadP5c5j70YFlD2iUccgriK9jKkMFAO	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-05 11:09:21.96+00	2025-09-27 10:05:34.71+00	2025-09-28 11:09:21.96+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
11df8277-d4a4-4096-bd2c-92f412e4f736	pD67A1sAHcaeTtrNwXzD6RyG7Mhzs4We	cdebd811-1ce2-46c7-96d0-604db5785205	2025-10-05 11:10:19.343+00	2025-09-27 10:34:18.527+00	2025-09-28 11:10:19.343+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
52b5184b-a596-4d06-bc42-40b4eb14f793	PV4b3bXRnNjLCdm4eHtbmsfvuqs62rhW	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-05 13:07:33.605+00	2025-09-28 13:07:33.606+00	2025-09-28 13:07:33.606+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
e9223f6d-9f40-4c75-b558-209de072b992	mN6ChYAkyRbgteaYupppJv2b2gBQzht0	cdebd811-1ce2-46c7-96d0-604db5785205	2025-10-06 15:07:48.296+00	2025-09-29 15:07:48.297+00	2025-09-29 15:07:48.297+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
75beee2d-9e87-449c-b79a-adba772ec62c	lrioETR37VlaI4HCU4apjbmFbfYlSmN3	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-09-29 18:44:46.306+00	2025-09-22 18:44:46.306+00	2025-09-22 18:44:46.306+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
5e8f6aee-1119-41f3-82e1-5ec90b65ea51	gSF4Nt7Sl3uzDlbbRt401Zxu8D1gpyZ6	e0fe36a0-c6eb-48a7-92e0-cb54d59e1cb7	2025-09-30 10:40:05.195+00	2025-09-23 10:40:05.195+00	2025-09-23 10:40:05.195+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
ecd07031-c206-433a-8fd7-23c7bac5a5da	eli3bSQ487i8PdJLQmqQft8BsmwbVIj0	cdebd811-1ce2-46c7-96d0-604db5785205	2025-10-13 14:08:21.542+00	2025-10-05 13:08:12.136+00	2025-10-06 14:08:21.542+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
329b91ff-ff61-4f11-be33-4f90f2d4ddcd	qvoFV3mgcfyoMiipkpNkBVCKhbgfm2TO	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-14 04:00:29.55+00	2025-10-07 04:00:29.551+00	2025-10-07 04:00:29.551+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
0ead53e3-0d82-4afa-8c0d-32c4143f284a	Kh2VpmO4MlbVNeHnvhT1BFKKv4CRu4dI	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-14 14:32:56.482+00	2025-10-07 14:32:56.483+00	2025-10-07 14:32:56.483+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
072159ee-a421-4286-a9a3-1a25339ff790	Hp79VFrJMbJZ4RUccP2Cmo017yisv5hF	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-16 04:02:43.409+00	2025-10-09 04:02:43.409+00	2025-10-09 04:02:43.409+00	103.95.6.163	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1
1c13a3fa-587d-4181-9352-b90af82922b5	5vz8cKSshrEFdKWZFYRlg239cOAUHSHb	cdebd811-1ce2-46c7-96d0-604db5785205	2025-10-27 00:14:46.857+00	2025-10-20 00:14:46.859+00	2025-10-20 00:14:46.859+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
675ed983-2657-4e3f-b90d-23ecce0e00f3	Iv2tGKiwhQqNMzNkZlXCpcnNhOcwOJBg	cdebd811-1ce2-46c7-96d0-604db5785205	2026-05-14 15:11:45.134+00	2026-05-07 15:11:45.135+00	2026-05-07 15:11:45.135+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
108335b1-8d20-43a5-b614-c1b940880b34	3ys2oCQWdfoBXxCCUkrLF06TkFl0s3ew	cdebd811-1ce2-46c7-96d0-604db5785205	2026-05-17 11:07:43.759+00	2026-05-10 11:07:43.759+00	2026-05-10 11:07:43.759+00	114.124.174.173	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submissions (id, project_id, project_stage_id, target_student_id, content, score, feedback, submitted_at, assessed_by, assessed_at, created_at, updated_at, template_stage_config_id, submitted_by, submitted_by_id) FROM stdin;
e5010001-0000-0000-0000-000000000001	b2000001-0000-0000-0000-000000000001	c3000001-0000-0000-0000-000000000001	a1000001-0000-0000-0000-000000000001	{"fa8f9632-5ee0-4b9b-969e-01bf4a54b2f7": "Mengapa minyak atsiri dari tanaman lokal belum banyak dimanfaatkan secara optimal? Bagaimana cara mengolahnya agar bernilai jual tinggi? Pertanyaan ini penting karena bisa membuka peluang usaha bagi masyarakat sekitar sekolah kami."}	\N	\N	2025-10-01 08:00:00+00	\N	\N	2026-05-07 16:30:32.64041+00	2026-05-07 16:30:32.64041+00	790ddfc1-9fce-420b-a7ef-77136652865b	STUDENT	a1000001-0000-0000-0000-000000000001
e5010002-0000-0000-0000-000000000001	b2000001-0000-0000-0000-000000000001	c3000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000001	{"01ca8a9b-42ae-4921-94a1-553ee32a425e": 3, "282088ad-2731-4a5e-97ec-9cadea63b452": 3, "2fa1bac3-6c37-4934-aaa0-c8b70b687605": 3, "4fa24d37-7e5c-4513-8b4d-c308a190938b": 4, "5beb7380-dddf-47e6-ad91-1d5752c608f7": 4, "62a3554f-2a05-4cd6-be3a-f485949cd92f": 4, "82ef60e3-5101-4e06-a96e-92f2283f2eaf": 4, "bfdf93be-02c1-4218-895b-0f249e10f498": 3}	\N	\N	2025-10-06 08:00:00+00	\N	\N	2026-05-07 16:30:32.64041+00	2026-05-07 16:30:32.64041+00	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	STUDENT	a1000001-0000-0000-0000-000000000001
e5010002-0000-0000-0000-000000000002	b2000001-0000-0000-0000-000000000001	c3000001-0000-0000-0000-000000000002	a1000001-0000-0000-0000-000000000002	{"2ed041d4-c410-4055-aaef-38bf953deb6a": 3, "3be75cfc-e318-4dfd-aef9-1fd7f9e5136b": 4}	\N	\N	2025-10-06 08:30:00+00	\N	\N	2026-05-07 16:30:32.64041+00	2026-05-07 16:30:32.64041+00	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	STUDENT	a1000001-0000-0000-0000-000000000001
e5010003-0000-0000-0000-000000000001	b2000001-0000-0000-0000-000000000001	c3000001-0000-0000-0000-000000000003	a1000001-0000-0000-0000-000000000001	{"3fec942c-59cd-4d6d-9d1e-a68b6ada731a": 3, "5a90f1a4-00aa-4a37-9dfa-628e59db4315": 4, "93852818-467c-41c3-b79a-32c89af8273e": 4, "b4439e44-8041-4b00-8ba6-776d6ec6b97f": 4}	\N	\N	2025-10-12 08:00:00+00	\N	\N	2026-05-07 16:30:32.64041+00	2026-05-07 16:30:32.64041+00	6241ccf2-8589-4be3-9a18-f6ea3f174ddd	STUDENT	a1000001-0000-0000-0000-000000000001
e5010003-0000-0000-0000-000000000002	b2000001-0000-0000-0000-000000000001	c3000001-0000-0000-0000-000000000003	a1000001-0000-0000-0000-000000000002	{"6b4a2e46-01de-4d78-942d-217643d96135": 4}	\N	\N	2025-10-12 08:30:00+00	\N	\N	2026-05-07 16:30:32.64041+00	2026-05-07 16:30:32.64041+00	b96f81dc-f8ac-42db-ab36-2dea79e6e780	STUDENT	a1000001-0000-0000-0000-000000000001
e5010004-0000-0000-0000-000000000001	b2000001-0000-0000-0000-000000000001	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000001	{"1d27f1aa-a00e-481a-af7f-1b79c56b3bf0": 4, "32459ca3-064b-46e4-a8f2-5616e7ee3b2c": 3, "38116f7a-1851-4d08-992d-b9d87c97b07d": 4, "71a5a50a-29cb-42ae-9770-ff0d3a03cdad": 3, "8933921d-8ba0-472f-aa66-a833ec033507": 4, "c51da34e-b2b5-4037-9bd0-c285e1f983e7": 3, "e7a3a6a2-2f3a-48d0-aaae-8742683b91fc": 4, "fec13908-8cbc-42e3-ae85-c0a34f7ac133": 4}	\N	\N	2025-10-19 08:00:00+00	\N	\N	2026-05-07 16:30:32.64041+00	2026-05-07 16:30:32.64041+00	d14942a4-50b1-4451-9c14-d8b828ef58f1	STUDENT	a1000001-0000-0000-0000-000000000001
e5010004-0000-0000-0000-000000000002	b2000001-0000-0000-0000-000000000001	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000001	{"66674b48-046d-45fc-be86-fa2c8d1b1f04": "Saat menggunakan sereh dan daun pandan dari kebun sekolah, saya benar-benar merasa bersyukur. Tuhan menciptakan alam dengan begitu sempurna sehingga tanaman sederhana pun bisa menghasilkan sesuatu yang bermanfaat. Saya juga menyadari bahwa kita punya tanggung jawab untuk tidak merusak alam, karena alam adalah sumber kehidupan kita."}	\N	\N	2025-10-19 09:00:00+00	\N	\N	2026-05-07 16:30:32.64041+00	2026-05-07 16:30:32.64041+00	0eea90c0-7658-46db-b655-b9fecf5deb69	STUDENT	a1000001-0000-0000-0000-000000000001
e5010004-0000-0000-0000-000000000003	b2000001-0000-0000-0000-000000000001	c3000001-0000-0000-0000-000000000004	a1000001-0000-0000-0000-000000000001	{"d9c1987e-41df-4081-b9b1-574fa0597f1b": "Saat proses destilasi, alat kondensor kami bocor sehingga uap tidak bisa terkumpul dengan baik. Rencana awal kami gagal. Saya mengusulkan agar kami menggunakan metode cold press sementara sambil menunggu alat diperbaiki. Kelompok setuju dan hasilnya cukup baik meski rendemennya lebih rendah dari destilasi."}	\N	\N	2025-10-19 10:00:00+00	\N	\N	2026-05-07 16:30:32.64041+00	2026-05-07 16:30:32.64041+00	3b03ee0e-8ca4-4922-95a4-9c009718bf47	STUDENT	a1000001-0000-0000-0000-000000000001
e5010005-0000-0000-0000-000000000001	b2000001-0000-0000-0000-000000000001	c3000001-0000-0000-0000-000000000005	a1000001-0000-0000-0000-000000000001	{"d5c908d9-bca1-4fa0-8b91-9d6528755b36": 3, "dd94d813-d102-420d-81ff-6049c4d7fef0": 4}	\N	\N	2025-10-24 10:00:00+00	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-24 10:00:00+00	2026-05-07 16:30:32.64041+00	2026-05-07 16:30:32.64041+00	56ac1baf-b8f2-42d0-a72b-23d350b8bdfe	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
e5010006-0000-0000-0000-000000000001	b2000001-0000-0000-0000-000000000001	c3000001-0000-0000-0000-000000000006	a1000001-0000-0000-0000-000000000001	{"80e1729d-5f76-41e5-a0a6-2e7e051c656d": "Selama proyek ini, dimensi yang paling berkembang dalam diri saya adalah kolaborasi dan kreativitas. Saya belajar mendengarkan pendapat teman dan mencari solusi bersama saat ada kendala. Dimensi yang belum optimal adalah kemandirian, karena saya masih sering menunggu arahan teman sebelum bertindak."}	\N	\N	2025-10-26 08:00:00+00	\N	\N	2026-05-07 16:30:32.64041+00	2026-05-07 16:30:32.64041+00	ebc153f4-148e-4d39-9218-95a7f26ecf83	STUDENT	a1000001-0000-0000-0000-000000000001
e5010006-0000-0000-0000-000000000002	b2000001-0000-0000-0000-000000000001	c3000001-0000-0000-0000-000000000006	a1000001-0000-0000-0000-000000000001	{"32a2f652-9c64-409f-83cc-32d8b8ade800": "Saya ingin lebih berani mengambil inisiatif tanpa harus menunggu teman. Rencana saya adalah mulai memimpin diskusi kecil di kelompok belajar. Saya butuh dukungan guru untuk memberikan kesempatan memimpin presentasi di kelas.", "6d0ae10a-eddd-4816-bebd-4bf690fe6dfc": "Saya membutuhkan buku referensi tentang kewirausahaan berbasis alam dan bimbingan dari guru untuk mengembangkan ide produk lebih lanjut."}	\N	\N	2025-10-26 08:30:00+00	\N	\N	2026-05-07 16:30:32.64041+00	2026-05-07 16:30:32.64041+00	a35a14b0-aa7e-4680-aaa3-69a1c92ffc3f	STUDENT	a1000001-0000-0000-0000-000000000001
\.


--
-- Data for Name: teacher_feedbacks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teacher_feedbacks (id, teacher_id, student_id, project_id, feedback, created_at, updated_at) FROM stdin;
6aff8544-3d1f-4c2d-971b-982f2ce2e316	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	a1000001-0000-0000-0000-000000000001	b2000001-0000-0000-0000-000000000001	Aldi menunjukkan perkembangan yang sangat baik sepanjang proyek ini. Kemampuan berkolaborasi dan kreativitasnya dalam mencari solusi saat alat kondensor bocor sangat mengesankan. Untuk ke depan, Aldi perlu lebih berani mengambil inisiatif tanpa menunggu arahan dari teman. Terus semangat!	2026-05-07 16:47:44.93784+00	2026-05-07 16:47:44.93784+00
\.


--
-- Data for Name: template_journal_rubrics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.template_journal_rubrics (id, config_id, indicator_text, criteria, created_at, updated_at, dimension_id) FROM stdin;
eb46c4dc-5a2b-4c0b-b443-65197589f80b	790ddfc1-9fce-420b-a7ef-77136652865b	Mengajukan pertanyaan terbuka yang relevan dengan masalah utama proyek\n	{"1": "Pertanyaan tidak relevan, tidak mencerminkan pemahaman terhadap masalah proyek\\n", "2": "Pertanyaan relevan namun bersifat tertutup, hanya memunculkan jawaban terbatas\\n", "3": "Pertanyaan terbuka, relevan, belum mengarah langsung ke masalah utama proyek\\n", "4": "Pertanyaan terbuka, relevan, berkaitan langsung dengan masalah utama proyek\\n"}	2025-10-04 18:19:15.717897+00	2025-10-04 18:19:15.717897+00	7f4e9777-eee0-4f28-9718-97d592c4d097
8bb6fc49-77b2-4652-bb4f-921146725d16	790ddfc1-9fce-420b-a7ef-77136652865b	Mengajukan pertanyaan yang mendorong eksplorasi lebih lanjut\n	{"1": "Pertanyaan hanya meminta informasi faktual yang mudah diperoleh (contohnya tentang definisi, data tunggal)\\n", "2": "Pertanyaan hanya membutuhkan penelusuran sederhana antara lain dari membaca artikel atau buku\\n", "3": "Pertanyaan mendorong eksplorasi, meskipun belum mengarah pada eksperimen nyata\\n", "4": "Pertanyaan mengarah pada penyelidikan mendalam, dapat mendorong pengumpulan data maupun eksperimen nyata\\n"}	2025-10-04 18:20:30.308597+00	2025-10-04 18:20:30.308597+00	7f4e9777-eee0-4f28-9718-97d592c4d097
2d298aa5-9f5f-4675-942d-220bdadb7faa	3b03ee0e-8ca4-4922-95a4-9c009718bf47	Memodifikasi rencana kerja berdasarkan kondisi baru atau kendala yang muncul\n	{"1": "Tidak menceritakan kendala dengan jelas atau tidak menyebutkan solusi yang relevan. Refleksi tidak menggambarkan adanya modifikasi rencana kerja atau kurang mencerminkan pemahaman terhadap situasi\\n", "2": "Menceritakan kendala secara umum, solusi yang diberikan kurang sesuai atau kurang jelas penerapannya\\n", "3": "Menceritakan secara jelas kendala yang dihadapi, menyebutkan solusi yang relevan, diterapkan, menunjukkan adanya penyesuaian terhadap kondisi, namun belum sepenuhnya inovatif\\n", "4": "Menceritakan secara jelas kendala yang dihadapi, menunjukkan pemahaman terhadap situasi, dan menyebutkan solusi yang relevan, kreatif (pemikiran baru, unik), dan diterapkan oleh kelompok\\n"}	2025-10-04 18:23:43.43321+00	2025-10-04 18:23:43.43321+00	d6db1aca-7539-4c13-88d3-e5c4d1ebda49
ebd9b8d2-d670-467f-b4d7-50cfcb8f23c0	0eea90c0-7658-46db-b655-b9fecf5deb69	Menunjukkan rasa syukur terhadap kekayaan alam\n	{"1": "Tidak mengungkapkan rasa syukur, merasa biasa saja\\n", "2": "Mengungkapkan rasa syukur secara singkat atau sekadar formalitas, tanpa menyadari tanggung jawab menjaga alam\\n", "3": "Mengungkapkan rasa syukur secara mendalam, namun belum menyadari tanggung jawab menjaga alam\\n", "4": "Mengungkapkan rasa syukur secara mendalam dan menyadari tanggung jawab menjaga alam\\n"}	2025-10-04 18:22:37.841549+00	2025-10-04 18:22:37.841549+00	088a1baa-1614-4f5a-acc4-769d4046b57f
7bc8faaf-b988-4bcb-86f6-84b0839c30ea	ebc153f4-148e-4d39-9218-95a7f26ecf83	Mengidentifikasi dimensi profil lulusan yang berkembang ataupun belum berkembang selama pelaksanaan proyek\n	{"1": "Tidak menyebutkan dimensi yang berkembang maupun belum berkembang.\\n", "2": "Menyebutkan dimensi namun kurang tepat atau tidak sesuai dengan pengalaman proyek.\\n", "3": "Menyebutkan dimensi yang berkembang ataupun belum berkembang, namun tanpa penjelasan.\\n", "4": "Menyebutkan dengan jelas dimensi yang berkembang ataupun belum berkembang, serta memberikan contoh atau alasan logis.\\n"}	2025-10-04 18:25:15.572714+00	2025-10-04 18:25:15.572714+00	a35fb937-753b-4cc0-831d-8db0ee76cbfc
4e6333d0-e188-4955-9cf8-8aa4fdf0374e	a35a14b0-aa7e-4680-aaa3-69a1c92ffc3f	Menyusun rencana pengembangan diri berdasarkan pengalaman proyek	{"1": "Tidak menyebutkan rencana pengembangan diri atau respon yang diberikan tidak sesuai dengan konteks pengembangan diri.\\n", "2": "Menyusun rencana pengembangan diri namun kurang relevan dengan pengalaman proyek\\n", "3": "Menyusun rencana pengembangan diri yang relevan namun bersifat umum atau kurang spesifik\\n", "4": "Menyusun rencana pengembangan diri secara jelas, spesifik, dan relevan dengan pengalaman proyek\\n"}	2025-10-04 18:26:41.556135+00	2025-10-04 18:26:41.556135+00	a35fb937-753b-4cc0-831d-8db0ee76cbfc
77c450c9-1728-4363-96c4-1d24dea93b57	a35a14b0-aa7e-4680-aaa3-69a1c92ffc3f	Mengidentifikasi sumber daya atau dukungan yang dibutuhkan untuk pengembangan diri maupun pembelajaran selanjutnya\n	{"1": "Tidak menyebutkan sumber daya atau dukungan yang dibutuhkan, atau respon yang diberikan tidak sesuai dengan konteks pengembangan diri\\n", "2": "Menyebutkan dukungan, namun masih umum atau tidak jelas relevansinya dengan pengembangan diri\\n", "3": "Menyebutkan dukungan yang relevan, tetapi belum dijelaskan bagaimana dukungan tersebut akan digunakan\\n", "4": "Menyebutkan beragam dukungan yang relevan, menjelaskan bagaimana dukungan itu membantu pengembangan diri.\\n"}	2025-10-04 18:27:14.581818+00	2025-10-04 18:27:14.581818+00	a35fb937-753b-4cc0-831d-8db0ee76cbfc
\.


--
-- Data for Name: template_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.template_questions (id, config_id, question_text, question_type, scoring_guide, created_at, updated_at, rubric_criteria, dimension_id) FROM stdin;
2ed041d4-c410-4055-aaef-38bf953deb6a	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	<p>Teman saya menunjukkan sikap menghargai saat mendengarkan pendapat teman kelompok.</p>	STATEMENT	\N	2025-10-04 16:51:38.576178+00	2025-10-04 16:51:38.576178+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
3be75cfc-e318-4dfd-aef9-1fd7f9e5136b	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	<p>Teman saya memberikan tanggapan yang membangun terhadap ide anggota kelompok untuk memperkuat hasil diskusi kelompok.</p>	STATEMENT	\N	2025-10-04 16:52:45.057181+00	2025-10-04 16:52:45.057181+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
82ef60e3-5101-4e06-a96e-92f2283f2eaf	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saat berdiskusi, saya berusaha menghindari perdebatan yang tidak perlu agar target pembuatan rencana proyek tercapai.</p>	STATEMENT	\N	2025-10-04 16:58:51.691821+00	2025-10-04 16:58:51.691821+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
2fa1bac3-6c37-4934-aaa0-c8b70b687605	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saya mengarahkan diskusi agar tetap fokus pada topik pembuatan rencana proyek.</p>	STATEMENT	\N	2025-10-04 16:59:05.442936+00	2025-10-04 16:59:05.442936+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
4fa24d37-7e5c-4513-8b4d-c308a190938b	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saat berdiskusi tentang rencana proyek, saya menyampaikan ide-ide yang muncul dari pemikiran sendiri, bukan meniru ide teman.</p>	STATEMENT	\N	2025-10-04 16:59:25.751986+00	2025-10-04 16:59:25.751986+00	\N	d6db1aca-7539-4c13-88d3-e5c4d1ebda49
bfdf93be-02c1-4218-895b-0f249e10f498	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saat membuat rencana proyek, saya berusaha memikirkan ide dari sudut pandang yang berbeda.</p>	STATEMENT	\N	2025-10-04 16:59:39.803924+00	2025-10-04 16:59:39.803924+00	\N	d6db1aca-7539-4c13-88d3-e5c4d1ebda49
a74cdc48-6d06-4277-a2e5-00931f646d57	f3bb6068-e563-4079-a149-112a7f67d26d	<p>Siswa menyampaikan data, fakta, atau informasi yang berkaitan dengan proyek.</p>	STATEMENT	\N	2025-10-04 17:54:29.771349+00	2025-10-04 17:54:29.771349+00	[{"score":4,"description":"Konsisten menunjukkan perilaku"},{"score":3,"description":"Sering menunjukkan perilaku"},{"score":2,"description":"Kadang-kadang menunjukkan perilaku"},{"score":1,"description":"Tidak menunjukkan perilaku"}]	7f4e9777-eee0-4f28-9718-97d592c4d097
38116f7a-1851-4d08-992d-b9d87c97b07d	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya menjalankan kesepakatan kelompok tanpa harus diingatkan atau ditekan oleh teman.</p>	STATEMENT	\N	2025-10-04 18:07:50.743656+00	2025-10-04 18:07:50.743656+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
1d27f1aa-a00e-481a-af7f-1b79c56b3bf0	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya aktif terlibat menyelesaikan proyek sesuai rencana kelompok sebagai bentuk tanggung jawab pribadi.</p>	STATEMENT	\N	2025-10-04 18:08:01.980798+00	2025-10-04 18:08:01.980798+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
c51da34e-b2b5-4037-9bd0-c285e1f983e7	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya mengerjakan tugas kelompok dengan sungguh-sungguh, bukan asal selesai.</p>	STATEMENT	\N	2025-10-04 18:08:24.210215+00	2025-10-04 18:08:24.210215+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
e7a3a6a2-2f3a-48d0-aaae-8742683b91fc	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya memperhatikan kualitas hasil kerja saya agar tidak merepotkan teman kelompok.</p>	STATEMENT	\N	2025-10-04 18:08:36.205593+00	2025-10-04 18:08:36.205593+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
66674b48-046d-45fc-be86-fa2c8d1b1f04	0eea90c0-7658-46db-b655-b9fecf5deb69	<p>Saat memanfaatkan bahan dari alam untuk proyek ini, apakah Anda merasa bersyukur atas karunia dari Tuhan Yang Maha Esa dan menyadari tanggung jawab untuk menjaga alam? Atau Anda merasa biasa saja? Ceritakan perasaan Anda.</p>	ESSAY_PROMPT	\N	2025-10-04 18:09:25.925294+00	2025-10-04 18:09:25.925294+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
8933921d-8ba0-472f-aa66-a833ec033507	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Jika ada kendala dalam kelompok, saya berinisiatif memberikan solusi atau ide untuk mengatasinya.</p>	STATEMENT	\N	2025-10-04 18:11:42.367704+00	2025-10-04 18:11:42.367704+00	\N	e0ba6943-f5e5-4532-99a2-d38686511d52
bbe117f9-a641-4367-9057-c0ac4f3f487f	6e401eff-e3f7-4fc9-8414-ca3b78d6d1b1	<p>Siswa menjalankan tanggung jawab sesuai peran yang disepakati dalam kelompok.</p>	STATEMENT	\N	2025-10-04 18:10:38.165515+00	2025-10-04 18:10:38.165515+00	[{"score":4,"description":"Konsisten menunjukkan perilaku"},{"score":3,"description":"Sering menunjukkan perilaku"},{"score":2,"description":"Kadang-kadang menunjukkan perilaku"},{"score":1,"description":"Tidak menunjukkan perilaku"}]	e0ba6943-f5e5-4532-99a2-d38686511d52
d5c908d9-bca1-4fa0-8b91-9d6528755b36	56ac1baf-b8f2-42d0-a72b-23d350b8bdfe	<p>Siswa merumuskan saran perbaikan terhadap produk yang dihasilkan.</p>	STATEMENT	\N	2025-10-04 18:16:16.637723+00	2025-10-04 18:16:16.637723+00	[{"score":4,"description":"Merumuskan saran perbaikan yang jelas, logis, dan tepat terhadap prosedur dan produk"},{"score":3,"description":"Merumuskan saran perbaikan yang jelas, logis, dan tepat terhadap prosedur atau produk"},{"score":2,"description":"Saran perbaikan kurang relevan atau terlalu umum."},{"score":1,"description":"Tidak memberikan saran perbaikan"}]	7f4e9777-eee0-4f28-9718-97d592c4d097
5beb7380-dddf-47e6-ad91-1d5752c608f7	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saya menyampaikan pendapat tanpa menyalahkan atau meremehkan pendapat teman.</p>	STATEMENT	\N	2025-10-04 16:57:09.723625+00	2025-10-04 16:57:44.634+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
62a3554f-2a05-4cd6-be3a-f485949cd92f	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saya menyampaikan ide kreatif, tetapi tetap mempertimbangkan waktu, ketersediaan bahan dan alat yang dibutuhkan kemungkinan diterapkan.</p>	STATEMENT	\N	2025-10-04 17:51:56.938713+00	2025-10-04 17:51:56.938713+00	\N	d6db1aca-7539-4c13-88d3-e5c4d1ebda49
01ca8a9b-42ae-4921-94a1-553ee32a425e	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saya berusaha menyampaikan ide yang masuk akal dan dapat dikerjakan bersama oleh anggota kelompok.</p>	STATEMENT	\N	2025-10-04 17:52:44.15604+00	2025-10-04 17:52:44.15604+00	\N	d6db1aca-7539-4c13-88d3-e5c4d1ebda49
b4439e44-8041-4b00-8ba6-776d6ec6b97f	6241ccf2-8589-4be3-9a18-f6ea3f174ddd	<p>Saya menyampaikan usul jadwal aktivitas secara jelas agar mudah dipahami teman.</p>	STATEMENT	\N	2025-10-04 18:04:30.050514+00	2025-10-04 18:04:30.050514+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
5a90f1a4-00aa-4a37-9dfa-628e59db4315	6241ccf2-8589-4be3-9a18-f6ea3f174ddd	<p>Saya tidak memaksakan pendapat saat menentukan jadwal bersama kelompok.</p>	STATEMENT	\N	2025-10-04 18:06:11.377914+00	2025-10-04 18:06:11.377914+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
93852818-467c-41c3-b79a-32c89af8273e	6241ccf2-8589-4be3-9a18-f6ea3f174ddd	<p>Saya tetap terlibat dan tidak diam saja saat kelompok merancang jadwal proyek.</p>	STATEMENT	\N	2025-10-04 18:06:49.483693+00	2025-10-04 18:06:49.483693+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
6b4a2e46-01de-4d78-942d-217643d96135	b96f81dc-f8ac-42db-ab36-2dea79e6e780	<p>Teman saya aktif terlibat dalam diskusi penjadwalan proyek dan ikut memberikan pendapat.</p>	STATEMENT	\N	2025-10-04 18:07:21.611504+00	2025-10-04 18:07:21.611504+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
32459ca3-064b-46e4-a8f2-5616e7ee3b2c	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya memantau apakah kelompok saya sudah berjalan sesuai rencana proyek.</p>	STATEMENT	\N	2025-10-04 18:11:27.930955+00	2025-10-04 18:11:27.930955+00	\N	e0ba6943-f5e5-4532-99a2-d38686511d52
32a2f652-9c64-409f-83cc-32d8b8ade800	a35a14b0-aa7e-4680-aaa3-69a1c92ffc3f	<p>Berdasarkan pengalaman yang didapat selama proyek, Apa rencana pengembangan diri yang ingin Anda lakukan?<br>Apa saja dukungan atau bantuan yang Anda butuhkan untuk mendukung pengembangan diri ke depan?</p>	ESSAY_PROMPT	\N	2025-10-04 18:17:40.747913+00	2025-10-04 18:17:40.747913+00	\N	a35fb937-753b-4cc0-831d-8db0ee76cbfc
71a5a50a-29cb-42ae-9770-ff0d3a03cdad	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya melatih keterampilan dalam proses destilasi minyak atsiri</p>	STATEMENT	\N	2025-10-06 14:51:50.731047+00	2025-10-06 14:51:50.731047+00	\N	a35fb937-753b-4cc0-831d-8db0ee76cbfc
fec13908-8cbc-42e3-ae85-c0a34f7ac133	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya melatih keterampilan dalam mencampur minyak atsiri dengan bahan lainnya sesuai formulasi dengan teliti.</p>	STATEMENT	\N	2025-10-06 14:52:19.940866+00	2025-10-06 14:52:19.940866+00	\N	a35fb937-753b-4cc0-831d-8db0ee76cbfc
fa8f9632-5ee0-4b9b-969e-01bf4a54b2f7	790ddfc1-9fce-420b-a7ef-77136652865b	<p>Anda bersama guru dan teman-teman telah merumuskan masalah utama dalam proyek kali ini. Dari masalah tersebut, pertanyaan-pertanyaan apa saja yang terlintas dalam pikiran Anda? Mengapa menurut Anda pertanyaan itu penting untuk ditemukan jawabannya dalam proyek ini?</p>	ESSAY_PROMPT	\N	2025-10-04 16:45:33.449972+00	2025-10-04 16:45:33.449972+00	\N	7f4e9777-eee0-4f28-9718-97d592c4d097
3fec942c-59cd-4d6d-9d1e-a68b6ada731a	6241ccf2-8589-4be3-9a18-f6ea3f174ddd	<p>Saat tidak setuju dengan usulan teman terkait jadwal proyek, saya menyampaikan alasan ataupun pemikiran saya dengan jelas.</p>	STATEMENT	\N	2025-10-04 18:04:55.181697+00	2025-10-04 18:05:49.706+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
d9c1987e-41df-4081-b9b1-574fa0597f1b	3b03ee0e-8ca4-4922-95a4-9c009718bf47	<p>Selama proses pembuatan produk, pernahkah Anda menghadapi situasi di mana rencana awal tidak bisa dijalankan karena kendala tak terduga (misal: bahan kurang, alat rusak, waktu terbatas, hasil tidak sesuai, dan sebagainya)? Ceritakan pengalaman tersebut dan apa solusi yang Anda tawarkan kepada kelompok untuk mengatasinya?</p>	ESSAY_PROMPT	\N	2025-10-04 18:12:47.829029+00	2025-10-04 18:12:47.829029+00	\N	d6db1aca-7539-4c13-88d3-e5c4d1ebda49
80e1729d-5f76-41e5-a0a6-2e7e051c656d	ebc153f4-148e-4d39-9218-95a7f26ecf83	<p>Proyek yang telah Anda lakukan bertujuan untuk mengembangkan dimensi: 1) keimanan dan ketakwaan terhadap Tuhan Yang Maha Esa, 2) penalaran kritis, 3) kolaborasi, 4) kreativitas, 5) kemandirian, 6) komunikasi. Ceritakan, dimensi profil lulusan apa saja yang berkembang dalam diri Anda selama proyek? Apakah ada dimensi yang menurut Anda belum berkembang optimal, ceritakan dimensi apa?</p>	ESSAY_PROMPT	\N	2025-10-04 18:16:44.120354+00	2025-10-04 18:16:44.120354+00	\N	a35fb937-753b-4cc0-831d-8db0ee76cbfc
5db7aea2-a0d8-4c3a-a1cf-e84fec6149b7	f3bb6068-e563-4079-a149-112a7f67d26d	<p>Siswa mengajukan pertanyaan kepada guru atau teman untuk memperjelas informasi.</p>	STATEMENT	\N	2025-10-04 17:55:49.621292+00	2025-10-04 17:55:49.621292+00	[{"score":4,"description":"Konsisten menunjukkan perilaku"},{"score":3,"description":"Sering menunjukkan perilaku"},{"score":2,"description":"Kadang-kadang menunjukkan perilaku"},{"score":1,"description":"Tidak menunjukkan perilaku"}]	7f4e9777-eee0-4f28-9718-97d592c4d097
dd94d813-d102-420d-81ff-6049c4d7fef0	56ac1baf-b8f2-42d0-a72b-23d350b8bdfe	<p>Siswa menjelaskan keterkaitan produk dengan pertanyaan yang dirumuskan pada awal pembelajaran.</p>	STATEMENT	\N	2025-10-04 18:15:19.39781+00	2025-10-04 18:15:19.39781+00	[{"score":4,"description":"Menjelaskan dengan jelas dan logis (disertai alasan ilmiah) keterkaitan antara produk dengan pertanyaan awal, penjelasan menunjukkan pemahaman yang mendalam."},{"score":3,"description":"Menjelaskan keterkaitan antara produk dan pertanyaan awal dengan cukup jelas, meskipun kurang mendalam atau kurang lengkap."},{"score":2,"description":"Menyebutkan keterkaitan produk dengan pertanyaan awal secara singkat, namun penjelasannya kurang logis atau tidak spesifik."},{"score":1,"description":"Tidak menjelaskan keterkaitan antara produk dan pertanyaan awal."}]	7f4e9777-eee0-4f28-9718-97d592c4d097
282088ad-2731-4a5e-97ec-9cadea63b452	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Jika ada ide yang menurut saya kurang tepat, saya mengungkapkan pendapat dengan cara yang tidak membuat teman merasa malu atau disalahkan.</p>	STATEMENT	\N	2026-05-07 16:15:03.35731+00	2026-05-07 16:15:03.35731+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
6d0ae10a-eddd-4816-bebd-4bf690fe6dfc	a35a14b0-aa7e-4680-aaa3-69a1c92ffc3f	<p>Berdasarkan pengalaman yang didapat selama proyek, sumber daya atau dukungan apa saja yang Anda butuhkan untuk mendukung pengembangan diri maupun pembelajaran selanjutnya?</p>	ESSAY_PROMPT	\N	2026-05-07 16:15:03.35731+00	2026-05-07 16:15:03.35731+00	\N	a35fb937-753b-4cc0-831d-8db0ee76cbfc
\.


--
-- Data for Name: template_stage_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.template_stage_configs (id, template_id, stage_name, instrument_type, display_order, description, estimated_duration, created_at, updated_at) FROM stdin;
790ddfc1-9fce-420b-a7ef-77136652865b	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Start with the essential question:	JOURNAL	1	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
c9fad00b-f3f4-413e-a753-8d9b183c2fd6	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Design a plan for the project	PEER_ASSESSMENT	2	mendesain peluang2 pengembangan keunggulan produk\n	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
095fcf1d-aee4-49fb-a5c8-70e9b39703d7	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Design a plan for the project	SELF_ASSESSMENT	3	mendesain peluang2 pengembangan keunggulan produk\n	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
f3bb6068-e563-4079-a149-112a7f67d26d	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Design a plan for the project	OBSERVATION	4	mendesain peluang2 pengembangan keunggulan produk\n	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
6241ccf2-8589-4be3-9a18-f6ea3f174ddd	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Create a schedule	SELF_ASSESSMENT	5	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
b96f81dc-f8ac-42db-ab36-2dea79e6e780	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Create a schedule	PEER_ASSESSMENT	6	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
d14942a4-50b1-4451-9c14-d8b828ef58f1	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Monitor the students and the progress of the project	SELF_ASSESSMENT	7	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
0eea90c0-7658-46db-b655-b9fecf5deb69	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Monitor the students and the progress of the project	JOURNAL	8	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
6e401eff-e3f7-4fc9-8414-ca3b78d6d1b1	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Monitor the students and the progress of the project	OBSERVATION	9	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
3b03ee0e-8ca4-4922-95a4-9c009718bf47	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Monitor the students and the progress of the project	JOURNAL	10	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
ebc153f4-148e-4d39-9218-95a7f26ecf83	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Evaluate the experiences: review kegiatan	JOURNAL	12	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
a35a14b0-aa7e-4680-aaa3-69a1c92ffc3f	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Evaluate the experiences: review kegiatan	JOURNAL	13	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
56ac1baf-b8f2-42d0-a72b-23d350b8bdfe	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Assess the output	OBSERVATION	11	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
\.


--
-- Data for Name: user_class_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_class_assignments (user_id, class_id, assigned_at) FROM stdin;
3dae7273-63b9-4dfd-bc39-5ba42a1bb723	3e96522e-34ba-4537-bad6-280219c4d778	2025-09-21 05:47:57.887359+00
3dae7273-63b9-4dfd-bc39-5ba42a1bb723	82913766-f21a-44a9-a4b0-b392ac2aee53	2025-09-28 12:42:28.984883+00
a1000001-0000-0000-0000-000000000001	3e96522e-34ba-4537-bad6-280219c4d778	2026-05-07 16:19:35.191663+00
a1000001-0000-0000-0000-000000000002	3e96522e-34ba-4537-bad6-280219c4d778	2026-05-07 16:19:35.191663+00
a1000001-0000-0000-0000-000000000003	3e96522e-34ba-4537-bad6-280219c4d778	2026-05-07 16:19:35.191663+00
a1000001-0000-0000-0000-000000000004	3e96522e-34ba-4537-bad6-280219c4d778	2026-05-07 16:19:35.191663+00
a1000001-0000-0000-0000-000000000005	3e96522e-34ba-4537-bad6-280219c4d778	2026-05-07 16:19:35.191663+00
a1000001-0000-0000-0000-000000000006	3e96522e-34ba-4537-bad6-280219c4d778	2026-05-07 16:19:35.191663+00
a1000001-0000-0000-0000-000000000007	3e96522e-34ba-4537-bad6-280219c4d778	2026-05-07 16:19:35.191663+00
a1000001-0000-0000-0000-000000000008	3e96522e-34ba-4537-bad6-280219c4d778	2026-05-07 16:19:35.191663+00
a1000001-0000-0000-0000-000000000009	3e96522e-34ba-4537-bad6-280219c4d778	2026-05-07 16:19:35.191663+00
a1000001-0000-0000-0000-000000000010	3e96522e-34ba-4537-bad6-280219c4d778	2026-05-07 16:19:35.191663+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, role, email_verified, image, created_at, updated_at) FROM stdin;
cdebd811-1ce2-46c7-96d0-604db5785205	ihsan	ihsansyafiul@gmail.com	ADMIN	f	\N	2025-09-19 17:30:02.564+00	2025-09-19 17:30:02.564+00
3dae7273-63b9-4dfd-bc39-5ba42a1bb723	Andry	andry@breakitall.biz.id	TEACHER	f	\N	2025-09-20 08:10:39.976+00	2025-09-20 08:10:39.976+00
7a030f0c-a394-4d95-bf8e-60979d5660e0	Prabowo aneh	prabroro@gmail.com	TEACHER	f	\N	2025-09-21 06:35:35.628+00	2025-09-21 06:35:35.628+00
ff6d026f-f648-43be-b640-c42e64095ddc	lisa	lisa@gmail.com	TEACHER	f	\N	2025-09-22 14:59:53.221+00	2025-09-22 14:59:53.221+00
e0fe36a0-c6eb-48a7-92e0-cb54d59e1cb7	anjeli	anjeli@gmail.com	ADMIN	f	\N	2025-09-22 14:52:02.216+00	2025-09-22 14:52:02.216+00
a1000001-0000-0000-0000-000000000001	Aldi Pratama	aldi@siswa.sch.id	STUDENT	t	\N	2026-05-07 16:18:52.919438+00	2026-05-07 16:18:52.919438+00
a1000001-0000-0000-0000-000000000002	Budi Santoso	budi@siswa.sch.id	STUDENT	t	\N	2026-05-07 16:18:52.919438+00	2026-05-07 16:18:52.919438+00
a1000001-0000-0000-0000-000000000003	Citra Dewi	citra@siswa.sch.id	STUDENT	t	\N	2026-05-07 16:18:52.919438+00	2026-05-07 16:18:52.919438+00
a1000001-0000-0000-0000-000000000004	Dina Rahayu	dina@siswa.sch.id	STUDENT	t	\N	2026-05-07 16:18:52.919438+00	2026-05-07 16:18:52.919438+00
a1000001-0000-0000-0000-000000000005	Eko Wijaya	eko@siswa.sch.id	STUDENT	t	\N	2026-05-07 16:18:52.919438+00	2026-05-07 16:18:52.919438+00
a1000001-0000-0000-0000-000000000006	Farah Aulia	farah@siswa.sch.id	STUDENT	t	\N	2026-05-07 16:18:52.919438+00	2026-05-07 16:18:52.919438+00
a1000001-0000-0000-0000-000000000007	Gilang Ramadan	gilang@siswa.sch.id	STUDENT	t	\N	2026-05-07 16:18:52.919438+00	2026-05-07 16:18:52.919438+00
a1000001-0000-0000-0000-000000000008	Hana Pertiwi	hana@siswa.sch.id	STUDENT	t	\N	2026-05-07 16:18:52.919438+00	2026-05-07 16:18:52.919438+00
a1000001-0000-0000-0000-000000000009	Irfan Maulana	irfan@siswa.sch.id	STUDENT	t	\N	2026-05-07 16:18:52.919438+00	2026-05-07 16:18:52.919438+00
a1000001-0000-0000-0000-000000000010	Jasmine Putri	jasmine@siswa.sch.id	STUDENT	t	\N	2026-05-07 16:18:52.919438+00	2026-05-07 16:18:52.919438+00
\.


--
-- Data for Name: verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verifications (id, identifier, value, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 6, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: academic_terms academic_terms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_terms
    ADD CONSTRAINT academic_terms_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: dimensions dimensions_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions
    ADD CONSTRAINT dimensions_name_unique UNIQUE (name);


--
-- Name: dimensions dimensions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions
    ADD CONSTRAINT dimensions_pkey PRIMARY KEY (id);


--
-- Name: group_comments group_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_comments
    ADD CONSTRAINT group_comments_pkey PRIMARY KEY (id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (group_id, student_id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: project_stage_instruments project_stage_instruments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stage_instruments
    ADD CONSTRAINT project_stage_instruments_pkey PRIMARY KEY (id);


--
-- Name: project_stage_progress project_stage_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stage_progress
    ADD CONSTRAINT project_stage_progress_pkey PRIMARY KEY (id);


--
-- Name: project_stages project_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stages
    ADD CONSTRAINT project_stages_pkey PRIMARY KEY (id);


--
-- Name: project_templates project_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_templates
    ADD CONSTRAINT project_templates_pkey PRIMARY KEY (id);


--
-- Name: project_templates project_templates_template_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_templates
    ADD CONSTRAINT project_templates_template_name_unique UNIQUE (template_name);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_unique UNIQUE (token);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: teacher_feedbacks teacher_feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_feedbacks
    ADD CONSTRAINT teacher_feedbacks_pkey PRIMARY KEY (id);


--
-- Name: teacher_feedbacks teacher_feedbacks_teacher_student_project_idx; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_feedbacks
    ADD CONSTRAINT teacher_feedbacks_teacher_student_project_idx UNIQUE (teacher_id, student_id, project_id);


--
-- Name: template_journal_rubrics template_journal_rubrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_journal_rubrics
    ADD CONSTRAINT template_journal_rubrics_pkey PRIMARY KEY (id);


--
-- Name: template_questions template_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_questions
    ADD CONSTRAINT template_questions_pkey PRIMARY KEY (id);


--
-- Name: template_stage_configs template_stage_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_stage_configs
    ADD CONSTRAINT template_stage_configs_pkey PRIMARY KEY (id);


--
-- Name: user_class_assignments user_class_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_class_assignments
    ADD CONSTRAINT user_class_assignments_pkey PRIMARY KEY (user_id, class_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verifications verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_pkey PRIMARY KEY (id);


--
-- Name: academic_terms_year_semester_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX academic_terms_year_semester_idx ON public.academic_terms USING btree (academic_year, semester);


--
-- Name: classes_name_term_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX classes_name_term_idx ON public.classes USING btree (name, academic_term_id);


--
-- Name: group_comments_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_comments_idx ON public.group_comments USING btree (group_id, target_member_id);


--
-- Name: project_stage_progress_student_stage_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_stage_progress_student_stage_idx ON public.project_stage_progress USING btree (project_stage_id, student_id);


--
-- Name: project_stages_project_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_stages_project_order_idx ON public.project_stages USING btree (project_id, "order");


--
-- Name: teacher_feedbacks_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_feedbacks_project_idx ON public.teacher_feedbacks USING btree (project_id);


--
-- Name: teacher_feedbacks_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_feedbacks_student_idx ON public.teacher_feedbacks USING btree (student_id);


--
-- Name: teacher_feedbacks_teacher_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_feedbacks_teacher_idx ON public.teacher_feedbacks USING btree (teacher_id);


--
-- Name: template_stage_configs_template_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX template_stage_configs_template_order_idx ON public.template_stage_configs USING btree (template_id, display_order);


--
-- Name: accounts accounts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: classes classes_academic_term_id_academic_terms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_academic_term_id_academic_terms_id_fk FOREIGN KEY (academic_term_id) REFERENCES public.academic_terms(id) ON DELETE RESTRICT;


--
-- Name: dimensions dimensions_created_by_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions
    ADD CONSTRAINT dimensions_created_by_admin_id_fkey FOREIGN KEY (created_by_admin_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: group_comments group_comments_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_comments
    ADD CONSTRAINT group_comments_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: group_comments group_comments_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_comments
    ADD CONSTRAINT group_comments_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_comments group_comments_target_member_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_comments
    ADD CONSTRAINT group_comments_target_member_id_users_id_fk FOREIGN KEY (target_member_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_student_id_users_id_fk FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: groups groups_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_stage_instruments project_stage_instruments_project_stage_id_project_stages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stage_instruments
    ADD CONSTRAINT project_stage_instruments_project_stage_id_project_stages_id_fk FOREIGN KEY (project_stage_id) REFERENCES public.project_stages(id) ON DELETE CASCADE;


--
-- Name: project_stage_progress project_stage_progress_project_stage_id_project_stages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stage_progress
    ADD CONSTRAINT project_stage_progress_project_stage_id_project_stages_id_fk FOREIGN KEY (project_stage_id) REFERENCES public.project_stages(id) ON DELETE CASCADE;


--
-- Name: project_stage_progress project_stage_progress_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stage_progress
    ADD CONSTRAINT project_stage_progress_student_id_users_id_fk FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_stages project_stages_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stages
    ADD CONSTRAINT project_stages_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_templates project_templates_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_templates
    ADD CONSTRAINT project_templates_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: projects projects_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: projects projects_teacher_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_teacher_id_users_id_fk FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: projects projects_template_id_project_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_template_id_project_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.project_templates(id) ON DELETE RESTRICT;


--
-- Name: sessions sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_assessed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_assessed_by_users_id_fk FOREIGN KEY (assessed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: submissions submissions_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_project_stage_id_project_stages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_project_stage_id_project_stages_id_fk FOREIGN KEY (project_stage_id) REFERENCES public.project_stages(id) ON DELETE SET NULL;


--
-- Name: submissions submissions_submitted_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_submitted_by_id_users_id_fk FOREIGN KEY (submitted_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_target_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_target_student_id_users_id_fk FOREIGN KEY (target_student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_template_stage_config_id_template_stage_configs_id_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_template_stage_config_id_template_stage_configs_id_ FOREIGN KEY (template_stage_config_id) REFERENCES public.template_stage_configs(id) ON DELETE SET NULL;


--
-- Name: teacher_feedbacks teacher_feedbacks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_feedbacks
    ADD CONSTRAINT teacher_feedbacks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: teacher_feedbacks teacher_feedbacks_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_feedbacks
    ADD CONSTRAINT teacher_feedbacks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teacher_feedbacks teacher_feedbacks_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_feedbacks
    ADD CONSTRAINT teacher_feedbacks_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: template_journal_rubrics template_journal_rubrics_config_id_template_stage_configs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_journal_rubrics
    ADD CONSTRAINT template_journal_rubrics_config_id_template_stage_configs_id_fk FOREIGN KEY (config_id) REFERENCES public.template_stage_configs(id) ON DELETE CASCADE;


--
-- Name: template_journal_rubrics template_journal_rubrics_dimension_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_journal_rubrics
    ADD CONSTRAINT template_journal_rubrics_dimension_id_fkey FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id) ON DELETE SET NULL;


--
-- Name: template_questions template_questions_config_id_template_stage_configs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_questions
    ADD CONSTRAINT template_questions_config_id_template_stage_configs_id_fk FOREIGN KEY (config_id) REFERENCES public.template_stage_configs(id) ON DELETE CASCADE;


--
-- Name: template_questions template_questions_dimension_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_questions
    ADD CONSTRAINT template_questions_dimension_id_fkey FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id) ON DELETE SET NULL;


--
-- Name: template_stage_configs template_stage_configs_template_id_project_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_stage_configs
    ADD CONSTRAINT template_stage_configs_template_id_project_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.project_templates(id) ON DELETE CASCADE;


--
-- Name: user_class_assignments user_class_assignments_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_class_assignments
    ADD CONSTRAINT user_class_assignments_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: user_class_assignments user_class_assignments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_class_assignments
    ADD CONSTRAINT user_class_assignments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 0kx7tLXBQu6HtabawBpwczKPAOJSNyDUtI3Vkx7P3JTJdDPXfjQElfM9kzQtO61

