import type { TextGeneration } from '$lib/ports/backend.repository';
import { ApplicationError } from '$lib/core/domain/api';
import { z } from 'zod';

export class OpenAITextGeneration implements TextGeneration {
  constructor(private apiKey: string | undefined, private fetcher: typeof fetch = fetch) {}
  async respond(prompt: string) {
    if (!this.apiKey) throw new ApplicationError(503, 'not_configured', 'AI responses are not configured');
    const response = await this.fetcher('https://api.openai.com/v1/responses', {
      method: 'POST', signal: AbortSignal.timeout(60000),
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-5-nano', input: prompt, max_output_tokens: 2000, store: false,
        instructions: 'Help the user with food and places. You cannot access or modify their saved data in this operation.' }),
    });
    if (!response.ok) throw new ApplicationError(502, 'upstream_error', 'AI responses are temporarily unavailable');
    const result = z.object({ output: z.array(z.object({
      content: z.array(z.object({ type: z.string(), text: z.string().optional() })).optional(),
    })) }).parse(await response.json());
    return result.output.flatMap(item => item.content ?? []).filter(item => item.type === 'output_text').map(item => item.text ?? '').join('');
  }
}
