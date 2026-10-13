// Here we'll create out helper functions

// Import the Prisma client to execute database queries.
import { prisma } from "../config/prisma.js";

// Defines the structure of a user record returned from the database.
export interface NeonUserRecord {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  createdAt?: Date | null;
}

// Finds a user in the Neon Auth database using their ID or email.
// This helper function is used by the authentication middleware.
export const findNeonUser = async (filter: {
  id?: string;
  email?: string;
}): Promise<NeonUserRecord | null> => {
  try {
    // Search by user ID first if an ID is provided.
    if (filter.id) {
      const rows = await prisma.$queryRaw<NeonUserRecord[]>`
			SELECT id, name, email, role, "createdAt" as "createdAt"
			 FROM neon_auth.user
			 WHERE id=${filter.id}::uuid
			 LIMIT 1
			`;
      return rows[0] || null;
    }

    // Search by email if no user ID is provided.
    if (filter.email) {
      const rows = await prisma.$queryRaw<NeonUserRecord[]>`
			SELECT id, name, email, role, "createdAt" as "createdAt"
			 FROM neon_auth.user
			 WHERE LOWER(email)=${filter.email.trim().toLowerCase()}
			 LIMIT 1
			`;
      return rows[0] || null;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};
