<script lang="ts">
  import { Star, MapPin, Globe, Activity, Zap, Lock, Unlock } from '@lucide/svelte';

  let spot = $state({
    name: "Neon Ramen Bar",
    address: "Level 7, Shibuya District, Tokyo 150-0042",
    rating: 4.9,
    websiteURI: "https://neonramenbar.jp",
    photoUrl: "https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=800&q=80"
  });

  let personalRating = $state<number>(0);
  let personalNotes = $state("");
  let isVisited = $state(false);
  let tags = $state<string[]>(["RAMEN", "CYBERPUNK", "LATE-NIGHT"]);
  let newTag = $state("");
  let socialLinks = $state<string[]>(["https://cyber.link/neonramen"]);
  let newLink = $state("");
  let logs = $state<{text: string, timestamp: string}[]>([
    {text: "SYSTEM: Best ramen in the district", timestamp: "2026.01.15.23:47"}
  ]);
  let newLog = $state("");
  let securityLevel = $state<"PUBLIC" | "PRIVATE">("PUBLIC");
  let glitchActive = $state(false);

  function setRating(rating: number) {
    personalRating = rating;
    triggerGlitch();
  }

  function triggerGlitch() {
    glitchActive = true;
    setTimeout(() => glitchActive = false, 200);
  }

  function addTag() {
    if (newTag.trim()) {
      tags = [...tags, newTag.trim().toUpperCase()];
      newTag = "";
      triggerGlitch();
    }
  }

  function removeTag(index: number) {
    tags = tags.filter((_, i) => i !== index);
  }

  function addSocialLink() {
    if (newLink.trim()) {
      socialLinks = [...socialLinks, newLink.trim()];
      newLink = "";
      triggerGlitch();
    }
  }

  function removeSocialLink(index: number) {
    socialLinks = socialLinks.filter((_, i) => i !== index);
  }

  function addLog() {
    if (newLog.trim()) {
      const now = new Date();
      const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      logs = [...logs, {text: newLog.trim(), timestamp}];
      newLog = "";
      triggerGlitch();
    }
  }

  function handleSave() {
    triggerGlitch();
    console.log("SYSTEM SAVE:", { personalRating, personalNotes, isVisited, tags, socialLinks, logs, securityLevel });
  }

  function toggleSecurity() {
    securityLevel = securityLevel === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    triggerGlitch();
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
</svelte:head>

<div class="cyber-world" class:glitch={glitchActive}>
  <div class="scanlines"></div>
  <div class="vignette"></div>

  <div class="terminal">
    <!-- Header -->
    <div class="system-bar">
      <div class="status-indicators">
        <span class="indicator active"></span>
        <span class="indicator active"></span>
        <span class="indicator"></span>
      </div>
      <div class="system-text">BITE_MARKS_SYSTEM_v4.5</div>
      <div class="status-right">
        <Activity size={16} class="pulse-icon" />
        <span>ONLINE</span>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Title Section -->
      <div class="panel title-panel">
        <div class="panel-header">
          <span class="panel-id">[ID: SPOT-{Math.floor(Math.random() * 9999)}]</span>
          <Zap size={16} />
        </div>
        <h1 class="cyber-title">{spot.name}</h1>
        <div class="glitch-text" data-text={spot.name}>{spot.name}</div>
      </div>

      <!-- Image Panel -->
      <div class="panel image-panel">
        <div class="image-container">
          <img src={spot.photoUrl} alt={spot.name} />
          <div class="image-overlay">
            <div class="scan-line"></div>
          </div>
          <div class="rating-hud">
            <Star size={18} />
            <span>{spot.rating}</span>
          </div>
        </div>
      </div>

      <!-- Info Panel -->
      <div class="panel info-panel">
        <div class="panel-header">
          <span>LOCATION_DATA</span>
        </div>
        <div class="info-grid">
          <div class="info-row">
            <MapPin size={16} />
            <span>{spot.address}</span>
          </div>
          {#if spot.websiteURI}
            <a href={spot.websiteURI} target="_blank" rel="noopener noreferrer" class="info-row link">
              <Globe size={16} />
              <span class="link-text">ACCESS_NETWORK</span>
            </a>
          {/if}
        </div>
      </div>

      <!-- Rating Panel -->
      <div class="panel rating-panel">
        <div class="panel-header">
          <span>USER_RATING</span>
          <div class="rating-display">{personalRating}/5</div>
        </div>
        <div class="cyber-stars">
          {#each Array(5) as _, i}
            <button
              class="star-cyber"
              class:active={i < personalRating}
              onclick={() => setRating(i + 1)}
            >
              <div class="star-inner">
                <Star size={24} fill={i < personalRating ? "currentColor" : "none"} />
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Status Panel -->
      <div class="panel status-panel">
        <button class="status-btn" class:visited={isVisited} onclick={() => { isVisited = !isVisited; triggerGlitch(); }}>
          <div class="status-indicator"></div>
          <span>{isVisited ? "VISITED" : "NOT_VISITED"}</span>
        </button>
        <button class="security-btn" onclick={toggleSecurity}>
          {#if securityLevel === "PRIVATE"}
            <Lock size={18} />
          {:else}
            <Unlock size={18} />
          {/if}
          <span>{securityLevel}</span>
        </button>
      </div>

      <!-- Tags Panel -->
      <div class="panel tags-panel">
        <div class="panel-header">
          <span>TAGS_ARRAY</span>
        </div>
        <div class="cyber-tags">
          {#each tags as tag, index}
            <div class="cyber-tag">
              <span>{tag}</span>
              <button class="tag-kill" onclick={() => removeTag(index)}>×</button>
            </div>
          {/each}
        </div>
        <div class="input-cyber">
          <input
            type="text"
            bind:value={newTag}
            placeholder="NEW_TAG"
            class="cyber-input"
            onkeydown={(e) => e.key === 'Enter' && addTag()}
          />
          <button class="cyber-btn" onclick={addTag}>+</button>
        </div>
      </div>

      <!-- Notes Panel -->
      <div class="panel notes-panel">
        <div class="panel-header">
          <span>PERSONAL_NOTES.txt</span>
        </div>
        <textarea
          bind:value={personalNotes}
          placeholder="> ENTER_NOTES..."
          class="cyber-textarea"
          rows="6"
        ></textarea>
      </div>

      <!-- Logs Panel -->
      <div class="panel logs-panel">
        <div class="panel-header">
          <span>SYSTEM_LOGS</span>
          <Activity size={14} class="pulse-icon" />
        </div>
        <div class="logs-container">
          {#each logs as log}
            <div class="log-entry">
              <span class="log-time">[{log.timestamp}]</span>
              <span class="log-text">{log.text}</span>
            </div>
          {/each}
        </div>
        <div class="log-input-area">
          <textarea
            bind:value={newLog}
            placeholder="> NEW_LOG_ENTRY"
            class="cyber-textarea small"
            rows="2"
          ></textarea>
          <button class="log-btn" onclick={addLog}>APPEND</button>
        </div>
      </div>

      <!-- Social Links Panel -->
      <div class="panel links-panel">
        <div class="panel-header">
          <span>EXTERNAL_LINKS</span>
        </div>
        <div class="links-list">
          {#each socialLinks as link, index}
            <div class="link-entry">
              <a href={link} target="_blank" rel="noopener noreferrer" class="cyber-link">
                {link}
              </a>
              <button class="link-kill" onclick={() => removeSocialLink(index)}>×</button>
            </div>
          {/each}
        </div>
        <div class="input-cyber">
          <input
            type="url"
            bind:value={newLink}
            placeholder="https://..."
            class="cyber-input"
            onkeydown={(e) => e.key === 'Enter' && addSocialLink()}
          />
          <button class="cyber-btn" onclick={addSocialLink}>+</button>
        </div>
      </div>

      <!-- Save Panel -->
      <div class="panel save-panel">
        <button class="save-cyber-btn" onclick={handleSave}>
          <span class="save-text">COMMIT_CHANGES</span>
          <Zap size={20} />
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #0a0e27;
  }

  .cyber-world {
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0e27 0%, #1a1f3a 100%);
    color: #00ffff;
    font-family: 'Share Tech Mono', monospace;
    padding: 1rem;
    position: relative;
    overflow-x: hidden;
  }

  .cyber-world.glitch {
    animation: glitchAnimation 0.2s;
  }

  @keyframes glitchAnimation {
    0%, 100% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
  }

  .scanlines {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    );
    pointer-events: none;
    z-index: 1000;
    animation: scanlineMove 8s linear infinite;
  }

  @keyframes scanlineMove {
    0% { transform: translateY(0); }
    100% { transform: translateY(20px); }
  }

  .vignette {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.7);
    pointer-events: none;
    z-index: 999;
  }

  .terminal {
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .system-bar {
    background: rgba(0, 255, 255, 0.05);
    border: 1px solid #00ffff;
    border-bottom: 2px solid #00ffff;
    padding: 0.75rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    animation: systemBarBoot 1s ease-out;
  }

  @keyframes systemBarBoot {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .status-indicators {
    display: flex;
    gap: 0.5rem;
  }

  .indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #333;
    border: 1px solid #555;
  }

  .indicator.active {
    background: #00ffff;
    box-shadow: 0 0 10px #00ffff;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .system-text {
    flex: 1;
    text-align: center;
  }

  .status-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .pulse-icon {
    animation: pulse 2s ease-in-out infinite;
  }

  .content-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1rem;
    margin-top: 1rem;
  }

  .panel {
    background: rgba(10, 14, 39, 0.9);
    border: 1px solid #00ffff;
    padding: 1.5rem;
    position: relative;
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.1);
    animation: panelAppear 0.8s ease-out backwards;
  }

  @keyframes panelAppear {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00ffff, transparent);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    margin-bottom: 1rem;
    color: #ff00ff;
    text-transform: uppercase;
  }

  .panel-id {
    color: #00ffff;
  }

  .title-panel {
    grid-column: 1 / 9;
    animation-delay: 0.1s;
  }

  .cyber-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 900;
    margin: 0;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
    position: relative;
    z-index: 2;
  }

  .glitch-text {
    position: absolute;
    top: 4rem;
    left: 1.5rem;
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 900;
    color: #ff00ff;
    opacity: 0.3;
    z-index: 1;
    text-transform: uppercase;
  }

  .image-panel {
    grid-column: 9 / 13;
    padding: 0;
    overflow: hidden;
    animation-delay: 0.2s;
  }

  .image-container {
    position: relative;
    height: 100%;
    min-height: 300px;
  }

  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: brightness(0.8) contrast(1.2);
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 255, 255, 0.1) 100%);
  }

  .scan-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: #00ffff;
    box-shadow: 0 0 10px #00ffff;
    animation: scan 3s linear infinite;
  }

  @keyframes scan {
    from { top: 0; }
    to { top: 100%; }
  }

  .rating-hud {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 0, 255, 0.2);
    border: 1px solid #ff00ff;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Orbitron', sans-serif;
    font-size: 1.125rem;
    color: #ff00ff;
    box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
  }

  .info-panel {
    grid-column: 1 / 7;
    animation-delay: 0.3s;
  }

  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
  }

  .info-row.link {
    color: #00ffff;
    text-decoration: none;
    width: fit-content;
    transition: all 0.2s;
  }

  .info-row.link:hover {
    color: #ff00ff;
    text-shadow: 0 0 10px currentColor;
  }

  .link-text {
    text-decoration: underline;
  }

  .rating-panel {
    grid-column: 7 / 13;
    animation-delay: 0.4s;
  }

  .rating-display {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.5rem;
    color: #00ffff;
    text-shadow: 0 0 10px #00ffff;
  }

  .cyber-stars {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
  }

  .star-cyber {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    position: relative;
  }

  .star-inner {
    color: #333;
    transition: all 0.3s;
  }

  .star-cyber.active .star-inner {
    color: #00ffff;
    filter: drop-shadow(0 0 8px #00ffff);
  }

  .star-cyber:hover .star-inner {
    color: #ff00ff;
    transform: scale(1.2);
  }

  .status-panel {
    grid-column: 1 / 7;
    display: flex;
    gap: 1rem;
    animation-delay: 0.5s;
  }

  .status-btn,
  .security-btn {
    flex: 1;
    background: rgba(0, 255, 255, 0.05);
    border: 1px solid #00ffff;
    color: #00ffff;
    padding: 1rem;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.875rem;
    letter-spacing: 0.1em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.3s;
  }

  .status-btn:hover,
  .security-btn:hover {
    background: rgba(0, 255, 255, 0.15);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  }

  .status-btn.visited {
    background: rgba(0, 255, 255, 0.2);
    border-color: #00ffff;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #333;
    border: 1px solid #00ffff;
  }

  .status-btn.visited .status-indicator {
    background: #00ffff;
    box-shadow: 0 0 10px #00ffff;
    animation: pulse 2s ease-in-out infinite;
  }

  .tags-panel {
    grid-column: 7 / 13;
    animation-delay: 0.6s;
  }

  .cyber-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .cyber-tag {
    background: rgba(255, 0, 255, 0.1);
    border: 1px solid #ff00ff;
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s;
  }

  .cyber-tag:hover {
    background: rgba(255, 0, 255, 0.2);
    box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
  }

  .tag-kill {
    background: none;
    border: none;
    color: #ff00ff;
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    padding: 0;
    transition: color 0.2s;
  }

  .tag-kill:hover {
    color: #00ffff;
  }

  .input-cyber {
    display: flex;
    gap: 0.5rem;
  }

  .cyber-input {
    flex: 1;
    background: rgba(0, 255, 255, 0.05);
    border: none;
    border-bottom: 1px solid #00ffff;
    color: #00ffff;
    padding: 0.75rem;
    font-family: inherit;
    font-size: 0.875rem;
    outline: none;
    transition: all 0.2s;
  }

  .cyber-input:focus {
    background: rgba(0, 255, 255, 0.1);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
  }

  .cyber-input::placeholder {
    color: rgba(0, 255, 255, 0.4);
  }

  .cyber-btn {
    background: rgba(255, 0, 255, 0.2);
    border: 1px solid #ff00ff;
    color: #ff00ff;
    width: 40px;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s;
  }

  .cyber-btn:hover {
    background: rgba(255, 0, 255, 0.4);
    box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
  }

  .notes-panel {
    grid-column: 1 / 7;
    animation-delay: 0.7s;
  }

  .cyber-textarea {
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid #00ffff;
    color: #00ffff;
    padding: 1rem;
    font-family: inherit;
    font-size: 0.875rem;
    resize: vertical;
    outline: none;
    transition: all 0.2s;
  }

  .cyber-textarea:focus {
    border-color: #ff00ff;
    box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
  }

  .cyber-textarea::placeholder {
    color: rgba(0, 255, 255, 0.4);
  }

  .cyber-textarea.small {
    font-size: 0.8125rem;
  }

  .logs-panel {
    grid-column: 7 / 13;
    animation-delay: 0.8s;
  }

  .logs-container {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 255, 255, 0.2);
  }

  .logs-container::-webkit-scrollbar {
    width: 8px;
  }

  .logs-container::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.5);
  }

  .logs-container::-webkit-scrollbar-thumb {
    background: #00ffff;
    box-shadow: 0 0 5px #00ffff;
  }

  .log-entry {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    font-size: 0.8125rem;
  }

  .log-time {
    color: #ff00ff;
    flex-shrink: 0;
  }

  .log-text {
    color: #00ffff;
  }

  .log-input-area {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .log-btn {
    background: rgba(0, 255, 255, 0.2);
    border: 1px solid #00ffff;
    color: #00ffff;
    padding: 0.5rem 1rem;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    cursor: pointer;
    align-self: flex-start;
    transition: all 0.3s;
  }

  .log-btn:hover {
    background: rgba(0, 255, 255, 0.4);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  }

  .links-panel {
    grid-column: 1 / 7;
    animation-delay: 0.9s;
  }

  .links-list {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .link-entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 255, 255, 0.2);
    transition: all 0.2s;
  }

  .link-entry:hover {
    border-color: #00ffff;
    background: rgba(0, 255, 255, 0.05);
  }

  .cyber-link {
    color: #00ffff;
    text-decoration: none;
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .cyber-link:hover {
    text-decoration: underline;
    text-shadow: 0 0 10px currentColor;
  }

  .link-kill {
    background: none;
    border: none;
    color: #ff00ff;
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    padding: 0;
    transition: color 0.2s;
  }

  .link-kill:hover {
    color: #00ffff;
  }

  .save-panel {
    grid-column: 7 / 13;
    padding: 0;
    animation-delay: 1s;
  }

  .save-cyber-btn {
    width: 100%;
    height: 100%;
    min-height: 80px;
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
    border: none;
    color: #00ffff;
    font-family: 'Orbitron', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }

  .save-cyber-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .save-cyber-btn:hover::before {
    left: 100%;
  }

  .save-cyber-btn:hover {
    box-shadow:
      0 0 30px rgba(0, 255, 255, 0.5),
      0 0 60px rgba(255, 0, 255, 0.3);
    color: #ff00ff;
  }

  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }

    .title-panel,
    .image-panel,
    .info-panel,
    .rating-panel,
    .status-panel,
    .tags-panel,
    .notes-panel,
    .logs-panel,
    .links-panel,
    .save-panel {
      grid-column: 1 / -1;
    }

    .status-panel {
      flex-direction: column;
    }
  }
</style>
