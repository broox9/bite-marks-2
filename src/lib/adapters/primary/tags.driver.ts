import { COLLECTIONS, DATABASE_ID, ID, Permission, Query, Role, database } from "$lib/adapters/secondary/appwrite/browser-client";
import type { TagInput, TagResult } from "$lib/core/domain/Tag/Tag";

export async function createTagController(params: {
  tag: { tagName: string; userId: string };
  callback: (tag: TagResult | null) => void;
}) {
  const { tag, callback } = params;
  try {
    const input: TagInput = {
      tagName: tag.tagName.trim(),
      userId: tag.userId,
    };

    const permissions = [
      Permission.read(Role.user(input.userId)),
      Permission.update(Role.user(input.userId)),
      Permission.delete(Role.user(input.userId)),
    ];

    const response: any = await database.createDocument(
      DATABASE_ID,
      COLLECTIONS.tags,
      ID.unique(),
      input,
      permissions
    );

    callback({
      id: response.$id,
      tagName: response.tagName ?? response.name ?? input.tagName,
      userId: response.userId ?? input.userId,
      createdAt: response.$createdAt ?? response.createdAt ?? new Date().toISOString(),
      updatedAt: response.$updatedAt ?? response.updatedAt ?? new Date().toISOString(),
    });
  } catch (error) {
    console.error("[bs] createTagController error", error);
    callback(null);
  }
}

export async function listTagsController(params: { userId: string; callback: (tags: TagResult[]) => void }) {
  const { userId, callback } = params;
  try {
    const response: any = await database.listDocuments(DATABASE_ID, COLLECTIONS.tags, [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
    ]);

    const tags: TagResult[] = (response?.documents ?? []).map((doc: any) => ({
      id: doc.$id ?? doc.id,
      tagName: doc.tagName ?? doc.name ?? "",
      userId: doc.userId ?? userId,
      createdAt: doc.$createdAt ?? doc.createdAt ?? "",
      updatedAt: doc.$updatedAt ?? doc.updatedAt ?? "",
    }));

    callback(tags);
  } catch (error) {
    console.error("[bs] listTagsController error", error);
    callback([]);
  }
}

