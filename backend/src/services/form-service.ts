import { eq, desc, and, gte, lt, sql, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import { peaf_forms, peaf_approvals, users } from '../db/schema.js';
import { toRoman } from '../config/roman-numerals.js';

export const createForm = async (data: {
  applicant_id: string;
  applicant_name: string;
  department: string;
  plant_location: string;
  submission_date: Date;
  work_category: string[];
  project_description: string;
  technical_impact: string[];
  supporting_documents: string[];
  pr_number?: string;
  budget_estimate?: string;
  purchasing_status?: string;
}) => {
  // Generate document number
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const roman_month = toRoman(month);

  // Find next sequence number for this year
  const year_start = new Date(year, 0, 1); // January 1st of current year
  const year_end = new Date(year + 1, 0, 1); // January 1st of next year
  
  const forms_this_year = await db
    .select()
    .from(peaf_forms)
    .where(
      and(
        gte(peaf_forms.created_at, year_start),
        lt(peaf_forms.created_at, year_end)
      )
    );

  const next_seq = (forms_this_year.length + 1).toString().padStart(3, '0');
  const document_no = `${next_seq}/PEAF/IFM/MFG-PE/${roman_month}/${year}`;

  const [form] = await db
    .insert(peaf_forms)
    .values({
      ...data,
      document_no,
      status: 'pending_hse',
    })
    .returning();

  return form;
};

export const getFormsByUser = async (user_id: string, role: string, plant?: string) => {
  if (role === 'user') {
    // User hanya melihat request mereka sendiri
    return await db
      .select()
      .from(peaf_forms)
      .where(eq(peaf_forms.applicant_id, user_id))
      .orderBy(desc(peaf_forms.created_at));
  } else if (role === 'hod' && plant) {
    // HOD melihat: pending_hod (untuk approve) + approved (untuk info)
    return await db
      .select()
      .from(peaf_forms)
      .where(
        and(
          eq(peaf_forms.plant_location, plant),
          or(
            eq(peaf_forms.status, 'pending_hod'),
            eq(peaf_forms.status, 'approved')
          )
        )
      )
      .orderBy(desc(peaf_forms.created_at));
  } else if (role === 'hse' && plant) {
    // HSE melihat: pending_hse (untuk approve) + approved (untuk info)
    return await db
      .select()
      .from(peaf_forms)
      .where(
        and(
          eq(peaf_forms.plant_location, plant),
          or(
            eq(peaf_forms.status, 'pending_hse'),
            eq(peaf_forms.status, 'approved')
          )
        )
      )
      .orderBy(desc(peaf_forms.created_at));
  } else if (role === 'factory_manager' && plant) {
    // Factory Manager melihat: pending_factory_manager (untuk approve) + approved (untuk info)
    return await db
      .select()
      .from(peaf_forms)
      .where(
        and(
          eq(peaf_forms.plant_location, plant),
          or(
            eq(peaf_forms.status, 'pending_factory_manager'),
            eq(peaf_forms.status, 'approved')
          )
        )
      )
      .orderBy(desc(peaf_forms.created_at));
  } else if (role === 'engineering_manager') {
    // Engineering Manager melihat: pending_engineering_manager (untuk approve) + approved (untuk info)
    return await db
      .select()
      .from(peaf_forms)
      .where(
        or(
          eq(peaf_forms.status, 'pending_engineering_manager'),
          eq(peaf_forms.status, 'approved')
        )
      )
      .orderBy(desc(peaf_forms.created_at));
  }

  // Admin melihat semua request
  return await db.select().from(peaf_forms).orderBy(desc(peaf_forms.created_at));
};

export const getFormById = async (id: string) => {
  const [form] = await db.select().from(peaf_forms).where(eq(peaf_forms.id, id)).limit(1);
  return form;
};

export const getFormApprovals = async (form_id: string) => {
  const approvals = await db
    .select({
      id: peaf_approvals.id,
      form_id: peaf_approvals.form_id,
      role: peaf_approvals.role,
      approver_id: peaf_approvals.approver_id,
      status: peaf_approvals.status,
      notes: peaf_approvals.notes,
      created_at: peaf_approvals.created_at,
      approver_name: users.name,
    })
    .from(peaf_approvals)
    .leftJoin(users, eq(peaf_approvals.approver_id, users.id))
    .where(eq(peaf_approvals.form_id, form_id));

  return approvals;
};

export const createApproval = async (data: {
  form_id: string;
  role: string;
  approver_id: string;
  status: string;
  notes?: string;
}) => {
  const [approval] = await db.insert(peaf_approvals).values(data).returning();
  return approval;
};

export const updateFormStatus = async (id: string, status: string) => {
  const [form] = await db
    .update(peaf_forms)
    .set({ status, updated_at: new Date() })
    .where(eq(peaf_forms.id, id))
    .returning();

  return form;
};

export const updateFormDocuments = async (id: string, documents: any[]) => {
  const [form] = await db
    .update(peaf_forms)
    .set({ supporting_documents: documents, updated_at: new Date() })
    .where(eq(peaf_forms.id, id))
    .returning();

  return form;
};
