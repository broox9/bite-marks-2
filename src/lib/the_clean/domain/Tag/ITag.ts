export interface TagResult {
  id: string;
  tagName: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type TagInput = Omit<TagResult, 'id' | 'createdAt' | 'updatedAt'>

export type TagRecord = TagResult
