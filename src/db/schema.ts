import { pgTable, text, integer, real, serial, bigint, index, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull(), // 'admin', 'teacher', 'student', 'parent'
  name: text('name').notNull(),
  assignedClass: text('assigned_class'),
}, (table) => ({
  roleIdx: index('role_idx').on(table.role),
}));

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  studentId: text('student_id').notNull().unique(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  class: text('class').notNull(),
  department: text('department'), // 'Science' or 'Art'
}, (table) => ({
  classIdx: index('class_idx').on(table.class),
}));

export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  noteUrl: text('note_url'),
});

export const results = pgTable('results', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  subjectId: integer('subject_id').references(() => subjects.id, { onDelete: 'cascade' }).notNull(),
  term: text('term').notNull(),
  session: text('session').notNull(),
  firstCA: real('first_ca'),
  secondCA: real('second_ca'),
  exams: real('exams'),
  total: real('total'),
  average: real('average'),
  score: real('score').notNull(),
  grade: text('grade').notNull(),
  teacherComments: text('teacher_comments'),
}, (table) => ({
  studentTermIdx: index('student_term_idx').on(table.studentId, table.term, table.session),
}));

export const passwordResetRequests = pgTable('password_reset_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  status: text('status').notNull(), // 'pending', 'approved', 'used'
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const gallery = pgTable('gallery', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  type: text('type').notNull(), // 'image' or 'video'
  title: text('title'),
  description: text('description'),
});

export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => users.id, { onDelete: 'cascade' }),
  assignedClass: text('assigned_class').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at').defaultNow()
});

export const siteVisits = pgTable('site_visits', {
  id: serial('id').primaryKey(),
  date: text('date').notNull().unique(), // YYYY-MM-DD
  count: integer('count').default(1).notNull()
});

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  mission: text('mission'),
  vision: text('vision'),
  about: text('about'),
  phone: text('phone'),
  email: text('email'),
  facebookUrl: text('facebook_url'),
  twitterUrl: text('twitter_url'),
  instagramUrl: text('instagram_url'),
  linkedinUrl: text('linkedin_url'),
  logoUrl: text('logo_url'),
});
