import type { TagInput, TagResult } from "$lib/the_clean/domain/Tag/ITag";
import { database, DATABASE_ID, COLLECTIONS, ID, Permission, Role } from "$lib/the_clean/infrastructure/database/appwrite.client";

export async function createTagInputAdapter(tag: TagInput): Promise<TagResult> {
  try {
    const permissions = [
      Permission.read(Role.user(tag.userId)),
      Permission.update(Role.user(tag.userId)),
      Permission.delete(Role.user(tag.userId)),
    ];

    const response = await database.createDocument(
      DATABASE_ID,
      COLLECTIONS.tags,
      ID.unique(),
      tag,
      permissions
    );

    return {
      id: response.$id,
      tagName: response.tagName ?? response.name,
      userId: response.userId ?? response.user_id,
      createdAt: response.createdAt ?? response.$createdAt,
      updatedAt: response.updatedAt ?? response.$updatedAt
    } as TagResult;
  } catch (error) {
    console.error('[bs] adapter::CREATE TAG ERROR', error);
    throw error;
  }
}
