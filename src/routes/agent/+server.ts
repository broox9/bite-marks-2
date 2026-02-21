import { Agent, run } from "@openai/agents";
import { json } from "@sveltejs/kit";
import { OPENAI_API_KEY } from '$env/dynamic/private';
import z from 'zod'
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
  const readableStream = textStream.pipeThrough(new TextEncoderStream());

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}