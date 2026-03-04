// import { generateText } from "ai";
// import { openai } from "@ai-sdk/openai";
import { Agent, run } from "@openai/agents";
import { OPENAI_API_KEY } from '$env/dynamic/private';
import { query, command } from '$app/server'
import z from 'zod'



const agent = new Agent({
  name: 'test-agent',
  model: 'gpt-5-nano',
  instructions: 'You are a helpful assistant. that speaks like Fredrick Douglass',
  modelSettings: {
    reasoning: { effort: 'low' }
  },
  tools: [],
})

async function sendPrompt(prompt: string) {
  console.log('[bs] Agent::sendPrompt', prompt);
  const result = await run(agent, prompt)

  console.log('[bs] Agent::sendPrompt::response', result.output);
  return result.output;
}


export const agentRemoteCall = command(z.string(), async (prompt: string) => {
  const response = await sendPrompt(prompt);
  console.log('[bs] Agent::agentRemoteCall', response);
  return response;
})