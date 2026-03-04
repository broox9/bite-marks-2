<script lang="ts">
  // import { agentRemoteCall } from "./agent.remote";
  let { data, children } = $props();
  let userPrompt = $state("");
  let agentResponse = $state("");
  let isButtonDisabled = $state(false);

  const agentRemoteCall = async (prompt: string) => {
    const response = await fetch("/agent", {
      method: "POST",
      headers: {
        "Content-Type": "text/event-stream",
      },
      body: JSON.stringify({ prompt }),
    });

    const body = response.body;
    if (!body) return "";
    const reader = body.getReader();
    const decoder = new TextDecoder();

    agentResponse = ""; // Reset state

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      agentResponse += decoder.decode(value, { stream: true });
    }
    // Flush decoder
    agentResponse += decoder.decode();

    return agentResponse;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    isButtonDisabled = true;
    await agentRemoteCall(userPrompt); // No need to assign, agentRemoteCall updates state
    isButtonDisabled = false;
  };
</script>

<div class="agent-container">
  <section class="agent-header">Agent Header</section>
  <section class="agent-content">
    {#each agentResponse.split("\n") as line}
      <p>{line}</p>
    {/each}
  </section>
  <section class="agent-footer">
    <form on:submit={handleSubmit}>
      <input
        type="text"
        name="user-prompt"
        bind:value={userPrompt}
        placeholder="Ask about a spot..."
      />
      <button type="submit" disabled={isButtonDisabled}>Send</button>
    </form>
  </section>
  <!-- <section class="agent-response">
    <pre>{JSON.stringify(agentResponse, null, 2)}</pre>
  </section> -->
</div>

<style>
  .agent-container {
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 80svh;
  }

  .agent-header {
    background-color: var(--bg-low-contrast);
  }

  .agent-content {
    background-color: var(--bg-color);
  }

  .agent-footer {
    background-color: var(--bg-low-contrast);
  }
</style>
