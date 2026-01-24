import { createTagUseCase } from "../use-cases/createTagUseCase";
import { listTagsByUser } from "../use-cases/listTagsByUserUseCase";
import { createTagInputAdapter } from "../../interface-adapters/adapters/createTagInput";
import { getTagListByIdAdapter } from "$lib/the_clean/interface-adapters/adapters/getTagListById";
import { transformTagInput, transformDocsToTagList } from "../../interface-adapters/presenters/tagPresenter";
import type { TagInput, TagResult } from "$lib/the_clean/domain/Tag/ITag";

interface CreateTagParams {
  tag: {
    tagName: string;
    userId: string;
  };
  callback: (tag: TagResult | null) => void;
}

interface ListTagsParams {
  userId: string;
  callback: (tags: TagResult[]) => void;
}

export async function createTagController(params: CreateTagParams) {
  const { tag, callback } = params;

  try {
    await createTagUseCase({
      tag: tag as TagInput,
      adapter: createTagInputAdapter,
      presenter: transformTagInput,
      callback: (result) => {
        console.log('[bs] controller::TAG CREATED', result);
        callback(result);
      }
    });
  } catch (error) {
    console.error('[bs] controller::CREATE TAG ERROR', error);
    callback(null);
  }
}

export async function listTagsController(params: ListTagsParams) {
  const { userId, callback } = params;

  try {
    const tags = await listTagsByUser({
      userId,
      getListAdapter: getTagListByIdAdapter,
      presenter: transformDocsToTagList
    });
    
    console.log('[bs] controller::TAGS LISTED', tags);
    callback(tags);
  } catch (error) {
    console.error('[bs] controller::LIST TAGS ERROR', error);
    callback([]);
  }
}
