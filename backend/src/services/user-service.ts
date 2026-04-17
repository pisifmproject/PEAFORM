import { eq, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, pending_registrations, notifications, departments } from '../db/schema.js';
import bcrypt from 'bcryptjs';

export const createUser = async (data: {
  nik: string;
  username: string;
  email: string;
  name: string;
  password: string;
  role?: string;
  plant?: string;
}) => {
  const hashed_password = await bcrypt.hash(data.password, 10);
  
  const [user] = await db
    .insert(users)
    .values({
      ...data,
      password: hashed_password,
      role: data.role || 'user',
    })
    .returning();
  
  return user;
};

export const findUserByIdentifier = async (identifier: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.nik, identifier),
        eq(users.username, identifier),
        eq(users.email, identifier)
      )
    )
    .limit(1);
  
  return user;
};

export const findUserById = async (id: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
};

export const getAllUsers = async () => {
  return await db.select().from(users);
};

export const updateUserRole = async (id: string, role: string) => {
  const [user] = await db
    .update(users)
    .set({ role, updated_at: new Date() })
    .where(eq(users.id, id))
    .returning();
  
  return user;
};

export const updateUserPlant = async (id: string, plant: string) => {
  const [user] = await db
    .update(users)
    .set({ plant, updated_at: new Date() })
    .where(eq(users.id, id))
    .returning();
  
  return user;
};

export const deleteUser = async (id: string) => {
  await db.delete(users).where(eq(users.id, id));
};

export const verifyPassword = async (plain_password: string, hashed_password: string) => {
  return await bcrypt.compare(plain_password, hashed_password);
};

// Pending Registration Functions
export const createPendingRegistration = async (data: {
  nik: string;
  username: string;
  email: string;
  name: string;
  password: string;
}) => {
  const hashed_password = await bcrypt.hash(data.password, 10);
  
  const [pending] = await db
    .insert(pending_registrations)
    .values({
      ...data,
      password: hashed_password,
      status: 'pending',
    })
    .returning();
  
  return pending;
};

export const findPendingRegistrationByIdentifier = async (identifier: string) => {
  const [pending] = await db
    .select()
    .from(pending_registrations)
    .where(
      or(
        eq(pending_registrations.nik, identifier),
        eq(pending_registrations.username, identifier),
        eq(pending_registrations.email, identifier)
      )
    )
    .limit(1);
  
  return pending;
};

export const getAllPendingRegistrations = async () => {
  return await db
    .select()
    .from(pending_registrations)
    .where(eq(pending_registrations.status, 'pending'));
};

export const approvePendingRegistration = async (id: string) => {
  // Get pending registration
  const [pending] = await db
    .select()
    .from(pending_registrations)
    .where(eq(pending_registrations.id, id))
    .limit(1);
  
  if (!pending) {
    throw new Error('Pending registration not found');
  }

  // Create user from pending registration
  const [user] = await db
    .insert(users)
    .values({
      nik: pending.nik,
      username: pending.username,
      email: pending.email,
      name: pending.name,
      password: pending.password, // Already hashed
      role: 'user',
    })
    .returning();

  // Delete pending registration
  await db.delete(pending_registrations).where(eq(pending_registrations.id, id));

  return user;
};

export const rejectPendingRegistration = async (id: string) => {
  await db.delete(pending_registrations).where(eq(pending_registrations.id, id));
};

export const notifyAdminsOfNewRegistration = async (userName: string) => {
  // Get all admin users
  const admins = await db
    .select()
    .from(users)
    .where(eq(users.role, 'admin'));

  // Create notification for each admin
  const notificationPromises = admins.map(admin =>
    db.insert(notifications).values({
      user_id: admin.id,
      message: `New user registration from ${userName} is pending approval`,
      is_read: false,
    })
  );

  await Promise.all(notificationPromises);
};

export const updateUserDepartment = async (id: string, department: string) => {
  const [user] = await db
    .update(users)
    .set({ department, updated_at: new Date() })
    .where(eq(users.id, id))
    .returning();
  
  return user;
};

export const getAllDepartments = async () => {
  return await db.select().from(departments);
};

export const createDepartment = async (name: string) => {
  const [dept] = await db
    .insert(departments)
    .values({ name })
    .returning();
  
  return dept;
};

export const deleteDepartment = async (id: string) => {
  await db.delete(departments).where(eq(departments.id, id));
};
