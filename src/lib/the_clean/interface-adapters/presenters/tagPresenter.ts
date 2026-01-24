import type { TagInput, TagResult } from "$lib/the_clean/domain/Tag/ITag";

export function transformTagInput(tag: TagInput): TagInput {
  return {
    tagName: tag.tagName.trim(),
    userId: tag.userId
  };
}

export function transformDocsToTagList(docs: any[]): TagResult[] {
  return docs.map(doc => ({
    id: doc.id || doc.$id,
    tagName: doc.tagName,
    userId: doc.userId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  }));
}
