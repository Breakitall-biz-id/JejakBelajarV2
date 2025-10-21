--
-- PostgreSQL database dump
--

\restrict nyEQCTCr9sfvmTKTcQLulXRO0ardqAonxogVkYCgnvacDKrs1q2rTu8Fsy2cR0x

-- Dumped from database version 17.5 (6bc9ef8)
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

ALTER TABLE IF EXISTS ONLY "public"."user_class_assignments" DROP CONSTRAINT IF EXISTS "user_class_assignments_user_id_users_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."user_class_assignments" DROP CONSTRAINT IF EXISTS "user_class_assignments_class_id_classes_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."template_stage_configs" DROP CONSTRAINT IF EXISTS "template_stage_configs_template_id_project_templates_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."template_questions" DROP CONSTRAINT IF EXISTS "template_questions_dimension_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."template_questions" DROP CONSTRAINT IF EXISTS "template_questions_config_id_template_stage_configs_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."template_journal_rubrics" DROP CONSTRAINT IF EXISTS "template_journal_rubrics_dimension_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."template_journal_rubrics" DROP CONSTRAINT IF EXISTS "template_journal_rubrics_config_id_template_stage_configs_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."teacher_feedbacks" DROP CONSTRAINT IF EXISTS "teacher_feedbacks_teacher_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."teacher_feedbacks" DROP CONSTRAINT IF EXISTS "teacher_feedbacks_student_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."teacher_feedbacks" DROP CONSTRAINT IF EXISTS "teacher_feedbacks_project_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."submissions" DROP CONSTRAINT IF EXISTS "submissions_template_stage_config_id_template_stage_configs_id_";
ALTER TABLE IF EXISTS ONLY "public"."submissions" DROP CONSTRAINT IF EXISTS "submissions_target_student_id_users_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."submissions" DROP CONSTRAINT IF EXISTS "submissions_submitted_by_id_users_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."submissions" DROP CONSTRAINT IF EXISTS "submissions_project_stage_id_project_stages_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."submissions" DROP CONSTRAINT IF EXISTS "submissions_project_id_projects_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."submissions" DROP CONSTRAINT IF EXISTS "submissions_assessed_by_users_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."sessions" DROP CONSTRAINT IF EXISTS "sessions_user_id_users_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."projects" DROP CONSTRAINT IF EXISTS "projects_template_id_project_templates_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."projects" DROP CONSTRAINT IF EXISTS "projects_teacher_id_users_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."projects" DROP CONSTRAINT IF EXISTS "projects_class_id_classes_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."project_templates" DROP CONSTRAINT IF EXISTS "project_templates_created_by_id_users_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."project_stages" DROP CONSTRAINT IF EXISTS "project_stages_project_id_projects_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."project_stage_progress" DROP CONSTRAINT IF EXISTS "project_stage_progress_student_id_users_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."project_stage_progress" DROP CONSTRAINT IF EXISTS "project_stage_progress_project_stage_id_project_stages_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."project_stage_instruments" DROP CONSTRAINT IF EXISTS "project_stage_instruments_project_stage_id_project_stages_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."groups" DROP CONSTRAINT IF EXISTS "groups_project_id_projects_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."group_members" DROP CONSTRAINT IF EXISTS "group_members_student_id_users_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."group_members" DROP CONSTRAINT IF EXISTS "group_members_group_id_groups_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."group_comments" DROP CONSTRAINT IF EXISTS "group_comments_target_member_id_users_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."group_comments" DROP CONSTRAINT IF EXISTS "group_comments_group_id_groups_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."group_comments" DROP CONSTRAINT IF EXISTS "group_comments_author_id_users_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."dimensions" DROP CONSTRAINT IF EXISTS "dimensions_created_by_admin_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."classes" DROP CONSTRAINT IF EXISTS "classes_academic_term_id_academic_terms_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."accounts" DROP CONSTRAINT IF EXISTS "accounts_user_id_users_id_fk";
DROP INDEX IF EXISTS "public"."template_stage_configs_template_order_idx";
DROP INDEX IF EXISTS "public"."teacher_feedbacks_teacher_idx";
DROP INDEX IF EXISTS "public"."teacher_feedbacks_student_idx";
DROP INDEX IF EXISTS "public"."teacher_feedbacks_project_idx";
DROP INDEX IF EXISTS "public"."project_stages_project_order_idx";
DROP INDEX IF EXISTS "public"."project_stage_progress_student_stage_idx";
DROP INDEX IF EXISTS "public"."group_comments_idx";
DROP INDEX IF EXISTS "public"."classes_name_term_idx";
DROP INDEX IF EXISTS "public"."academic_terms_year_semester_idx";
ALTER TABLE IF EXISTS ONLY "public"."verifications" DROP CONSTRAINT IF EXISTS "verifications_pkey";
ALTER TABLE IF EXISTS ONLY "public"."users" DROP CONSTRAINT IF EXISTS "users_pkey";
ALTER TABLE IF EXISTS ONLY "public"."users" DROP CONSTRAINT IF EXISTS "users_email_unique";
ALTER TABLE IF EXISTS ONLY "public"."user_class_assignments" DROP CONSTRAINT IF EXISTS "user_class_assignments_pkey";
ALTER TABLE IF EXISTS ONLY "public"."template_stage_configs" DROP CONSTRAINT IF EXISTS "template_stage_configs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."template_questions" DROP CONSTRAINT IF EXISTS "template_questions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."template_journal_rubrics" DROP CONSTRAINT IF EXISTS "template_journal_rubrics_pkey";
ALTER TABLE IF EXISTS ONLY "public"."teacher_feedbacks" DROP CONSTRAINT IF EXISTS "teacher_feedbacks_teacher_student_project_idx";
ALTER TABLE IF EXISTS ONLY "public"."teacher_feedbacks" DROP CONSTRAINT IF EXISTS "teacher_feedbacks_pkey";
ALTER TABLE IF EXISTS ONLY "public"."submissions" DROP CONSTRAINT IF EXISTS "submissions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."sessions" DROP CONSTRAINT IF EXISTS "sessions_token_unique";
ALTER TABLE IF EXISTS ONLY "public"."sessions" DROP CONSTRAINT IF EXISTS "sessions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."projects" DROP CONSTRAINT IF EXISTS "projects_pkey";
ALTER TABLE IF EXISTS ONLY "public"."project_templates" DROP CONSTRAINT IF EXISTS "project_templates_template_name_unique";
ALTER TABLE IF EXISTS ONLY "public"."project_templates" DROP CONSTRAINT IF EXISTS "project_templates_pkey";
ALTER TABLE IF EXISTS ONLY "public"."project_stages" DROP CONSTRAINT IF EXISTS "project_stages_pkey";
ALTER TABLE IF EXISTS ONLY "public"."project_stage_progress" DROP CONSTRAINT IF EXISTS "project_stage_progress_pkey";
ALTER TABLE IF EXISTS ONLY "public"."project_stage_instruments" DROP CONSTRAINT IF EXISTS "project_stage_instruments_pkey";
ALTER TABLE IF EXISTS ONLY "public"."groups" DROP CONSTRAINT IF EXISTS "groups_pkey";
ALTER TABLE IF EXISTS ONLY "public"."group_members" DROP CONSTRAINT IF EXISTS "group_members_pkey";
ALTER TABLE IF EXISTS ONLY "public"."group_comments" DROP CONSTRAINT IF EXISTS "group_comments_pkey";
ALTER TABLE IF EXISTS ONLY "public"."dimensions" DROP CONSTRAINT IF EXISTS "dimensions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."dimensions" DROP CONSTRAINT IF EXISTS "dimensions_name_unique";
ALTER TABLE IF EXISTS ONLY "public"."classes" DROP CONSTRAINT IF EXISTS "classes_pkey";
ALTER TABLE IF EXISTS ONLY "public"."accounts" DROP CONSTRAINT IF EXISTS "accounts_pkey";
ALTER TABLE IF EXISTS ONLY "public"."academic_terms" DROP CONSTRAINT IF EXISTS "academic_terms_pkey";
ALTER TABLE IF EXISTS ONLY "drizzle"."__drizzle_migrations" DROP CONSTRAINT IF EXISTS "__drizzle_migrations_pkey";
ALTER TABLE IF EXISTS "drizzle"."__drizzle_migrations" ALTER COLUMN "id" DROP DEFAULT;
DROP TABLE IF EXISTS "public"."verifications";
DROP TABLE IF EXISTS "public"."users";
DROP TABLE IF EXISTS "public"."user_class_assignments";
DROP TABLE IF EXISTS "public"."template_stage_configs";
DROP TABLE IF EXISTS "public"."template_questions";
DROP TABLE IF EXISTS "public"."template_journal_rubrics";
DROP TABLE IF EXISTS "public"."teacher_feedbacks";
DROP TABLE IF EXISTS "public"."submissions";
DROP TABLE IF EXISTS "public"."sessions";
DROP TABLE IF EXISTS "public"."projects";
DROP TABLE IF EXISTS "public"."project_templates";
DROP TABLE IF EXISTS "public"."project_stages";
DROP TABLE IF EXISTS "public"."project_stage_progress";
DROP TABLE IF EXISTS "public"."project_stage_instruments";
DROP TABLE IF EXISTS "public"."groups";
DROP TABLE IF EXISTS "public"."group_members";
DROP TABLE IF EXISTS "public"."group_comments";
DROP TABLE IF EXISTS "public"."dimensions";
DROP TABLE IF EXISTS "public"."classes";
DROP TABLE IF EXISTS "public"."accounts";
DROP TABLE IF EXISTS "public"."academic_terms";
DROP SEQUENCE IF EXISTS "drizzle"."__drizzle_migrations_id_seq";
DROP TABLE IF EXISTS "drizzle"."__drizzle_migrations";
DROP FUNCTION IF EXISTS "public"."show_db_tree"();
DROP TYPE IF EXISTS "public"."user_role";
DROP TYPE IF EXISTS "public"."term_status";
DROP TYPE IF EXISTS "public"."stage_progress_status";
DROP TYPE IF EXISTS "public"."semester";
DROP TYPE IF EXISTS "public"."project_status";
DROP TYPE IF EXISTS "public"."instrument_type";
DROP SCHEMA IF EXISTS "drizzle";
--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "drizzle";


--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: instrument_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."instrument_type" AS ENUM (
    'JOURNAL',
    'SELF_ASSESSMENT',
    'PEER_ASSESSMENT',
    'OBSERVATION',
    'DAILY_NOTE'
);


--
-- Name: project_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."project_status" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


--
-- Name: semester; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."semester" AS ENUM (
    'ODD',
    'EVEN'
);


--
-- Name: stage_progress_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."stage_progress_status" AS ENUM (
    'LOCKED',
    'IN_PROGRESS',
    'COMPLETED'
);


--
-- Name: term_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."term_status" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."user_role" AS ENUM (
    'ADMIN',
    'TEACHER',
    'STUDENT'
);


--
-- Name: show_db_tree(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."show_db_tree"() RETURNS TABLE("tree_structure" "text")
    LANGUAGE "plpgsql"
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

SET default_table_access_method = "heap";

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";


--
-- Name: academic_terms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."academic_terms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "academic_year" character varying(10) NOT NULL,
    "semester" "public"."semester" NOT NULL,
    "status" "public"."term_status" DEFAULT 'INACTIVE'::"public"."term_status" NOT NULL,
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_id" "text" NOT NULL,
    "provider_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "access_token" "text",
    "refresh_token" "text",
    "id_token" "text",
    "access_token_expires_at" timestamp with time zone,
    "refresh_token_expires_at" timestamp with time zone,
    "scope" "text",
    "password" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."classes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "academic_term_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: dimensions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."dimensions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "created_by_admin_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: group_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."group_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "target_member_id" "uuid" NOT NULL,
    "comment" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."group_members" (
    "group_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "project_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: project_stage_instruments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."project_stage_instruments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_stage_id" "uuid" NOT NULL,
    "instrument_type" "public"."instrument_type" NOT NULL,
    "is_required" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text"
);


--
-- Name: project_stage_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."project_stage_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_stage_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "status" "public"."stage_progress_status" DEFAULT 'LOCKED'::"public"."stage_progress_status" NOT NULL,
    "unlocked_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: project_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."project_stages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "order" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "unlocks_at" timestamp with time zone,
    "due_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: project_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."project_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_name" character varying(255) NOT NULL,
    "description" "text",
    "created_by_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "theme" character varying(255),
    "class_id" "uuid" NOT NULL,
    "teacher_id" "uuid",
    "status" "public"."project_status" DEFAULT 'DRAFT'::"public"."project_status" NOT NULL,
    "published_at" timestamp with time zone,
    "archived_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "template_id" "uuid"
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "token" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ip_address" "text",
    "user_agent" "text"
);


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "project_stage_id" "uuid",
    "target_student_id" "uuid",
    "content" "jsonb" NOT NULL,
    "score" numeric(5,2),
    "feedback" "text",
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "assessed_by" "uuid",
    "assessed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "template_stage_config_id" "uuid",
    "submitted_by" character varying(50) DEFAULT 'STUDENT'::character varying NOT NULL,
    "submitted_by_id" "uuid" NOT NULL
);


--
-- Name: teacher_feedbacks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."teacher_feedbacks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "feedback" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: template_journal_rubrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."template_journal_rubrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "config_id" "uuid" NOT NULL,
    "indicator_text" "text" NOT NULL,
    "criteria" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "dimension_id" "uuid"
);


--
-- Name: template_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."template_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "config_id" "uuid" NOT NULL,
    "question_text" "text" NOT NULL,
    "question_type" character varying(50) DEFAULT 'STATEMENT'::character varying NOT NULL,
    "scoring_guide" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "rubric_criteria" "text",
    "dimension_id" "uuid"
);


--
-- Name: template_stage_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."template_stage_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_id" "uuid" NOT NULL,
    "stage_name" character varying(255) NOT NULL,
    "instrument_type" "public"."instrument_type" NOT NULL,
    "display_order" integer NOT NULL,
    "description" "text",
    "estimated_duration" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: user_class_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."user_class_assignments" (
    "user_id" "uuid" NOT NULL,
    "class_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "role" "public"."user_role" DEFAULT 'STUDENT'::"public"."user_role" NOT NULL,
    "email_verified" boolean DEFAULT false NOT NULL,
    "image" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "identifier" "text" NOT NULL,
    "value" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY "drizzle"."__drizzle_migrations" ("id", "hash", "created_at") FROM stdin;
\.


--
-- Data for Name: academic_terms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."academic_terms" ("id", "academic_year", "semester", "status", "starts_at", "ends_at", "created_at", "updated_at") FROM stdin;
34b9690e-588d-4e7d-a5a7-370c420bf626	2026/2027	EVEN	INACTIVE	2025-09-22 00:00:00+00	2025-09-23 00:00:00+00	2025-09-21 03:10:14.714345+00	2025-09-21 03:10:14.714345+00
9f003434-e392-4a28-ab92-ec9a007c9f09	2027/2028	ODD	INACTIVE	2025-09-26 00:00:00+00	2025-09-26 00:00:00+00	2025-09-21 03:10:38.272949+00	2025-09-21 03:10:38.272949+00
2b105788-1350-40b2-8d25-d8423d6929d0	2027/2028	EVEN	INACTIVE	2025-09-30 00:00:00+00	2025-10-16 00:00:00+00	2025-09-21 03:11:04.264694+00	2025-09-21 03:11:04.264694+00
c1daf6f2-610d-4e48-9d73-0ce1baeef091	2028/2029	ODD	INACTIVE	2025-10-29 00:00:00+00	2025-12-04 00:00:00+00	2025-09-21 03:11:26.320531+00	2025-09-21 03:11:26.320531+00
424ce85d-f4a5-4026-9ae1-b7fb89ce3d93	2026/2027	ODD	INACTIVE	2025-09-16 00:00:00+00	2025-09-18 00:00:00+00	2025-09-19 18:59:13.523156+00	2025-09-19 18:59:13.523156+00
3bc83240-ac6c-4205-8e3a-dbdd44b40674	2027/2029	ODD	INACTIVE	2025-09-28 00:00:00+00	2025-09-30 00:00:00+00	2025-09-28 12:40:18.933662+00	2025-09-28 12:40:18.933662+00
1cea5909-9752-4793-9d27-ba9575b43ac4	2025/2026	EVEN	ACTIVE	2025-09-20 00:00:00+00	2025-09-25 00:00:00+00	2025-09-19 17:41:10.871424+00	2025-09-19 17:41:10.871424+00
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."accounts" ("id", "account_id", "provider_id", "user_id", "access_token", "refresh_token", "id_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "password", "created_at", "updated_at") FROM stdin;
484b3e32-28e9-4096-a3ba-df15a68929f2	cdebd811-1ce2-46c7-96d0-604db5785205	credential	cdebd811-1ce2-46c7-96d0-604db5785205	\N	\N	\N	\N	\N	\N	06c0a28bfd48b4c41fedd99c1df19064:af1f6aad702ad045a6f30eb7ddd17fb89b1d871a50087a3e9522d08bbccde2f4efb1b95cff74413eeecd8e99ed9327f42d7dcbccece3af4cd2de775fc9267391	2025-09-19 17:30:02.601+00	2025-09-19 17:30:02.601+00
5efe6d89-e056-43f7-94d7-4ea02e3b2a82	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	credential	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	\N	\N	\N	\N	\N	\N	b61cd268d4b81484fb01391ecc36f417:abd587487a8513de9c98ad8290ae9fac37ae0aa9cd60129d7cda635e6b1b8660ea040f6a6ba2783408f848e73cf7e3c1016469d757ec341201b3d8951b3322a3	2025-09-20 08:10:40.028+00	2025-09-20 08:10:40.028+00
5e441575-ea87-441d-a5d9-5fbf2369383f	33cff2cd-1a2f-47ce-8f6e-73897ece2392	credential	33cff2cd-1a2f-47ce-8f6e-73897ece2392	\N	\N	\N	\N	\N	\N	61d869ac87d7a3abeb50ea73a9d49b53:851c1aa3d5400d127f274f07d57e3c2a38d597d97e27ce4431eb55f48dedeb2835c3c7a6220853dde1062ba946f3fc5d25c862f63bfab0152569a0cf50405b84	2025-09-20 18:04:05.528+00	2025-09-20 18:04:05.528+00
5d993228-4d27-4ea5-9fb9-f2750842cfdf	03bb2186-485c-4879-a67f-11493306c306	credential	03bb2186-485c-4879-a67f-11493306c306	\N	\N	\N	\N	\N	\N	5113e61c4c9a4cc97ccdc318629d541a:7afd1b56133643998fca1d8f0d4cc7e7cdfdddff2b20c4906105dca1f37e1652739635bfeb182bd34ab9555e1b599c26cfd571b5c939628a39e75af4344f318d	2025-09-20 18:04:23.856+00	2025-09-20 18:04:23.856+00
fa04002b-0aca-4a83-b9e5-3dd2c6d10106	b9f42d60-7346-4119-afa5-f01a867f3c60	credential	b9f42d60-7346-4119-afa5-f01a867f3c60	\N	\N	\N	\N	\N	\N	275872c9deff31b3a8cd3e66d42165b5:d9d2e5b69e6995dc5fa0033bb4e9a51181c755fafb51fb490a27ce9ead0d415217fb0bc7c4ed594db58967dc89cbf7fb9e1f3ac6b6ba5f2c40a92f2b563d18c6	2025-09-20 18:19:35.969+00	2025-09-20 18:19:35.969+00
beba46e9-3e0d-4fd5-87fb-b944b8e5e600	88f509ac-7bae-4713-8890-eae9d775adc4	credential	88f509ac-7bae-4713-8890-eae9d775adc4	\N	\N	\N	\N	\N	\N	22fa236304cfe0a36025fec504003d29:288bdacd5d8127a4da11706b5caff5e1017e7a1b2c6452d6ade10774f557f22d3a742a46cc5f5f1de97a2fc79d79e1ee6bf6235839c010f7e898ac34b12b3189	2025-09-20 18:19:53.251+00	2025-09-20 18:19:53.251+00
41f4a35b-beb6-4309-917b-24c7f96a19d6	7a030f0c-a394-4d95-bf8e-60979d5660e0	credential	7a030f0c-a394-4d95-bf8e-60979d5660e0	\N	\N	\N	\N	\N	\N	25307578934db76609f72d03d2d827e1:752959f78ed280124fc286f20db3e29ecb0326209e9126c78340f3e34f1a887d8a2f818642b9d540a89d75226cd4fb26695c638a5d8ec0ae7863ca1d1c270562	2025-09-21 06:35:35.718+00	2025-09-21 06:35:35.718+00
51f3a659-0b1c-499b-b92f-4935e02a8f71	e0fe36a0-c6eb-48a7-92e0-cb54d59e1cb7	credential	e0fe36a0-c6eb-48a7-92e0-cb54d59e1cb7	\N	\N	\N	\N	\N	\N	e1bc6de4892f710ea7faaa048b887ea7:06beaa270d230d510fdffb5ab99585395ab96cdfd12ba8a601d6f92d8230db9a409c6064b19960950364e6ee92346677a678aa6935b70aa72115be2ff395d99c	2025-09-22 14:52:02.423+00	2025-09-22 14:52:02.423+00
7ffa8fd6-f4ba-47e9-ab2b-b835b2a6c834	ff6d026f-f648-43be-b640-c42e64095ddc	credential	ff6d026f-f648-43be-b640-c42e64095ddc	\N	\N	\N	\N	\N	\N	b8f66d1ace033e4ac62ce31a41526862:b54053cff8655378ee9cec5f4e9425e9692ad1d772dbe37240a69a94047747e42b6522325031b45978a2dc10af811c674c7c848ebacc37c5265caecf68fa6e34	2025-09-22 14:59:53.318+00	2025-09-22 14:59:53.318+00
2132019d-b4fb-4f8b-92a2-26f7839da018	0a056041-ed7c-45d5-a1ca-689467e85b50	credential	0a056041-ed7c-45d5-a1ca-689467e85b50	\N	\N	\N	\N	\N	\N	6872382524cfb4f5360da81ceb9ead5d:e2d1b58943928e80e298b66c0f0f29c443340a4c539a6169f453b5f9207556c92234f21d28fe2c1de08d89f367a93d0625841b2f95a5e5c2250857aabf71e487	2025-09-22 15:00:18.915+00	2025-09-22 15:00:18.915+00
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."classes" ("id", "name", "academic_term_id", "created_at", "updated_at") FROM stdin;
0bf7060f-81bb-4768-9e87-e6da37a8a5cf	X IPA 1	1cea5909-9752-4793-9d27-ba9575b43ac4	2025-09-20 18:19:05.623716+00	2025-09-20 18:19:05.623716+00
3e96522e-34ba-4537-bad6-280219c4d778	Emina 2	424ce85d-f4a5-4026-9ae1-b7fb89ce3d93	2025-09-21 04:17:08.977194+00	2025-09-21 04:17:08.977194+00
548050f4-1189-4cb3-885b-d0d22e81df13	XI IPS 1	1cea5909-9752-4793-9d27-ba9575b43ac4	2025-09-22 14:56:07.77949+00	2025-09-22 14:56:07.77949+00
82913766-f21a-44a9-a4b0-b392ac2aee53	IPAS 1	3bc83240-ac6c-4205-8e3a-dbdd44b40674	2025-09-28 12:42:28.984883+00	2025-09-28 12:42:28.984883+00
\.


--
-- Data for Name: dimensions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."dimensions" ("id", "name", "description", "created_by_admin_id", "created_at", "updated_at") FROM stdin;
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

COPY "public"."group_comments" ("id", "group_id", "author_id", "target_member_id", "comment", "created_at", "updated_at") FROM stdin;
456f2650-7cae-4781-9d25-be3e7e8925ee	eb8d62c8-26d1-488b-8538-19d3a2640ce6	03bb2186-485c-4879-a67f-11493306c306	33cff2cd-1a2f-47ce-8f6e-73897ece2392	ha	2025-10-07 03:16:20.823261+00	2025-10-07 03:16:20.823261+00
2df56b55-f762-4c12-b1fd-bc273d0ef178	eb8d62c8-26d1-488b-8538-19d3a2640ce6	03bb2186-485c-4879-a67f-11493306c306	88f509ac-7bae-4713-8890-eae9d775adc4	hi	2025-10-07 03:16:28.108516+00	2025-10-07 03:16:28.108516+00
f16251a9-9326-4c8b-a477-39fa4eba717c	eb8d62c8-26d1-488b-8538-19d3a2640ce6	03bb2186-485c-4879-a67f-11493306c306	b9f42d60-7346-4119-afa5-f01a867f3c60	hu	2025-10-07 03:16:34.723123+00	2025-10-07 03:16:34.723123+00
8f5809a3-f718-44a5-baa7-98e0aa901b2b	eb8d62c8-26d1-488b-8538-19d3a2640ce6	88f509ac-7bae-4713-8890-eae9d775adc4	33cff2cd-1a2f-47ce-8f6e-73897ece2392	ini so so lah	2025-10-07 03:31:38.343583+00	2025-10-07 03:31:38.343583+00
322561ee-7188-4237-945e-8fc15af15b01	eb8d62c8-26d1-488b-8538-19d3a2640ce6	88f509ac-7bae-4713-8890-eae9d775adc4	b9f42d60-7346-4119-afa5-f01a867f3c60	bad communication	2025-10-07 03:31:53.66757+00	2025-10-07 03:31:53.66757+00
490b7a17-48f7-432b-8eef-c83dcd0fb8d9	eb8d62c8-26d1-488b-8538-19d3a2640ce6	88f509ac-7bae-4713-8890-eae9d775adc4	03bb2186-485c-4879-a67f-11493306c306	bagus bgt sih	2025-10-07 03:31:28.876981+00	2025-10-07 03:32:03.47+00
6540bdf1-21a8-4bbe-9a4e-0f1b786a4294	eb8d62c8-26d1-488b-8538-19d3a2640ce6	b9f42d60-7346-4119-afa5-f01a867f3c60	03bb2186-485c-4879-a67f-11493306c306	ini azis	2025-10-07 03:57:32.45953+00	2025-10-07 03:57:32.45953+00
b1afa37a-48fe-41ae-ab94-f086906e8cc8	eb8d62c8-26d1-488b-8538-19d3a2640ce6	b9f42d60-7346-4119-afa5-f01a867f3c60	33cff2cd-1a2f-47ce-8f6e-73897ece2392	ini ihsan	2025-10-07 03:57:38.292279+00	2025-10-07 03:57:38.292279+00
27556f7d-3e11-42e7-81b2-cb24b0f03666	eb8d62c8-26d1-488b-8538-19d3a2640ce6	b9f42d60-7346-4119-afa5-f01a867f3c60	88f509ac-7bae-4713-8890-eae9d775adc4	ini pardi	2025-10-07 03:57:44.614747+00	2025-10-07 03:57:44.614747+00
\.


--
-- Data for Name: group_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."group_members" ("group_id", "student_id", "joined_at", "updated_at") FROM stdin;
eb8d62c8-26d1-488b-8538-19d3a2640ce6	88f509ac-7bae-4713-8890-eae9d775adc4	2025-10-06 16:36:41.67861+00	\N
eb8d62c8-26d1-488b-8538-19d3a2640ce6	03bb2186-485c-4879-a67f-11493306c306	2025-10-06 16:36:41.67861+00	\N
eb8d62c8-26d1-488b-8538-19d3a2640ce6	b9f42d60-7346-4119-afa5-f01a867f3c60	2025-10-06 16:36:41.67861+00	\N
eb8d62c8-26d1-488b-8538-19d3a2640ce6	33cff2cd-1a2f-47ce-8f6e-73897ece2392	2025-10-06 16:36:41.67861+00	\N
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."groups" ("id", "name", "project_id", "created_at", "updated_at") FROM stdin;
eb8d62c8-26d1-488b-8538-19d3a2640ce6	Alpha	012f1d05-9a26-4b22-81ce-17cd32affa64	2025-10-06 16:36:04.269895+00	2025-10-06 16:36:04.269895+00
\.


--
-- Data for Name: project_stage_instruments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."project_stage_instruments" ("id", "project_stage_id", "instrument_type", "is_required", "created_at", "updated_at", "description") FROM stdin;
0e8c0854-db18-43d7-99dc-a13cf862a749	7470e5fa-3afc-4063-b9cb-713cea5e4498	JOURNAL	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	-
b7b5f1eb-22e6-453a-ae85-092ac786f34b	18e55586-2432-4f9a-bfc9-0808414f0e7e	PEER_ASSESSMENT	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	mendesain peluang2 pengembangan keunggulan produk\n
cb5f299f-a02a-4192-acbb-0973f10e567b	18e55586-2432-4f9a-bfc9-0808414f0e7e	SELF_ASSESSMENT	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	mendesain peluang2 pengembangan keunggulan produk\n
82a4229a-6dac-430f-8f90-27ce5757bee0	18e55586-2432-4f9a-bfc9-0808414f0e7e	OBSERVATION	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	mendesain peluang2 pengembangan keunggulan produk\n
88ee9171-1f22-4b7f-9423-c1ea22116148	51177990-7f7d-4a9e-a9cb-2cd67cfe944b	SELF_ASSESSMENT	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	-
dbd612cf-9021-41a1-b280-9790fffdc2f5	51177990-7f7d-4a9e-a9cb-2cd67cfe944b	PEER_ASSESSMENT	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	-
0c6d44b1-a8cc-4a7b-817a-99f4261310e7	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	SELF_ASSESSMENT	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	-
85888476-01e8-4f75-8e13-147f86e7fd45	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	JOURNAL	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	-
2d542d18-c683-4641-8db6-95d667388fbc	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	OBSERVATION	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	-
6d0e8432-d2bd-4a43-993c-2bc440c7b8f3	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	JOURNAL	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	-
9943a815-092e-4ba8-b3eb-c40e5d706e63	c944cb30-8eb0-4791-891f-18a2715e7c03	OBSERVATION	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	-
90ed05cf-db57-478a-8dc5-3960c274a7ad	d63f39bf-363f-4b17-b0b5-235b9f9fac8d	JOURNAL	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	-
d5d21586-2f40-4a12-8ed6-163642ae1442	d63f39bf-363f-4b17-b0b5-235b9f9fac8d	JOURNAL	t	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00	-
\.


--
-- Data for Name: project_stage_progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."project_stage_progress" ("id", "project_stage_id", "student_id", "status", "unlocked_at", "completed_at", "updated_at") FROM stdin;
606d9067-55ea-4c85-99eb-230b991bd815	18e55586-2432-4f9a-bfc9-0808414f0e7e	03bb2186-485c-4879-a67f-11493306c306	COMPLETED	2025-10-09 03:48:12.858+00	2025-10-09 03:50:19+00	2025-10-09 03:50:19+00
4e702015-1a7f-4212-ba13-03486e8ca158	51177990-7f7d-4a9e-a9cb-2cd67cfe944b	03bb2186-485c-4879-a67f-11493306c306	IN_PROGRESS	2025-10-09 03:50:20.352+00	\N	2025-10-09 03:50:20.352+00
7d27bd4a-f0d8-4a86-86b0-ec646cc40da8	7470e5fa-3afc-4063-b9cb-713cea5e4498	33cff2cd-1a2f-47ce-8f6e-73897ece2392	COMPLETED	2025-10-06 16:38:30.503+00	2025-10-06 16:39:28.754+00	2025-10-06 16:39:28.754+00
9925d336-1a6a-44f9-9f2f-b1ef8295a844	18e55586-2432-4f9a-bfc9-0808414f0e7e	33cff2cd-1a2f-47ce-8f6e-73897ece2392	COMPLETED	2025-10-06 16:39:28.954+00	2025-10-06 17:15:29.675+00	2025-10-06 17:15:29.675+00
9ad6e67c-e278-4309-8cd9-632c455bfb02	51177990-7f7d-4a9e-a9cb-2cd67cfe944b	33cff2cd-1a2f-47ce-8f6e-73897ece2392	COMPLETED	2025-10-06 17:15:29.854+00	2025-10-06 17:16:38.701+00	2025-10-06 17:16:38.701+00
ec5cf96d-9c79-4138-b45d-b9169179b8ab	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	33cff2cd-1a2f-47ce-8f6e-73897ece2392	COMPLETED	2025-10-06 17:16:35.68+00	2025-10-06 17:17:44.323+00	2025-10-06 17:17:44.323+00
cc59b086-780b-4372-809c-79b7d578d47e	c944cb30-8eb0-4791-891f-18a2715e7c03	33cff2cd-1a2f-47ce-8f6e-73897ece2392	COMPLETED	2025-10-06 17:17:44.494+00	2025-10-06 17:17:44.73+00	2025-10-06 17:17:44.73+00
f345c89a-3c6b-49f5-bbd3-6cfd5148a6e4	d63f39bf-363f-4b17-b0b5-235b9f9fac8d	33cff2cd-1a2f-47ce-8f6e-73897ece2392	COMPLETED	2025-10-06 17:17:44.904+00	2025-10-06 17:20:04.104+00	2025-10-06 17:20:04.104+00
0082a8ee-2053-44a2-8a4d-dcb8c7763e0f	7470e5fa-3afc-4063-b9cb-713cea5e4498	88f509ac-7bae-4713-8890-eae9d775adc4	IN_PROGRESS	2025-10-07 00:55:44.22+00	\N	2025-10-07 00:55:44.22041+00
b7333416-d6d7-4c54-9593-dc1c97fc8d14	18e55586-2432-4f9a-bfc9-0808414f0e7e	88f509ac-7bae-4713-8890-eae9d775adc4	LOCKED	\N	\N	2025-10-07 00:55:44.22041+00
7dd3af0b-4545-4f26-846a-635fb570b1ca	51177990-7f7d-4a9e-a9cb-2cd67cfe944b	88f509ac-7bae-4713-8890-eae9d775adc4	LOCKED	\N	\N	2025-10-07 00:55:44.22041+00
f4f85112-e4af-4d7f-8377-6cc246f1e7e3	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	88f509ac-7bae-4713-8890-eae9d775adc4	LOCKED	\N	\N	2025-10-07 00:55:44.22041+00
322fd5ec-8611-41bd-9317-c36337766afa	c944cb30-8eb0-4791-891f-18a2715e7c03	88f509ac-7bae-4713-8890-eae9d775adc4	LOCKED	\N	\N	2025-10-07 00:55:44.22041+00
d6610b5e-ea5b-49b3-82cf-efb4ae0ca76f	d63f39bf-363f-4b17-b0b5-235b9f9fac8d	88f509ac-7bae-4713-8890-eae9d775adc4	LOCKED	\N	\N	2025-10-07 00:55:44.22041+00
bdf9490c-50cd-44a1-8387-506b7ab7142c	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	03bb2186-485c-4879-a67f-11493306c306	LOCKED	\N	\N	2025-10-07 02:38:25.146319+00
ffc05215-75da-43de-94cc-b4d2b31e2635	c944cb30-8eb0-4791-891f-18a2715e7c03	03bb2186-485c-4879-a67f-11493306c306	LOCKED	\N	\N	2025-10-07 02:38:25.146319+00
e63febe2-c0de-4bfc-b032-8030c8b994ad	d63f39bf-363f-4b17-b0b5-235b9f9fac8d	03bb2186-485c-4879-a67f-11493306c306	LOCKED	\N	\N	2025-10-07 02:38:25.146319+00
fdde4753-d925-414e-9b7c-20442956cb74	7470e5fa-3afc-4063-b9cb-713cea5e4498	b9f42d60-7346-4119-afa5-f01a867f3c60	IN_PROGRESS	2025-10-07 03:33:26.043+00	\N	2025-10-07 03:33:25.946201+00
daecf256-260a-4163-8f81-3905c8c0d712	18e55586-2432-4f9a-bfc9-0808414f0e7e	b9f42d60-7346-4119-afa5-f01a867f3c60	LOCKED	\N	\N	2025-10-07 03:33:25.946201+00
88d182f2-b9b7-4202-ab15-34919077d8cc	51177990-7f7d-4a9e-a9cb-2cd67cfe944b	b9f42d60-7346-4119-afa5-f01a867f3c60	LOCKED	\N	\N	2025-10-07 03:33:25.946201+00
c4e729bc-9518-4eed-9d88-036a760bb6e9	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	b9f42d60-7346-4119-afa5-f01a867f3c60	LOCKED	\N	\N	2025-10-07 03:33:25.946201+00
7cb795be-b514-418d-831d-75c075589416	c944cb30-8eb0-4791-891f-18a2715e7c03	b9f42d60-7346-4119-afa5-f01a867f3c60	LOCKED	\N	\N	2025-10-07 03:33:25.946201+00
01494a16-9d65-426d-b127-f7700cc7691b	d63f39bf-363f-4b17-b0b5-235b9f9fac8d	b9f42d60-7346-4119-afa5-f01a867f3c60	LOCKED	\N	\N	2025-10-07 03:33:25.946201+00
263af9ee-2f79-45d8-9c56-05b8dda3e22c	7470e5fa-3afc-4063-b9cb-713cea5e4498	03bb2186-485c-4879-a67f-11493306c306	COMPLETED	2025-10-07 02:38:25.269+00	2025-10-09 03:48:11.536+00	2025-10-09 03:48:11.536+00
\.


--
-- Data for Name: project_stages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."project_stages" ("id", "project_id", "order", "name", "description", "unlocks_at", "due_at", "created_at", "updated_at") FROM stdin;
7470e5fa-3afc-4063-b9cb-713cea5e4498	012f1d05-9a26-4b22-81ce-17cd32affa64	1	Start with the essential question:	-	\N	\N	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00
18e55586-2432-4f9a-bfc9-0808414f0e7e	012f1d05-9a26-4b22-81ce-17cd32affa64	2	Design a plan for the project	mendesain peluang2 pengembangan keunggulan produk\n	\N	\N	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00
51177990-7f7d-4a9e-a9cb-2cd67cfe944b	012f1d05-9a26-4b22-81ce-17cd32affa64	3	Create a schedule	-	\N	\N	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00
11934f78-bb61-49ef-872b-d3e5b7ea9b3d	012f1d05-9a26-4b22-81ce-17cd32affa64	4	Monitor the students and the progress of the project	-	\N	\N	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00
c944cb30-8eb0-4791-891f-18a2715e7c03	012f1d05-9a26-4b22-81ce-17cd32affa64	5	Assess the output:presentasi di kelas	-	\N	\N	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00
d63f39bf-363f-4b17-b0b5-235b9f9fac8d	012f1d05-9a26-4b22-81ce-17cd32affa64	6	Evaluate the experiences: review kegiatan	-	\N	\N	2025-10-06 16:35:21.881695+00	2025-10-06 16:35:21.881695+00
\.


--
-- Data for Name: project_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."project_templates" ("id", "template_name", "description", "created_by_id", "is_active", "created_at", "updated_at") FROM stdin;
1a961b4a-f120-4391-b4d8-b08eb3e92b21	Default	-	\N	t	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."projects" ("id", "title", "description", "theme", "class_id", "teacher_id", "status", "published_at", "archived_at", "created_at", "updated_at", "template_id") FROM stdin;
012f1d05-9a26-4b22-81ce-17cd32affa64	Project Atsiri	-	-	0bf7060f-81bb-4768-9e87-e6da37a8a5cf	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	PUBLISHED	\N	\N	2025-10-06 16:35:21.881695+00	2025-10-06 16:38:25.493+00	1a961b4a-f120-4391-b4d8-b08eb3e92b21
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."sessions" ("id", "token", "user_id", "expires_at", "created_at", "updated_at", "ip_address", "user_agent") FROM stdin;
69728146-f853-41fe-9106-0e8d85a39c5f	Bgvz2QS4PYheHfBMe72QDE5foc3QUFIk	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-15 15:03:00.027+00	2025-10-08 15:03:00.032+00	2025-10-08 15:03:00.032+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
e4a56801-0aa6-4328-bdd9-36cabac09a92	EJxGOmYkBCcMl6jpIIUGvTfswyTBpTRW	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-01 00:51:03.322+00	2025-09-24 00:51:03.324+00	2025-09-24 00:51:03.325+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
e06e6fac-9492-4da9-827e-644d6e4b89bf	kWUi40X7yA5oso6BAWt4NpTYdypjECWD	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-09-27 08:10:40.101+00	2025-09-20 08:10:40.102+00	2025-09-20 08:10:40.102+00		
e05243f1-8eea-4ea4-a669-bd54f57ed450	Tq4ifh9cwBHmMB2Zpa4YtK2G7MmVW61S	03bb2186-485c-4879-a67f-11493306c306	2025-10-16 03:50:17.076+00	2025-10-09 03:50:17.076+00	2025-10-09 03:50:17.076+00	114.10.152.167	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
1ae06cbd-2e68-4e25-832f-64683b7ce90d	fXcHhtcLH3EqZRLErLpkhbxouXpodBmS	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-16 03:52:57.064+00	2025-10-09 03:52:57.064+00	2025-10-09 03:52:57.064+00	103.95.6.163	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
7fc9008a-4592-4591-b0b5-5114a3341fab	yKKHmChvqeVYHohkqjYmyQf1deQgwKOT	03bb2186-485c-4879-a67f-11493306c306	2025-10-16 03:55:30.473+00	2025-10-09 03:55:30.473+00	2025-10-09 03:55:30.473+00	114.10.150.104	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
64475640-0e78-461a-80d0-79c7d74c82ff	GmSiPJfFcb9sD7RL3qAXuuY9Wdunk64x	03bb2186-485c-4879-a67f-11493306c306	2025-10-16 04:00:13.328+00	2025-10-09 04:00:13.328+00	2025-10-09 04:00:13.328+00	114.10.150.104	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
23a435d8-e849-46a7-a2c2-c74f6be35e21	2NVjPDmdhUUzoR3N46JLAf8enVP8bPPt	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-16 04:02:08.567+00	2025-10-09 04:02:08.568+00	2025-10-09 04:02:08.568+00	114.10.150.104	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
40a5830d-f732-4518-ad6d-4aef7a087edc	s0HpkgsnE5h9OCbl2IzprC8HiCYKN7M5	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-16 04:03:59.605+00	2025-10-09 04:03:59.606+00	2025-10-09 04:03:59.606+00	114.10.150.104	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
e6273b32-b4d1-48d1-ae88-3c27f774de20	7pPry836lfsqndUeSF9nPsEwpRgrUZq5	33cff2cd-1a2f-47ce-8f6e-73897ece2392	2025-10-04 10:29:29.963+00	2025-09-27 10:29:29.967+00	2025-09-27 10:29:29.967+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
0ba5ca8f-f9d9-439a-8806-4b0506515401	ce6jEtkzCtBZCcqqjqYToeP3I1FC6g5b	33cff2cd-1a2f-47ce-8f6e-73897ece2392	2025-09-27 18:04:05.597+00	2025-09-20 18:04:05.598+00	2025-09-20 18:04:05.598+00		
c7c05aea-0b73-40b1-9394-09604415cad1	YxPidDc8qG7BK66z5T0zI1UA0Awfspxv	03bb2186-485c-4879-a67f-11493306c306	2025-09-27 18:04:23.921+00	2025-09-20 18:04:23.922+00	2025-09-20 18:04:23.922+00		
a8cd543a-aaff-4526-a9b6-f59a2f68b306	y7ebZCBxYEnHQ0GVrJXwEYqUE98tlZk9	b9f42d60-7346-4119-afa5-f01a867f3c60	2025-09-27 18:19:36.052+00	2025-09-20 18:19:36.052+00	2025-09-20 18:19:36.052+00		
1b6b8a6f-44d8-44af-b0f3-85ae6d3bc40a	IQJQMyPeDA1Yq4Gw1LaskJsQJX3weBCt	88f509ac-7bae-4713-8890-eae9d775adc4	2025-09-27 18:19:53.318+00	2025-09-20 18:19:53.319+00	2025-09-20 18:19:53.319+00		
78502872-0ade-4ee5-bb5b-b76da8c38d9a	qu5cyFuqj0YlR0J7oR8AazKv1OcaWl6y	7a030f0c-a394-4d95-bf8e-60979d5660e0	2025-09-28 06:35:35.782+00	2025-09-21 06:35:35.783+00	2025-09-21 06:35:35.783+00		
9fcb1c29-c1c3-4e96-a82a-3e813181ccbb	JWLhMVQVuwc1HFViSbbM5tjkZMZJp51P	ff6d026f-f648-43be-b640-c42e64095ddc	2025-09-29 14:59:53.417+00	2025-09-22 14:59:53.418+00	2025-09-22 14:59:53.418+00		
1eb48ca8-b524-49fb-96ea-2f73938122b3	N9ONdpwOu9eMFMyHybgPe9w61G3hGNZN	0a056041-ed7c-45d5-a1ca-689467e85b50	2025-09-29 15:00:18.999+00	2025-09-22 15:00:19+00	2025-09-22 15:00:19+00		
c3ece56d-9c11-4e4d-b630-18cfa0a59021	RL2WNy4CkAEWDzjM2EH4aFNIMz3imMT3	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-04 10:16:16.979+00	2025-09-23 17:48:39.2+00	2025-09-27 10:16:16.979+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
51177cb2-a635-4622-aafc-6561e96397e6	XL95afFWcjxhJ7FuQJx68wBbsQr5e9TZ	cdebd811-1ce2-46c7-96d0-604db5785205	2025-09-29 16:19:03.376+00	2025-09-22 16:19:03.381+00	2025-09-22 16:19:03.381+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
8fcbea04-b51b-463b-9b80-3b8175828b1e	JkNvQ2uL3FxqbHKmwrJPIqqMuRjju70z	b9f42d60-7346-4119-afa5-f01a867f3c60	2025-10-04 11:21:14.021+00	2025-09-27 11:21:14.026+00	2025-09-27 11:21:14.026+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
57b57242-a6d1-4683-b7c9-bdf424d3c0e9	UW2KioDHPl29ae4FgRWGhaARobwqIFF6	b9f42d60-7346-4119-afa5-f01a867f3c60	2025-10-04 12:56:06.768+00	2025-09-27 12:56:06.77+00	2025-09-27 12:56:06.77+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
72366f3b-2ca3-4cef-9cb8-1bd6eec31750	CyTRj9YT1z7tsQJ5rGqySpga7BUJzTtf	33cff2cd-1a2f-47ce-8f6e-73897ece2392	2025-10-04 18:50:56.74+00	2025-09-27 18:50:56.741+00	2025-09-27 18:50:56.741+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
9ef4e75a-f1a2-4839-8009-da05ca67dbc7	yeadP5c5j70YFlD2iUccgriK9jKkMFAO	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-05 11:09:21.96+00	2025-09-27 10:05:34.71+00	2025-09-28 11:09:21.96+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
11df8277-d4a4-4096-bd2c-92f412e4f736	pD67A1sAHcaeTtrNwXzD6RyG7Mhzs4We	cdebd811-1ce2-46c7-96d0-604db5785205	2025-10-05 11:10:19.343+00	2025-09-27 10:34:18.527+00	2025-09-28 11:10:19.343+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
52b5184b-a596-4d06-bc42-40b4eb14f793	PV4b3bXRnNjLCdm4eHtbmsfvuqs62rhW	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-05 13:07:33.605+00	2025-09-28 13:07:33.606+00	2025-09-28 13:07:33.606+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
d6cd54e6-8bb4-4250-a0e1-bf938f30a457	45vAKyhbdhdTPKrKQVoRnGN7VkGSxrBf	03bb2186-485c-4879-a67f-11493306c306	2025-10-06 15:07:25.35+00	2025-09-29 15:07:25.351+00	2025-09-29 15:07:25.351+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
064847d4-a4fa-4b3d-a01a-523e042cbed4	rEl6L1V6CUda5mcyNXja9Ybv7QikYztE	03bb2186-485c-4879-a67f-11493306c306	2025-09-29 18:06:40.71+00	2025-09-22 18:06:40.714+00	2025-09-22 18:06:40.714+00		Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36
e9223f6d-9f40-4c75-b558-209de072b992	mN6ChYAkyRbgteaYupppJv2b2gBQzht0	cdebd811-1ce2-46c7-96d0-604db5785205	2025-10-06 15:07:48.296+00	2025-09-29 15:07:48.297+00	2025-09-29 15:07:48.297+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
75beee2d-9e87-449c-b79a-adba772ec62c	lrioETR37VlaI4HCU4apjbmFbfYlSmN3	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-09-29 18:44:46.306+00	2025-09-22 18:44:46.306+00	2025-09-22 18:44:46.306+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
5e8f6aee-1119-41f3-82e1-5ec90b65ea51	gSF4Nt7Sl3uzDlbbRt401Zxu8D1gpyZ6	e0fe36a0-c6eb-48a7-92e0-cb54d59e1cb7	2025-09-30 10:40:05.195+00	2025-09-23 10:40:05.195+00	2025-09-23 10:40:05.195+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
f4188e5d-c674-4ed8-9c0a-6d44b792ef0b	yc2xOsrGpMJCZ3M9pAAnyA5e1Q3J4l27	88f509ac-7bae-4713-8890-eae9d775adc4	2025-10-08 13:38:25.438+00	2025-10-01 13:38:25.439+00	2025-10-01 13:38:25.439+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
26d60e19-9532-42f8-acd7-120bf63f1960	Qicb742sOvNMWVa7t0E211HcHePhi0HZ	88f509ac-7bae-4713-8890-eae9d775adc4	2025-10-08 13:38:39.702+00	2025-10-01 13:38:39.703+00	2025-10-01 13:38:39.703+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
571b235b-e844-4c91-bcfb-6cfeb1e6728d	z4o0TYpvqzMRfPMVv6fnLAAteraQyuxm	33cff2cd-1a2f-47ce-8f6e-73897ece2392	2025-10-13 12:25:11.41+00	2025-10-05 09:49:25.901+00	2025-10-06 12:25:11.41+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
ecd07031-c206-433a-8fd7-23c7bac5a5da	eli3bSQ487i8PdJLQmqQft8BsmwbVIj0	cdebd811-1ce2-46c7-96d0-604db5785205	2025-10-13 14:08:21.542+00	2025-10-05 13:08:12.136+00	2025-10-06 14:08:21.542+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
329b91ff-ff61-4f11-be33-4f90f2d4ddcd	qvoFV3mgcfyoMiipkpNkBVCKhbgfm2TO	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-14 04:00:29.55+00	2025-10-07 04:00:29.551+00	2025-10-07 04:00:29.551+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
0ead53e3-0d82-4afa-8c0d-32c4143f284a	Kh2VpmO4MlbVNeHnvhT1BFKKv4CRu4dI	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-14 14:32:56.482+00	2025-10-07 14:32:56.483+00	2025-10-07 14:32:56.483+00		Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
072159ee-a421-4286-a9a3-1a25339ff790	Hp79VFrJMbJZ4RUccP2Cmo017yisv5hF	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	2025-10-16 04:02:43.409+00	2025-10-09 04:02:43.409+00	2025-10-09 04:02:43.409+00	103.95.6.163	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."submissions" ("id", "project_id", "project_stage_id", "target_student_id", "content", "score", "feedback", "submitted_at", "assessed_by", "assessed_at", "created_at", "updated_at", "template_stage_config_id", "submitted_by", "submitted_by_id") FROM stdin;
0e2cd6bf-61ea-4910-b722-21cc2a3d690c	012f1d05-9a26-4b22-81ce-17cd32affa64	51177990-7f7d-4a9e-a9cb-2cd67cfe944b	\N	{"answers": [4, 2, 3, 4]}	\N	\N	2025-10-06 17:16:24.470634+00	\N	\N	2025-10-06 17:16:24.470634+00	2025-10-06 17:16:24.470634+00	6241ccf2-8589-4be3-9a18-f6ea3f174ddd	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
747c6cff-bd93-4e15-bba1-20257fefd5e5	012f1d05-9a26-4b22-81ce-17cd32affa64	51177990-7f7d-4a9e-a9cb-2cd67cfe944b	03bb2186-485c-4879-a67f-11493306c306	{"answers": [3]}	\N	\N	2025-10-06 17:16:34.708267+00	\N	\N	2025-10-06 17:16:34.708267+00	2025-10-06 17:16:34.708267+00	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
a3c5770b-a418-4bd9-bace-7600b24eb1e5	012f1d05-9a26-4b22-81ce-17cd32affa64	51177990-7f7d-4a9e-a9cb-2cd67cfe944b	88f509ac-7bae-4713-8890-eae9d775adc4	{"answers": [2]}	\N	\N	2025-10-06 17:16:36.472876+00	\N	\N	2025-10-06 17:16:36.472876+00	2025-10-06 17:16:36.472876+00	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
140bb8b5-a71e-4bc2-9f58-e98c738c6f65	012f1d05-9a26-4b22-81ce-17cd32affa64	51177990-7f7d-4a9e-a9cb-2cd67cfe944b	b9f42d60-7346-4119-afa5-f01a867f3c60	{"answers": [2]}	\N	\N	2025-10-06 17:16:37.924827+00	\N	\N	2025-10-06 17:16:37.924827+00	2025-10-06 17:16:37.924827+00	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
765e968f-4332-4453-b14c-ccf897fddcaf	012f1d05-9a26-4b22-81ce-17cd32affa64	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	\N	{"answers": [4, 2, 1, 4, 3, 2, 3, 2]}	\N	\N	2025-10-06 17:17:02.09449+00	\N	\N	2025-10-06 17:17:02.09449+00	2025-10-06 17:17:02.09449+00	d14942a4-50b1-4451-9c14-d8b828ef58f1	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
1e3c5691-1508-4653-8030-64c88b75e06a	012f1d05-9a26-4b22-81ce-17cd32affa64	18e55586-2432-4f9a-bfc9-0808414f0e7e	03bb2186-485c-4879-a67f-11493306c306	{"answers": [3, 4]}	\N	\N	2025-10-06 17:14:38.508679+00	\N	\N	2025-10-06 17:14:38.508679+00	2025-10-06 17:14:38.508679+00	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
c7a1e337-27b9-4f84-b832-f7afd13ffa38	012f1d05-9a26-4b22-81ce-17cd32affa64	18e55586-2432-4f9a-bfc9-0808414f0e7e	88f509ac-7bae-4713-8890-eae9d775adc4	{"answers": [2, 3]}	\N	\N	2025-10-06 17:14:39.729235+00	\N	\N	2025-10-06 17:14:39.729235+00	2025-10-06 17:14:39.729235+00	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
9cfe1a94-ede8-4a5a-b421-c1cae0b392b2	012f1d05-9a26-4b22-81ce-17cd32affa64	18e55586-2432-4f9a-bfc9-0808414f0e7e	b9f42d60-7346-4119-afa5-f01a867f3c60	{"answers": [3, 3]}	\N	\N	2025-10-06 17:14:41.049084+00	\N	\N	2025-10-06 17:14:41.049084+00	2025-10-06 17:14:41.049084+00	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
e08198ad-f6ee-470b-b9ea-f619db52324c	012f1d05-9a26-4b22-81ce-17cd32affa64	18e55586-2432-4f9a-bfc9-0808414f0e7e	\N	{"answers": [4, 2, 3, 2, 4, 2, 1]}	\N	\N	2025-10-06 17:15:28.983747+00	\N	\N	2025-10-06 17:15:28.983747+00	2025-10-06 17:15:28.983747+00	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
4f7bd778-519c-4996-89ff-ff06e9a3326f	012f1d05-9a26-4b22-81ce-17cd32affa64	d63f39bf-363f-4b17-b0b5-235b9f9fac8d	\N	{"text": "haloldklfjlkjdfljf"}	\N	\N	2025-10-06 17:19:21.892022+00	\N	\N	2025-10-06 17:19:21.892022+00	2025-10-06 17:19:21.892022+00	ebc153f4-148e-4d39-9218-95a7f26ecf83	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
d30950aa-8455-4ff6-84ed-2036fef69e0d	012f1d05-9a26-4b22-81ce-17cd32affa64	d63f39bf-363f-4b17-b0b5-235b9f9fac8d	\N	{"text": "bulbff"}	\N	\N	2025-10-06 17:20:03.270038+00	\N	\N	2025-10-06 17:20:03.270038+00	2025-10-06 17:20:03.270038+00	a35a14b0-aa7e-4680-aaa3-69a1c92ffc3f	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
1a3a2c19-6ff0-4e60-bbf2-371e95cddf82	012f1d05-9a26-4b22-81ce-17cd32affa64	7470e5fa-3afc-4063-b9cb-713cea5e4498	\N	{"text": "Halooo 1", "grades": [{"score": 3, "rubric_id": "eb46c4dc-5a2b-4c0b-b443-65197589f80b"}, {"score": 2, "rubric_id": "8bb6fc49-77b2-4652-bb4f-921146725d16"}]}	3.00	\N	2025-10-06 16:39:27.958299+00	\N	\N	2025-10-06 16:39:27.958299+00	2025-10-08 15:29:35.426+00	790ddfc1-9fce-420b-a7ef-77136652865b	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
bb58bfa0-cdf7-4f93-98e7-7cd3a096383c	012f1d05-9a26-4b22-81ce-17cd32affa64	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	33cff2cd-1a2f-47ce-8f6e-73897ece2392	{"answers": [3]}	\N	\N	2025-10-08 15:30:20.831485+00	\N	\N	2025-10-08 15:30:20.831485+00	2025-10-08 15:30:20.831485+00	f3bb6068-e563-4079-a149-112a7f67d26d	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
3ac094fd-6a02-483d-914a-4d259c1b94e5	012f1d05-9a26-4b22-81ce-17cd32affa64	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	03bb2186-485c-4879-a67f-11493306c306	{"answers": [2]}	\N	\N	2025-10-08 15:30:21.839877+00	\N	\N	2025-10-08 15:30:21.839877+00	2025-10-08 15:30:21.839877+00	f3bb6068-e563-4079-a149-112a7f67d26d	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
a1e248cd-2384-45fb-b68f-f06faaf13d17	012f1d05-9a26-4b22-81ce-17cd32affa64	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	88f509ac-7bae-4713-8890-eae9d775adc4	{"answers": [2]}	\N	\N	2025-10-08 15:30:22.719258+00	\N	\N	2025-10-08 15:30:22.719258+00	2025-10-08 15:30:22.719258+00	f3bb6068-e563-4079-a149-112a7f67d26d	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
99382ee5-54ae-4f27-8de4-cbe592357086	012f1d05-9a26-4b22-81ce-17cd32affa64	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	b9f42d60-7346-4119-afa5-f01a867f3c60	{"answers": [1]}	\N	\N	2025-10-08 15:30:23.528498+00	\N	\N	2025-10-08 15:30:23.528498+00	2025-10-08 15:30:23.528498+00	f3bb6068-e563-4079-a149-112a7f67d26d	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
4ad10ed4-cbd6-40a6-a383-6b5254eaf601	012f1d05-9a26-4b22-81ce-17cd32affa64	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	\N	{"text": "testttiinnggg", "grades": [{"score": 3, "rubric_id": "2d298aa5-9f5f-4675-942d-220bdadb7faa"}]}	3.00	\N	2025-10-06 17:17:34.184352+00	\N	\N	2025-10-06 17:17:34.184352+00	2025-10-08 15:30:36.945+00	3b03ee0e-8ca4-4922-95a4-9c009718bf47	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
60bcd5cc-2e70-4b93-89a8-71c6b385870d	012f1d05-9a26-4b22-81ce-17cd32affa64	11934f78-bb61-49ef-872b-d3e5b7ea9b3d	\N	{"text": "ululuuuu", "grades": [{"score": 4, "rubric_id": "2d298aa5-9f5f-4675-942d-220bdadb7faa"}]}	4.00	\N	2025-10-06 17:17:43.516748+00	\N	\N	2025-10-06 17:17:43.516748+00	2025-10-08 15:30:52.284+00	0eea90c0-7658-46db-b655-b9fecf5deb69	STUDENT	33cff2cd-1a2f-47ce-8f6e-73897ece2392
9adbe9dd-f81e-429e-add2-9084a7cdbed7	012f1d05-9a26-4b22-81ce-17cd32affa64	c944cb30-8eb0-4791-891f-18a2715e7c03	33cff2cd-1a2f-47ce-8f6e-73897ece2392	{"answers": [4, 2]}	\N	\N	2025-10-08 15:31:08.664659+00	\N	\N	2025-10-08 15:31:08.664659+00	2025-10-08 15:31:08.664659+00	f3bb6068-e563-4079-a149-112a7f67d26d	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
2f650660-1922-4093-8309-8c431dbd2d45	012f1d05-9a26-4b22-81ce-17cd32affa64	c944cb30-8eb0-4791-891f-18a2715e7c03	03bb2186-485c-4879-a67f-11493306c306	{"answers": [3, 3]}	\N	\N	2025-10-08 15:31:09.677434+00	\N	\N	2025-10-08 15:31:09.677434+00	2025-10-08 15:31:09.677434+00	f3bb6068-e563-4079-a149-112a7f67d26d	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
670ad201-5b7a-440d-8513-a7dc97304598	012f1d05-9a26-4b22-81ce-17cd32affa64	c944cb30-8eb0-4791-891f-18a2715e7c03	88f509ac-7bae-4713-8890-eae9d775adc4	{"answers": [3, 3]}	\N	\N	2025-10-08 15:31:10.429755+00	\N	\N	2025-10-08 15:31:10.429755+00	2025-10-08 15:31:10.429755+00	f3bb6068-e563-4079-a149-112a7f67d26d	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
d58ffb9f-659b-4dc4-a2e1-db58790c6fa3	012f1d05-9a26-4b22-81ce-17cd32affa64	c944cb30-8eb0-4791-891f-18a2715e7c03	b9f42d60-7346-4119-afa5-f01a867f3c60	{"answers": [3, 3]}	\N	\N	2025-10-08 15:31:11.467471+00	\N	\N	2025-10-08 15:31:11.467471+00	2025-10-08 15:31:11.467471+00	f3bb6068-e563-4079-a149-112a7f67d26d	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
c025b7c3-63a0-4956-b63d-dd852aeda757	012f1d05-9a26-4b22-81ce-17cd32affa64	18e55586-2432-4f9a-bfc9-0808414f0e7e	33cff2cd-1a2f-47ce-8f6e-73897ece2392	{"answers": [3, 4]}	\N	\N	2025-10-09 03:49:10.57207+00	\N	\N	2025-10-09 03:49:10.57207+00	2025-10-09 03:49:10.57207+00	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	STUDENT	03bb2186-485c-4879-a67f-11493306c306
c7555319-a849-4c23-9c26-4f81860d80c6	012f1d05-9a26-4b22-81ce-17cd32affa64	18e55586-2432-4f9a-bfc9-0808414f0e7e	88f509ac-7bae-4713-8890-eae9d775adc4	{"answers": [2, 3]}	\N	\N	2025-10-09 03:49:18.799785+00	\N	\N	2025-10-09 03:49:18.799785+00	2025-10-09 03:49:18.799785+00	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	STUDENT	03bb2186-485c-4879-a67f-11493306c306
7f56295c-c9d2-40dc-bd42-9e7480bdbc2b	012f1d05-9a26-4b22-81ce-17cd32affa64	18e55586-2432-4f9a-bfc9-0808414f0e7e	b9f42d60-7346-4119-afa5-f01a867f3c60	{"answers": [3, 4]}	\N	\N	2025-10-09 03:49:27.006982+00	\N	\N	2025-10-09 03:49:27.006982+00	2025-10-09 03:49:27.006982+00	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	STUDENT	03bb2186-485c-4879-a67f-11493306c306
0e10adc3-9a12-422b-ac2f-c4df661b9a6b	012f1d05-9a26-4b22-81ce-17cd32affa64	18e55586-2432-4f9a-bfc9-0808414f0e7e	\N	{"answers": [4, 1, 2, 3, 1, 3, 4]}	\N	\N	2025-10-09 03:50:13.608922+00	\N	\N	2025-10-09 03:50:13.608922+00	2025-10-09 03:50:13.608922+00	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	STUDENT	03bb2186-485c-4879-a67f-11493306c306
52a33fd8-870d-42bb-8ea8-c534fe35fabf	012f1d05-9a26-4b22-81ce-17cd32affa64	51177990-7f7d-4a9e-a9cb-2cd67cfe944b	\N	{"answers": [4, 2, 2, 2]}	\N	\N	2025-10-09 03:52:33.174447+00	\N	\N	2025-10-09 03:52:33.174447+00	2025-10-09 03:52:33.174447+00	6241ccf2-8589-4be3-9a18-f6ea3f174ddd	STUDENT	03bb2186-485c-4879-a67f-11493306c306
5e498a6d-2bc1-4515-afec-54923a04ecde	012f1d05-9a26-4b22-81ce-17cd32affa64	7470e5fa-3afc-4063-b9cb-713cea5e4498	\N	{"text": "haloo", "grades": [{"score": 3, "rubric_id": "eb46c4dc-5a2b-4c0b-b443-65197589f80b"}, {"score": 2, "rubric_id": "8bb6fc49-77b2-4652-bb4f-921146725d16"}]}	3.00	\N	2025-10-09 03:48:05.217544+00	\N	\N	2025-10-09 03:48:05.217544+00	2025-10-09 03:56:14.566+00	790ddfc1-9fce-420b-a7ef-77136652865b	STUDENT	03bb2186-485c-4879-a67f-11493306c306
a325afff-5684-4b90-8c3a-753d22b41ec5	012f1d05-9a26-4b22-81ce-17cd32affa64	18e55586-2432-4f9a-bfc9-0808414f0e7e	33cff2cd-1a2f-47ce-8f6e-73897ece2392	{"answers": [4, 2]}	\N	\N	2025-10-09 03:57:35.793+00	\N	\N	2025-10-08 15:30:02.96952+00	2025-10-09 03:57:35.793+00	f3bb6068-e563-4079-a149-112a7f67d26d	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
d6580800-019a-4886-8e51-0f61227947c6	012f1d05-9a26-4b22-81ce-17cd32affa64	18e55586-2432-4f9a-bfc9-0808414f0e7e	03bb2186-485c-4879-a67f-11493306c306	{"answers": [3, 2]}	\N	\N	2025-10-09 03:57:40.828+00	\N	\N	2025-10-08 15:30:03.879924+00	2025-10-09 03:57:40.828+00	f3bb6068-e563-4079-a149-112a7f67d26d	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
7dc22eed-372b-4cb6-92bf-94aaae9ac209	012f1d05-9a26-4b22-81ce-17cd32affa64	18e55586-2432-4f9a-bfc9-0808414f0e7e	88f509ac-7bae-4713-8890-eae9d775adc4	{"answers": [3, 3]}	\N	\N	2025-10-09 03:57:45.811+00	\N	\N	2025-10-08 15:30:04.873773+00	2025-10-09 03:57:45.811+00	f3bb6068-e563-4079-a149-112a7f67d26d	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
f577d50d-fc45-4390-b016-6ec8d53cc121	012f1d05-9a26-4b22-81ce-17cd32affa64	18e55586-2432-4f9a-bfc9-0808414f0e7e	b9f42d60-7346-4119-afa5-f01a867f3c60	{"answers": [3, 3]}	\N	\N	2025-10-09 03:57:50.853+00	\N	\N	2025-10-08 15:30:05.745711+00	2025-10-09 03:57:50.853+00	f3bb6068-e563-4079-a149-112a7f67d26d	TEACHER	3dae7273-63b9-4dfd-bc39-5ba42a1bb723
\.


--
-- Data for Name: teacher_feedbacks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."teacher_feedbacks" ("id", "teacher_id", "student_id", "project_id", "feedback", "created_at", "updated_at") FROM stdin;
49777dfe-cebd-491d-a01f-07ac33cfea2f	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	33cff2cd-1a2f-47ce-8f6e-73897ece2392	012f1d05-9a26-4b22-81ce-17cd32affa64	coba lbh aktif	2025-10-07 14:06:07.918+00	2025-10-07 14:18:50.125+00
48aa54d1-6be5-45be-9708-dde07a147b2e	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	03bb2186-485c-4879-a67f-11493306c306	012f1d05-9a26-4b22-81ce-17cd32affa64	coba lagi	2025-10-07 14:31:26.419+00	2025-10-07 14:31:26.419+00
9583b54f-0750-40f6-b1a6-dbfdd24ffd68	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	88f509ac-7bae-4713-8890-eae9d775adc4	012f1d05-9a26-4b22-81ce-17cd32affa64	sudha okeyy sih	2025-10-08 14:08:26.522+00	2025-10-08 14:08:26.522+00
164bb46a-d756-4592-988d-4f056a56f582	3dae7273-63b9-4dfd-bc39-5ba42a1bb723	b9f42d60-7346-4119-afa5-f01a867f3c60	012f1d05-9a26-4b22-81ce-17cd32affa64	okeyyy bisaaaaa	2025-10-08 14:08:41.342+00	2025-10-08 14:08:41.342+00
\.


--
-- Data for Name: template_journal_rubrics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."template_journal_rubrics" ("id", "config_id", "indicator_text", "criteria", "created_at", "updated_at", "dimension_id") FROM stdin;
eb46c4dc-5a2b-4c0b-b443-65197589f80b	790ddfc1-9fce-420b-a7ef-77136652865b	Mengajukan pertanyaan terbuka yang relevan dengan masalah utama proyek\n	{"1": "Pertanyaan tidak relevan, tidak mencerminkan pemahaman terhadap masalah proyek\\n", "2": "Pertanyaan relevan namun bersifat tertutup, hanya memunculkan jawaban terbatas\\n", "3": "Pertanyaan terbuka, relevan, belum mengarah langsung ke masalah utama proyek\\n", "4": "Pertanyaan terbuka, relevan, berkaitan langsung dengan masalah utama proyek\\n"}	2025-10-04 18:19:15.717897+00	2025-10-04 18:19:15.717897+00	\N
8bb6fc49-77b2-4652-bb4f-921146725d16	790ddfc1-9fce-420b-a7ef-77136652865b	Mengajukan pertanyaan yang mendorong eksplorasi lebih lanjut\n	{"1": "Pertanyaan hanya meminta informasi faktual yang mudah diperoleh (contohnya tentang definisi, data tunggal)\\n", "2": "Pertanyaan hanya membutuhkan penelusuran sederhana antara lain dari membaca artikel atau buku\\n", "3": "Pertanyaan mendorong eksplorasi, meskipun belum mengarah pada eksperimen nyata\\n", "4": "Pertanyaan mengarah pada penyelidikan mendalam, dapat mendorong pengumpulan data maupun eksperimen nyata\\n"}	2025-10-04 18:20:30.308597+00	2025-10-04 18:20:30.308597+00	\N
ebd9b8d2-d670-467f-b4d7-50cfcb8f23c0	0eea90c0-7658-46db-b655-b9fecf5deb69	Menunjukkan rasa syukur terhadap kekayaan alam\n	{"1": "Tidak mengungkapkan rasa syukur, merasa biasa saja\\n", "2": "Mengungkapkan rasa syukur secara singkat atau sekadar formalitas, tanpa menyadari tanggung jawab menjaga alam\\n", "3": "Mengungkapkan rasa syukur secara mendalam, namun belum menyadari tanggung jawab menjaga alam\\n", "4": "Mengungkapkan rasa syukur secara mendalam dan menyadari tanggung jawab menjaga alam\\n"}	2025-10-04 18:22:37.841549+00	2025-10-04 18:22:37.841549+00	\N
2d298aa5-9f5f-4675-942d-220bdadb7faa	3b03ee0e-8ca4-4922-95a4-9c009718bf47	Memodifikasi rencana kerja berdasarkan kondisi baru atau kendala yang muncul\n	{"1": "Tidak menceritakan kendala dengan jelas atau tidak menyebutkan solusi yang relevan. Refleksi tidak menggambarkan adanya modifikasi rencana kerja atau kurang mencerminkan pemahaman terhadap situasi\\n", "2": "Menceritakan kendala secara umum, solusi yang diberikan kurang sesuai atau kurang jelas penerapannya\\n", "3": "Menceritakan secara jelas kendala yang dihadapi, menyebutkan solusi yang relevan, diterapkan, menunjukkan adanya penyesuaian terhadap kondisi, namun belum sepenuhnya inovatif\\n", "4": "Menceritakan secara jelas kendala yang dihadapi, menunjukkan pemahaman terhadap situasi, dan menyebutkan solusi yang relevan, kreatif (pemikiran baru, unik), dan diterapkan oleh kelompok\\n"}	2025-10-04 18:23:43.43321+00	2025-10-04 18:23:43.43321+00	\N
7bc8faaf-b988-4bcb-86f6-84b0839c30ea	ebc153f4-148e-4d39-9218-95a7f26ecf83	Mengidentifikasi dimensi profil lulusan yang berkembang ataupun belum berkembang selama pelaksanaan proyek\n	{"1": "Tidak menyebutkan dimensi yang berkembang maupun belum berkembang.\\n", "2": "Menyebutkan dimensi namun kurang tepat atau tidak sesuai dengan pengalaman proyek.\\n", "3": "Menyebutkan dimensi yang berkembang ataupun belum berkembang, namun tanpa penjelasan.\\n", "4": "Menyebutkan dengan jelas dimensi yang berkembang ataupun belum berkembang, serta memberikan contoh atau alasan logis.\\n"}	2025-10-04 18:25:15.572714+00	2025-10-04 18:25:15.572714+00	\N
4e6333d0-e188-4955-9cf8-8aa4fdf0374e	a35a14b0-aa7e-4680-aaa3-69a1c92ffc3f	Menyusun rencana pengembangan diri berdasarkan pengalaman proyek	{"1": "Tidak menyebutkan rencana pengembangan diri atau respon yang diberikan tidak sesuai dengan konteks pengembangan diri.\\n", "2": "Menyusun rencana pengembangan diri namun kurang relevan dengan pengalaman proyek\\n", "3": "Menyusun rencana pengembangan diri yang relevan namun bersifat umum atau kurang spesifik\\n", "4": "Menyusun rencana pengembangan diri secara jelas, spesifik, dan relevan dengan pengalaman proyek\\n"}	2025-10-04 18:26:41.556135+00	2025-10-04 18:26:41.556135+00	\N
77c450c9-1728-4363-96c4-1d24dea93b57	a35a14b0-aa7e-4680-aaa3-69a1c92ffc3f	Mengidentifikasi sumber daya atau dukungan yang dibutuhkan untuk pengembangan diri maupun pembelajaran selanjutnya\n	{"1": "Tidak menyebutkan sumber daya atau dukungan yang dibutuhkan, atau respon yang diberikan tidak sesuai dengan konteks pengembangan diri\\n", "2": "Menyebutkan dukungan, namun masih umum atau tidak jelas relevansinya dengan pengembangan diri\\n", "3": "Menyebutkan dukungan yang relevan, tetapi belum dijelaskan bagaimana dukungan tersebut akan digunakan\\n", "4": "Menyebutkan beragam dukungan yang relevan, menjelaskan bagaimana dukungan itu membantu pengembangan diri.\\n"}	2025-10-04 18:27:14.581818+00	2025-10-04 18:27:14.581818+00	\N
\.


--
-- Data for Name: template_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."template_questions" ("id", "config_id", "question_text", "question_type", "scoring_guide", "created_at", "updated_at", "rubric_criteria", "dimension_id") FROM stdin;
fa8f9632-5ee0-4b9b-969e-01bf4a54b2f7	790ddfc1-9fce-420b-a7ef-77136652865b	<p>Anda bersama guru dan teman-teman telah merumuskan masalah utama dalam proyek kali ini. Dari masalah tersebut, pertanyaan-pertanyaan apa saja yang terlintas dalam pikiran Anda?</p>	ESSAY_PROMPT	\N	2025-10-04 16:45:33.449972+00	2025-10-04 16:45:33.449972+00	\N	7f4e9777-eee0-4f28-9718-97d592c4d097
2ed041d4-c410-4055-aaef-38bf953deb6a	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	<p>Teman saya menunjukkan sikap menghargai saat mendengarkan pendapat teman kelompok.</p>	STATEMENT	\N	2025-10-04 16:51:38.576178+00	2025-10-04 16:51:38.576178+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
3be75cfc-e318-4dfd-aef9-1fd7f9e5136b	c9fad00b-f3f4-413e-a753-8d9b183c2fd6	<p>Teman saya memberikan tanggapan yang membangun terhadap ide anggota kelompok untuk memperkuat hasil diskusi kelompok.</p>	STATEMENT	\N	2025-10-04 16:52:45.057181+00	2025-10-04 16:52:45.057181+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
5beb7380-dddf-47e6-ad91-1d5752c608f7	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saya menyampaikan pendapat tanpa menyalahkan atau meremehkan pendapat teman. Jika ada ide yang menurut saya kurang tepat, saya mengungkapkan pendapat dengan cara yang tidak membuat teman merasa malu atau disalahkan.</p>	STATEMENT	\N	2025-10-04 16:57:09.723625+00	2025-10-04 16:57:44.634+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
82ef60e3-5101-4e06-a96e-92f2283f2eaf	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saat berdiskusi, saya berusaha menghindari perdebatan yang tidak perlu agar target pembuatan rencana proyek tercapai.</p>	STATEMENT	\N	2025-10-04 16:58:51.691821+00	2025-10-04 16:58:51.691821+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
2fa1bac3-6c37-4934-aaa0-c8b70b687605	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saya mengarahkan diskusi agar tetap fokus pada topik pembuatan rencana proyek.</p>	STATEMENT	\N	2025-10-04 16:59:05.442936+00	2025-10-04 16:59:05.442936+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
4fa24d37-7e5c-4513-8b4d-c308a190938b	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saat berdiskusi tentang rencana proyek, saya menyampaikan ide-ide yang muncul dari pemikiran sendiri, bukan meniru ide teman.</p>	STATEMENT	\N	2025-10-04 16:59:25.751986+00	2025-10-04 16:59:25.751986+00	\N	d6db1aca-7539-4c13-88d3-e5c4d1ebda49
bfdf93be-02c1-4218-895b-0f249e10f498	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saat membuat rencana proyek, saya berusaha memikirkan ide dari sudut pandang yang berbeda.</p>	STATEMENT	\N	2025-10-04 16:59:39.803924+00	2025-10-04 16:59:39.803924+00	\N	d6db1aca-7539-4c13-88d3-e5c4d1ebda49
62a3554f-2a05-4cd6-be3a-f485949cd92f	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saya menyampaikan ide kreatif, tetapi tetap mempertimbangkan kemungkinan diterapkan</p>	STATEMENT	\N	2025-10-04 17:51:56.938713+00	2025-10-04 17:51:56.938713+00	\N	d6db1aca-7539-4c13-88d3-e5c4d1ebda49
01ca8a9b-42ae-4921-94a1-553ee32a425e	095fcf1d-aee4-49fb-a5c8-70e9b39703d7	<p>Saya berusaha menyampaikan ide yang masuk akal dan dapat dikerjakan</p>	STATEMENT	\N	2025-10-04 17:52:44.15604+00	2025-10-04 17:52:44.15604+00	\N	d6db1aca-7539-4c13-88d3-e5c4d1ebda49
a74cdc48-6d06-4277-a2e5-00931f646d57	f3bb6068-e563-4079-a149-112a7f67d26d	<p>Murid menyampaikan data, fakta, atau informasi yang berkaitan dengan proyek.</p>	STATEMENT	\N	2025-10-04 17:54:29.771349+00	2025-10-04 17:54:29.771349+00	[{"score":4,"description":"Konsisten menunjukkan perilaku"},{"score":3,"description":"Sering menunjukkan perilaku"},{"score":2,"description":"Kadang-kadang menunjukkan perilaku"},{"score":1,"description":"Tidak menunjukkan perilaku"}]	7f4e9777-eee0-4f28-9718-97d592c4d097
5db7aea2-a0d8-4c3a-a1cf-e84fec6149b7	f3bb6068-e563-4079-a149-112a7f67d26d	<p>Murid mengajukan pertanyaan kepada guru atau teman untuk memperjelas informasi.</p>	STATEMENT	\N	2025-10-04 17:55:49.621292+00	2025-10-04 17:55:49.621292+00	[{"score":4,"description":"Konsisten menunjukkan perilaku"},{"score":3,"description":"Sering menunjukkan perilaku"},{"score":2,"description":"Kadang-kadang menunjukkan perilaku"},{"score":1,"description":"Tidak menunjukkan perilaku"}]	7f4e9777-eee0-4f28-9718-97d592c4d097
b4439e44-8041-4b00-8ba6-776d6ec6b97f	6241ccf2-8589-4be3-9a18-f6ea3f174ddd	<p>Saya menyampaikan usul&nbsp; secara jelas agar mudah dipahami teman.</p>	STATEMENT	\N	2025-10-04 18:04:30.050514+00	2025-10-04 18:04:30.050514+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
3fec942c-59cd-4d6d-9d1e-a68b6ada731a	6241ccf2-8589-4be3-9a18-f6ea3f174ddd	<p>Saat tidak setuju dengan usul teman, saya menyampaikan dengan cara yang santun.</p>	STATEMENT	\N	2025-10-04 18:04:55.181697+00	2025-10-04 18:05:49.706+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
5a90f1a4-00aa-4a37-9dfa-628e59db4315	6241ccf2-8589-4be3-9a18-f6ea3f174ddd	<p>Saya tidak memaksakan pendapat</p>	STATEMENT	\N	2025-10-04 18:06:11.377914+00	2025-10-04 18:06:11.377914+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
93852818-467c-41c3-b79a-32c89af8273e	6241ccf2-8589-4be3-9a18-f6ea3f174ddd	<p>Saya tetap terlibat dan tidak diam saja saat kelompok merancang  proyek.</p>	STATEMENT	\N	2025-10-04 18:06:49.483693+00	2025-10-04 18:06:49.483693+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
6b4a2e46-01de-4d78-942d-217643d96135	b96f81dc-f8ac-42db-ab36-2dea79e6e780	<p>Teman saya aktif terlibat dalam diskusi dan ikut memberikan pendapat.</p>	STATEMENT	\N	2025-10-04 18:07:21.611504+00	2025-10-04 18:07:21.611504+00	\N	c1ff32f1-1b06-43b1-a51f-c41e8393a543
38116f7a-1851-4d08-992d-b9d87c97b07d	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya menjalankan kesepakatan kelompok tanpa harus diingatkan atau ditekan oleh teman.</p>	STATEMENT	\N	2025-10-04 18:07:50.743656+00	2025-10-04 18:07:50.743656+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
1d27f1aa-a00e-481a-af7f-1b79c56b3bf0	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya aktif terlibat menyelesaikan proyek sesuai rencana kelompok sebagai bentuk tanggung jawab pribadi.</p>	STATEMENT	\N	2025-10-04 18:08:01.980798+00	2025-10-04 18:08:01.980798+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
c51da34e-b2b5-4037-9bd0-c285e1f983e7	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya mengerjakan tugas kelompok dengan sungguh-sungguh, bukan asal selesai.</p>	STATEMENT	\N	2025-10-04 18:08:24.210215+00	2025-10-04 18:08:24.210215+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
e7a3a6a2-2f3a-48d0-aaae-8742683b91fc	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya memperhatikan kualitas hasil kerja saya agar tidak merepotkan teman kelompok.</p>	STATEMENT	\N	2025-10-04 18:08:36.205593+00	2025-10-04 18:08:36.205593+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
66674b48-046d-45fc-be86-fa2c8d1b1f04	0eea90c0-7658-46db-b655-b9fecf5deb69	<p>Saat memanfaatkan bahan dari alam untuk proyek ini, apakah Anda merasa bersyukur atas karunia dari Tuhan Yang Maha Esa dan menyadari tanggung jawab untuk menjaga alam? Atau Anda merasa biasa saja? Ceritakan perasaan Anda.</p>	ESSAY_PROMPT	\N	2025-10-04 18:09:25.925294+00	2025-10-04 18:09:25.925294+00	\N	088a1baa-1614-4f5a-acc4-769d4046b57f
bbe117f9-a641-4367-9057-c0ac4f3f487f	6e401eff-e3f7-4fc9-8414-ca3b78d6d1b1	<p>Murid menjalankan tanggung jawab sesuai peran yang disepakati dalam kelompok.</p>	STATEMENT	\N	2025-10-04 18:10:38.165515+00	2025-10-04 18:10:38.165515+00	[{"score":4,"description":"Konsisten menunjukkan perilaku"},{"score":3,"description":"Sering menunjukkan perilaku"},{"score":2,"description":"Kadang-kadang menunjukkan perilaku"},{"score":1,"description":"Tidak menunjukkan perilaku"}]	e0ba6943-f5e5-4532-99a2-d38686511d52
32459ca3-064b-46e4-a8f2-5616e7ee3b2c	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya memantau apakah kelompok saya sudah berjalan sesuai rencana.</p>	STATEMENT	\N	2025-10-04 18:11:27.930955+00	2025-10-04 18:11:27.930955+00	\N	e0ba6943-f5e5-4532-99a2-d38686511d52
8933921d-8ba0-472f-aa66-a833ec033507	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Jika ada kendala dalam kelompok, saya berinisiatif memberikan solusi atau ide untuk mengatasinya.</p>	STATEMENT	\N	2025-10-04 18:11:42.367704+00	2025-10-04 18:11:42.367704+00	\N	e0ba6943-f5e5-4532-99a2-d38686511d52
d9c1987e-41df-4081-b9b1-574fa0597f1b	3b03ee0e-8ca4-4922-95a4-9c009718bf47	<p>Produk yang dibuat tentu masih sangat sederhana, apakah anda mempunyai ide untuk memodifikasi produk tersebut? Ide-ide apa saja yang muncul?</p>	ESSAY_PROMPT	\N	2025-10-04 18:12:47.829029+00	2025-10-04 18:12:47.829029+00	\N	d6db1aca-7539-4c13-88d3-e5c4d1ebda49
dd94d813-d102-420d-81ff-6049c4d7fef0	56ac1baf-b8f2-42d0-a72b-23d350b8bdfe	<p>Murid menjelaskan keterkaitan produk dengan pertanyaan yang dirumuskan pada awal pembelajaran.</p>	STATEMENT	\N	2025-10-04 18:15:19.39781+00	2025-10-04 18:15:19.39781+00	[{"score":4,"description":"Menjelaskan dengan jelas dan logis (disertai alasan ilmiah) keterkaitan antara produk dengan pertanyaan awal, penjelasan menunjukkan pemahaman yang mendalam."},{"score":3,"description":"Menjelaskan keterkaitan antara produk dan pertanyaan awal dengan cukup jelas, meskipun kurang mendalam atau kurang lengkap."},{"score":2,"description":"Menyebutkan keterkaitan produk dengan pertanyaan awal secara singkat, namun penjelasannya kurang logis atau tidak spesifik."},{"score":1,"description":"Tidak menjelaskan keterkaitan antara produk dan pertanyaan awal."}]	7f4e9777-eee0-4f28-9718-97d592c4d097
d5c908d9-bca1-4fa0-8b91-9d6528755b36	56ac1baf-b8f2-42d0-a72b-23d350b8bdfe	<p>Murid merumuskan saran perbaikan terhadap  produk yang dihasilkan.</p>	STATEMENT	\N	2025-10-04 18:16:16.637723+00	2025-10-04 18:16:16.637723+00	[{"score":4,"description":"Merumuskan saran perbaikan yang jelas, logis, dan tepat terhadap prosedur dan produk"},{"score":3,"description":"Merumuskan saran perbaikan yang jelas, logis, dan tepat terhadap prosedur atau produk"},{"score":2,"description":"Saran perbaikan kurang relevan atau terlalu umum."},{"score":1,"description":"Tidak memberikan saran perbaikan"}]	7f4e9777-eee0-4f28-9718-97d592c4d097
80e1729d-5f76-41e5-a0a6-2e7e051c656d	ebc153f4-148e-4d39-9218-95a7f26ecf83	<p>Ceritakan, dimensi profil lulusan apa saja yang berkembang dalam diri Anda selama proyek? Apakah ada dimensi yang menurut Anda belum berkembang optimal, ceritakan dimensi apa?</p>	ESSAY_PROMPT	\N	2025-10-04 18:16:44.120354+00	2025-10-04 18:16:44.120354+00	\N	a35fb937-753b-4cc0-831d-8db0ee76cbfc
32a2f652-9c64-409f-83cc-32d8b8ade800	a35a14b0-aa7e-4680-aaa3-69a1c92ffc3f	<p>Berdasarkan pengalaman yang didapat selama proyek, Apa rencana pengembangan diri yang ingin Anda lakukan?<br>Apa saja dukungan atau bantuan yang Anda butuhkan untuk mendukung pengembangan diri ke depan?</p>	ESSAY_PROMPT	\N	2025-10-04 18:17:40.747913+00	2025-10-04 18:17:40.747913+00	\N	a35fb937-753b-4cc0-831d-8db0ee76cbfc
71a5a50a-29cb-42ae-9770-ff0d3a03cdad	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya melatih keterampilan dalam proses destilasi minyak atsiri</p>	STATEMENT	\N	2025-10-06 14:51:50.731047+00	2025-10-06 14:51:50.731047+00	\N	a35fb937-753b-4cc0-831d-8db0ee76cbfc
fec13908-8cbc-42e3-ae85-c0a34f7ac133	d14942a4-50b1-4451-9c14-d8b828ef58f1	<p>Saya melatih keterampilan dalam mencampur minyak atsiri dengan bahan lainnya sesuai formulasi dengan teliti.</p>	STATEMENT	\N	2025-10-06 14:52:19.940866+00	2025-10-06 14:52:19.940866+00	\N	a35fb937-753b-4cc0-831d-8db0ee76cbfc
\.


--
-- Data for Name: template_stage_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."template_stage_configs" ("id", "template_id", "stage_name", "instrument_type", "display_order", "description", "estimated_duration", "created_at", "updated_at") FROM stdin;
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
56ac1baf-b8f2-42d0-a72b-23d350b8bdfe	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Assess the output:presentasi di kelas	OBSERVATION	11	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
ebc153f4-148e-4d39-9218-95a7f26ecf83	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Evaluate the experiences: review kegiatan	JOURNAL	12	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
a35a14b0-aa7e-4680-aaa3-69a1c92ffc3f	1a961b4a-f120-4391-b4d8-b08eb3e92b21	Evaluate the experiences: review kegiatan	JOURNAL	13	-	2	2025-10-04 15:56:53.902048+00	2025-10-04 15:56:53.902048+00
\.


--
-- Data for Name: user_class_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."user_class_assignments" ("user_id", "class_id", "assigned_at") FROM stdin;
3dae7273-63b9-4dfd-bc39-5ba42a1bb723	0bf7060f-81bb-4768-9e87-e6da37a8a5cf	2025-09-20 18:20:10.656504+00
33cff2cd-1a2f-47ce-8f6e-73897ece2392	0bf7060f-81bb-4768-9e87-e6da37a8a5cf	2025-09-20 18:20:10.656504+00
03bb2186-485c-4879-a67f-11493306c306	0bf7060f-81bb-4768-9e87-e6da37a8a5cf	2025-09-20 18:20:10.656504+00
88f509ac-7bae-4713-8890-eae9d775adc4	0bf7060f-81bb-4768-9e87-e6da37a8a5cf	2025-09-20 18:20:10.656504+00
b9f42d60-7346-4119-afa5-f01a867f3c60	0bf7060f-81bb-4768-9e87-e6da37a8a5cf	2025-09-20 18:20:10.656504+00
3dae7273-63b9-4dfd-bc39-5ba42a1bb723	3e96522e-34ba-4537-bad6-280219c4d778	2025-09-21 05:47:57.887359+00
33cff2cd-1a2f-47ce-8f6e-73897ece2392	3e96522e-34ba-4537-bad6-280219c4d778	2025-09-21 05:47:57.887359+00
b9f42d60-7346-4119-afa5-f01a867f3c60	3e96522e-34ba-4537-bad6-280219c4d778	2025-09-21 05:47:57.887359+00
03bb2186-485c-4879-a67f-11493306c306	3e96522e-34ba-4537-bad6-280219c4d778	2025-09-21 05:47:57.887359+00
3dae7273-63b9-4dfd-bc39-5ba42a1bb723	548050f4-1189-4cb3-885b-d0d22e81df13	2025-09-22 14:56:40.67796+00
33cff2cd-1a2f-47ce-8f6e-73897ece2392	548050f4-1189-4cb3-885b-d0d22e81df13	2025-09-22 14:56:40.67796+00
03bb2186-485c-4879-a67f-11493306c306	548050f4-1189-4cb3-885b-d0d22e81df13	2025-09-22 14:56:40.67796+00
b9f42d60-7346-4119-afa5-f01a867f3c60	548050f4-1189-4cb3-885b-d0d22e81df13	2025-09-22 14:56:40.67796+00
3dae7273-63b9-4dfd-bc39-5ba42a1bb723	82913766-f21a-44a9-a4b0-b392ac2aee53	2025-09-28 12:42:28.984883+00
88f509ac-7bae-4713-8890-eae9d775adc4	82913766-f21a-44a9-a4b0-b392ac2aee53	2025-09-28 12:42:28.984883+00
0a056041-ed7c-45d5-a1ca-689467e85b50	82913766-f21a-44a9-a4b0-b392ac2aee53	2025-09-28 12:42:28.984883+00
33cff2cd-1a2f-47ce-8f6e-73897ece2392	82913766-f21a-44a9-a4b0-b392ac2aee53	2025-09-28 12:42:28.984883+00
b9f42d60-7346-4119-afa5-f01a867f3c60	82913766-f21a-44a9-a4b0-b392ac2aee53	2025-09-28 12:42:28.984883+00
03bb2186-485c-4879-a67f-11493306c306	82913766-f21a-44a9-a4b0-b392ac2aee53	2025-09-28 12:42:28.984883+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."users" ("id", "name", "email", "role", "email_verified", "image", "created_at", "updated_at") FROM stdin;
cdebd811-1ce2-46c7-96d0-604db5785205	ihsan	ihsansyafiul@gmail.com	ADMIN	f	\N	2025-09-19 17:30:02.564+00	2025-09-19 17:30:02.564+00
3dae7273-63b9-4dfd-bc39-5ba42a1bb723	Andry	andry@breakitall.biz.id	TEACHER	f	\N	2025-09-20 08:10:39.976+00	2025-09-20 08:10:39.976+00
88f509ac-7bae-4713-8890-eae9d775adc4	pardi	pardi@breakitall.biz.id	STUDENT	f	\N	2025-09-20 18:19:53.023+00	2025-09-20 18:19:53.023+00
7a030f0c-a394-4d95-bf8e-60979d5660e0	Prabowo aneh	prabroro@gmail.com	TEACHER	f	\N	2025-09-21 06:35:35.628+00	2025-09-21 06:35:35.628+00
ff6d026f-f648-43be-b640-c42e64095ddc	lisa	lisa@gmail.com	TEACHER	f	\N	2025-09-22 14:59:53.221+00	2025-09-22 14:59:53.221+00
0a056041-ed7c-45d5-a1ca-689467e85b50	jenie	jenie@gmail.com	STUDENT	f	\N	2025-09-22 15:00:18.84+00	2025-09-22 15:00:18.84+00
e0fe36a0-c6eb-48a7-92e0-cb54d59e1cb7	anjeli	anjeli@gmail.com	ADMIN	f	\N	2025-09-22 14:52:02.216+00	2025-09-22 14:52:02.216+00
03bb2186-485c-4879-a67f-11493306c306	Abdul Aziz	aziz@breakitall.biz.id	STUDENT	f	\N	2025-09-20 18:04:23.787+00	2025-09-20 18:04:23.787+00
b9f42d60-7346-4119-afa5-f01a867f3c60	Budi Raharjo Wibowo	budi@breakitall.biz.id	STUDENT	f	\N	2025-09-20 18:19:35.73+00	2025-09-20 18:19:35.73+00
33cff2cd-1a2f-47ce-8f6e-73897ece2392	Ihsan Syafiul Umam	ihsan@breakitall.biz.id	STUDENT	f	\N	2025-09-20 18:04:05.459+00	2025-09-20 18:04:05.459+00
\.


--
-- Data for Name: verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."verifications" ("id", "identifier", "value", "expires_at", "created_at", "updated_at") FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('"drizzle"."__drizzle_migrations_id_seq"', 6, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");


--
-- Name: academic_terms academic_terms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."academic_terms"
    ADD CONSTRAINT "academic_terms_pkey" PRIMARY KEY ("id");


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");


--
-- Name: dimensions dimensions_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."dimensions"
    ADD CONSTRAINT "dimensions_name_unique" UNIQUE ("name");


--
-- Name: dimensions dimensions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."dimensions"
    ADD CONSTRAINT "dimensions_pkey" PRIMARY KEY ("id");


--
-- Name: group_comments group_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."group_comments"
    ADD CONSTRAINT "group_comments_pkey" PRIMARY KEY ("id");


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("group_id", "student_id");


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");


--
-- Name: project_stage_instruments project_stage_instruments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_stage_instruments"
    ADD CONSTRAINT "project_stage_instruments_pkey" PRIMARY KEY ("id");


--
-- Name: project_stage_progress project_stage_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_stage_progress"
    ADD CONSTRAINT "project_stage_progress_pkey" PRIMARY KEY ("id");


--
-- Name: project_stages project_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_stages"
    ADD CONSTRAINT "project_stages_pkey" PRIMARY KEY ("id");


--
-- Name: project_templates project_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_templates"
    ADD CONSTRAINT "project_templates_pkey" PRIMARY KEY ("id");


--
-- Name: project_templates project_templates_template_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_templates"
    ADD CONSTRAINT "project_templates_template_name_unique" UNIQUE ("template_name");


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");


--
-- Name: sessions sessions_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_token_unique" UNIQUE ("token");


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_pkey" PRIMARY KEY ("id");


--
-- Name: teacher_feedbacks teacher_feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."teacher_feedbacks"
    ADD CONSTRAINT "teacher_feedbacks_pkey" PRIMARY KEY ("id");


--
-- Name: teacher_feedbacks teacher_feedbacks_teacher_student_project_idx; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."teacher_feedbacks"
    ADD CONSTRAINT "teacher_feedbacks_teacher_student_project_idx" UNIQUE ("teacher_id", "student_id", "project_id");


--
-- Name: template_journal_rubrics template_journal_rubrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."template_journal_rubrics"
    ADD CONSTRAINT "template_journal_rubrics_pkey" PRIMARY KEY ("id");


--
-- Name: template_questions template_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."template_questions"
    ADD CONSTRAINT "template_questions_pkey" PRIMARY KEY ("id");


--
-- Name: template_stage_configs template_stage_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."template_stage_configs"
    ADD CONSTRAINT "template_stage_configs_pkey" PRIMARY KEY ("id");


--
-- Name: user_class_assignments user_class_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_class_assignments"
    ADD CONSTRAINT "user_class_assignments_pkey" PRIMARY KEY ("user_id", "class_id");


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_unique" UNIQUE ("email");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


--
-- Name: verifications verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."verifications"
    ADD CONSTRAINT "verifications_pkey" PRIMARY KEY ("id");


--
-- Name: academic_terms_year_semester_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "academic_terms_year_semester_idx" ON "public"."academic_terms" USING "btree" ("academic_year", "semester");


--
-- Name: classes_name_term_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "classes_name_term_idx" ON "public"."classes" USING "btree" ("name", "academic_term_id");


--
-- Name: group_comments_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "group_comments_idx" ON "public"."group_comments" USING "btree" ("group_id", "target_member_id");


--
-- Name: project_stage_progress_student_stage_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "project_stage_progress_student_stage_idx" ON "public"."project_stage_progress" USING "btree" ("project_stage_id", "student_id");


--
-- Name: project_stages_project_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "project_stages_project_order_idx" ON "public"."project_stages" USING "btree" ("project_id", "order");


--
-- Name: teacher_feedbacks_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "teacher_feedbacks_project_idx" ON "public"."teacher_feedbacks" USING "btree" ("project_id");


--
-- Name: teacher_feedbacks_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "teacher_feedbacks_student_idx" ON "public"."teacher_feedbacks" USING "btree" ("student_id");


--
-- Name: teacher_feedbacks_teacher_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "teacher_feedbacks_teacher_idx" ON "public"."teacher_feedbacks" USING "btree" ("teacher_id");


--
-- Name: template_stage_configs_template_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "template_stage_configs_template_order_idx" ON "public"."template_stage_configs" USING "btree" ("template_id", "display_order");


--
-- Name: accounts accounts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: classes classes_academic_term_id_academic_terms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_academic_term_id_academic_terms_id_fk" FOREIGN KEY ("academic_term_id") REFERENCES "public"."academic_terms"("id") ON DELETE RESTRICT;


--
-- Name: dimensions dimensions_created_by_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."dimensions"
    ADD CONSTRAINT "dimensions_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: group_comments group_comments_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."group_comments"
    ADD CONSTRAINT "group_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: group_comments group_comments_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."group_comments"
    ADD CONSTRAINT "group_comments_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;


--
-- Name: group_comments group_comments_target_member_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."group_comments"
    ADD CONSTRAINT "group_comments_target_member_id_users_id_fk" FOREIGN KEY ("target_member_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: group_members group_members_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;


--
-- Name: group_members group_members_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: groups groups_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: project_stage_instruments project_stage_instruments_project_stage_id_project_stages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_stage_instruments"
    ADD CONSTRAINT "project_stage_instruments_project_stage_id_project_stages_id_fk" FOREIGN KEY ("project_stage_id") REFERENCES "public"."project_stages"("id") ON DELETE CASCADE;


--
-- Name: project_stage_progress project_stage_progress_project_stage_id_project_stages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_stage_progress"
    ADD CONSTRAINT "project_stage_progress_project_stage_id_project_stages_id_fk" FOREIGN KEY ("project_stage_id") REFERENCES "public"."project_stages"("id") ON DELETE CASCADE;


--
-- Name: project_stage_progress project_stage_progress_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_stage_progress"
    ADD CONSTRAINT "project_stage_progress_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: project_stages project_stages_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_stages"
    ADD CONSTRAINT "project_stages_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: project_templates project_templates_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_templates"
    ADD CONSTRAINT "project_templates_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: projects projects_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;


--
-- Name: projects projects_teacher_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: projects projects_template_id_project_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_template_id_project_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."project_templates"("id") ON DELETE RESTRICT;


--
-- Name: sessions sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: submissions submissions_assessed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_assessed_by_users_id_fk" FOREIGN KEY ("assessed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: submissions submissions_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: submissions submissions_project_stage_id_project_stages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_project_stage_id_project_stages_id_fk" FOREIGN KEY ("project_stage_id") REFERENCES "public"."project_stages"("id") ON DELETE SET NULL;


--
-- Name: submissions submissions_submitted_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: submissions submissions_target_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_target_student_id_users_id_fk" FOREIGN KEY ("target_student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: submissions submissions_template_stage_config_id_template_stage_configs_id_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_template_stage_config_id_template_stage_configs_id_" FOREIGN KEY ("template_stage_config_id") REFERENCES "public"."template_stage_configs"("id") ON DELETE SET NULL;


--
-- Name: teacher_feedbacks teacher_feedbacks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."teacher_feedbacks"
    ADD CONSTRAINT "teacher_feedbacks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: teacher_feedbacks teacher_feedbacks_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."teacher_feedbacks"
    ADD CONSTRAINT "teacher_feedbacks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: teacher_feedbacks teacher_feedbacks_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."teacher_feedbacks"
    ADD CONSTRAINT "teacher_feedbacks_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: template_journal_rubrics template_journal_rubrics_config_id_template_stage_configs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."template_journal_rubrics"
    ADD CONSTRAINT "template_journal_rubrics_config_id_template_stage_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."template_stage_configs"("id") ON DELETE CASCADE;


--
-- Name: template_journal_rubrics template_journal_rubrics_dimension_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."template_journal_rubrics"
    ADD CONSTRAINT "template_journal_rubrics_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id") ON DELETE SET NULL;


--
-- Name: template_questions template_questions_config_id_template_stage_configs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."template_questions"
    ADD CONSTRAINT "template_questions_config_id_template_stage_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."template_stage_configs"("id") ON DELETE CASCADE;


--
-- Name: template_questions template_questions_dimension_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."template_questions"
    ADD CONSTRAINT "template_questions_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id") ON DELETE SET NULL;


--
-- Name: template_stage_configs template_stage_configs_template_id_project_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."template_stage_configs"
    ADD CONSTRAINT "template_stage_configs_template_id_project_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."project_templates"("id") ON DELETE CASCADE;


--
-- Name: user_class_assignments user_class_assignments_class_id_classes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_class_assignments"
    ADD CONSTRAINT "user_class_assignments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;


--
-- Name: user_class_assignments user_class_assignments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_class_assignments"
    ADD CONSTRAINT "user_class_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict nyEQCTCr9sfvmTKTcQLulXRO0ardqAonxogVkYCgnvacDKrs1q2rTu8Fsy2cR0x

