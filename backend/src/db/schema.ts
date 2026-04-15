import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  nik: varchar('nik', { length: 50 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  plant: varchar('plant', { length: 100 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const peaf_forms = pgTable('peaf_forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicant_id: uuid('applicant_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  document_no: varchar('document_no', { length: 100 }).notNull().unique(),
  applicant_name: varchar('applicant_name', { length: 255 }).notNull(),
  department: varchar('department', { length: 255 }).notNull(),
  plant_location: varchar('plant_location', { length: 255 }).notNull(),
  submission_date: timestamp('submission_date').notNull(),
  work_category: jsonb('work_category').notNull(),
  project_description: text('project_description').notNull(),
  technical_impact: jsonb('technical_impact').notNull(),
  supporting_documents: jsonb('supporting_documents').notNull(),
  pr_number: varchar('pr_number', { length: 100 }),
  budget_estimate: varchar('budget_estimate', { length: 255 }),
  purchasing_status: varchar('purchasing_status', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('pending_hod'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const peaf_approvals = pgTable('peaf_approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  form_id: uuid('form_id').notNull().references(() => peaf_forms.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull(),
  approver_id: uuid('approver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  form_id: uuid('form_id').references(() => peaf_forms.id, { onDelete: 'cascade' }),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
