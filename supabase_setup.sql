-- City Academy Supabase Setup Script

-- 1. Create tables
CREATE TABLE IF NOT EXISTS "assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer,
	"assigned_class" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"attachment_url" text,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "classes_name_unique" UNIQUE("name")
);

CREATE TABLE IF NOT EXISTS "gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"description" text
);

CREATE TABLE IF NOT EXISTS "password_reset_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"status" text NOT NULL,
	"created_at" bigint NOT NULL,
	CONSTRAINT "password_reset_requests_token_unique" UNIQUE("token")
);

CREATE TABLE IF NOT EXISTS "results" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"term" text NOT NULL,
	"session" text NOT NULL,
	"first_ca" real,
	"second_ca" real,
	"exams" real,
	"total" real,
	"average" real,
	"score" real NOT NULL,
	"grade" text NOT NULL,
	"teacher_comments" text
);

CREATE TABLE IF NOT EXISTS "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"mission" text,
	"vision" text,
	"about" text,
	"phone" text,
	"email" text,
	"facebook_url" text,
	"twitter_url" text,
	"instagram_url" text,
	"linkedin_url" text,
	"logo_url" text
);

CREATE TABLE IF NOT EXISTS "site_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "site_visits_date_unique" UNIQUE("date")
);

CREATE TABLE IF NOT EXISTS "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"class" text NOT NULL,
	"department" text,
	CONSTRAINT "students_student_id_unique" UNIQUE("student_id")
);

CREATE TABLE IF NOT EXISTS "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"note_url" text,
	CONSTRAINT "subjects_code_unique" UNIQUE("code")
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	"assigned_class" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

-- 2. Add Foreign Keys Constraints (Ignore errors if already exists)
DO $$ BEGIN
 ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "password_reset_requests" ADD CONSTRAINT "password_reset_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Create Indexes (Ignore errors if already exists)
CREATE INDEX IF NOT EXISTS "student_term_idx" ON "results" USING btree ("student_id","term","session");
CREATE INDEX IF NOT EXISTS "class_idx" ON "students" USING btree ("class");
CREATE INDEX IF NOT EXISTS "role_idx" ON "users" USING btree ("role");

-- 4. Create or Update Admin User with password: admin123
INSERT INTO "users" ("username", "password", "role", "name")
VALUES (
    'Admin',
    '$2b$10$97aHApaoHXyWNFGJwv7cSe0zuL74x5LD6UcjD7GqnIuIFJQbxoZrS', -- hashed version of 'admin123'
    'admin',
    'System Administrator'
)
ON CONFLICT ("username") 
DO UPDATE SET 
    "password" = '$2b$10$97aHApaoHXyWNFGJwv7cSe0zuL74x5LD6UcjD7GqnIuIFJQbxoZrS';
