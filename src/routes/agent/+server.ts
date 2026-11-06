import { Agent, run } from "@openai/agents";
import type { RequestHandler } from './$types';



const agent = new Agent({
  name: 'test-agent',
  model: 'gpt-5-nano',
  instructions: 'You are a helpful assistant. that speaks like Fredrick Douglass',
  modelSettings: {
    reasoning: { effort: 'low' },
  },
  tools: [],
})

// async function sendPrompt(prompt: string) {
//   console.log('[bs] Agent::sendPrompt', prompt);
//   const result = await run(agent, prompt)

//   console.log('[bs] Agent::sendPrompt::response', result.output);
//   return result;
// }


export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  console.log('[bs] Agent::POST', body);
  const agentStream = await run(agent, body.prompt, { stream: true });
  const textStream = agentStream.toTextStream();
  const iterator = textStream[Symbol.asyncIterator]();
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await iterator.next();
      if (done) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(value));
    },
    async cancel() {
      await iterator.return?.();
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}