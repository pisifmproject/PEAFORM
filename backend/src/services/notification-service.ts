import { eq, desc, and, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import { notifications, users } from '../db/schema.js';

export const createNotification = async (data: {
  user_id: string;
  message: string;
  form_id?: string;
}) => {
  const [notification] = await db.insert(notifications).values(data).returning();
  return notification;
};

export const getUserNotifications = async (user_id: string) => {
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, user_id))
    .orderBy(desc(notifications.created_at));
};

export const markNotificationAsRead = async (id: string, user_id: string) => {
  const [notification] = await db
    .update(notifications)
    .set({ is_read: true })
    .where(and(eq(notifications.id, id), eq(notifications.user_id, user_id)))
    .returning();

  return notification;
};

export const markAllNotificationsAsRead = async (user_id: string) => {
  await db
    .update(notifications)
    .set({ is_read: true })
    .where(and(eq(notifications.user_id, user_id), eq(notifications.is_read, false)));
};

// HOD dengan dept ini handle semua 3 plant, tidak perlu plant assignment
const MULTI_PLANT_DEPARTMENTS = ['PDQC', 'Manufacturing'];

export const notifyApprovers = async (role: string, plant_location: string, message: string, form_id: string) => {
  let approvers;

  if (['hod', 'hse', 'factory_manager'].includes(role)) {
    // Cari approver yang punya plant sesuai
    approvers = await db
      .select()
      .from(users)
      .where(and(eq(users.role, role), eq(users.plant, plant_location)));

    // Untuk HOD: tambahkan HOD PDQC/Manufacturing yang tidak punya plant (handle semua plant)
    if (role === 'hod') {
      const multiPlantHods = await db
        .select()
        .from(users)
        .where(and(eq(users.role, 'hod'), isNull(users.plant)));
      
      const filtered = multiPlantHods.filter((u: any) =>
        MULTI_PLANT_DEPARTMENTS.some(d => d.toLowerCase() === (u.department || '').toLowerCase())
      );
      approvers = [...approvers, ...filtered];
    }
  } else {
    approvers = await db.select().from(users).where(eq(users.role, role));
  }

  for (const approver of approvers) {
    await createNotification({
      user_id: approver.id,
      message,
      form_id,
    });
  }
};
