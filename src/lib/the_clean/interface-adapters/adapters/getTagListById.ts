import type { TagResult } from "$lib/the_clean/domain/Tag/ITag";
import { database, DATABASE_ID, COLLECTIONS, Query } from "$lib/the_clean/infrastructure/database/appwrite.client";

export async function getTagListByIdAdapter(userId: string): Promise<TagResult[]> {
  try {
    const response = await database.listDocuments(
      DATABASE_ID,
      COLLECTIONS.tags,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ]
    );

    console.log('[bs] adapter::GET TAG LIST', response);
    return response.documents.map(doc => ({
      id: doc.$id,
      tagName: doc.name,
      userId: doc.userId,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt
    })) as TagResult[];
  } catch (error) {
    console.error('[bs] adapter::GET TAG LIST ERROR', error);
    throw error;
  }
}
