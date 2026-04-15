import { eq, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
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
