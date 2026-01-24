import type { TagInput, TagResult } from "$lib/the_clean/domain/Tag/ITag";

interface CreateTagParams {
  tag: TagInput;
  adapter: (tag: TagInput) => Promise<TagResult>;
  presenter: (tag: TagInput) => TagInput;
  callback: (tag: TagResult) => void;
}

export async function createTagUseCase(params: CreateTagParams) {
  console.log('[bs] usecase::CREATE TAG PARAMS', params)
  try {
    console.log('[bs] usecase::CREATE TAG', params.tag)
    const result = params.presenter(params.tag)
    console.log('[bs] usecase::I WOULD CREATE THIS TAG INPUT', result)
    const doc = await params.adapter(result)
    params.callback(doc)
  } catch (error) {
    console.error(error)
    params.callback(null as any)
  }
}
