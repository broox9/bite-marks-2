import type { TagResult } from "$lib/the_clean/domain/Tag/ITag";

interface ListTagsByUserParams {
  userId: string;
  presenter: (docs: any[]) => TagResult[];
  getListAdapter: (userId: string) => Promise<TagResult[]>;
}

export async function listTagsByUser({ userId, presenter, getListAdapter }: ListTagsByUserParams) {
  try {
    const tags = await getListAdapter(userId)
    return presenter(tags);
  } catch (error) {
    console.error(error)
    return []
  }
}
