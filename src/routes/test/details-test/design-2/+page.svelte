<script lang="ts">
  import { Star, MapPin, Globe, Heart, Camera } from '@lucide/svelte';

  let spot = $state({
    name: "Le Petit Jardin",
    address: "125 Rue de la Paix, 75002 Paris, France",
    rating: 4.6,
    websiteURI: "https://lepetitjardin.fr",
    photoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
  });

  let personalRating = $state<number>(0);
  let personalNotes = $state("");
  let isVisited = $state(false);
  let tags = $state<string[]>(["French", "Bistro", "Romantic"]);
  let newTag = $state("");
  let socialLinks = $state<string[]>(["https://instagram.com/lepetitjardin"]);
  let newLink = $state("");
  let memories = $state<{text: string, mood: string}[]>([
    {text: "Perfect evening with amazing wine pairing", mood: "joy"}
  ]);
  let newMemory = $state("");
  let favoriteLevel = $state(false);

  function setRating(rating: number) {
    personalRating = rating;
  }

  function addTag() {
    if (newTag.trim()) {
      tags = [...tags, newTag.trim()];
      newTag = "";
    }
  }

  function removeTag(index: number) {
    tags = tags.filter((_, i) => i !== index);
  }

  function addSocialLink() {
    if (newLink.trim()) {
      socialLinks = [...socialLinks, newLink.trim()];
      newLink = "";
    }
  }

  function removeSocialLink(index: number) {
    socialLinks = socialLinks.filter((_, i) => i !== index);
  }

  function addMemory() {
    if (newMemory.trim()) {
      memories = [...memories, {text: newMemory.trim(), mood: "neutral"}];
      newMemory = "";
    }
  }

  function handleSave() {
    console.log("Saving:", { personalRating, personalNotes, isVisited, tags, socialLinks, memories, favoriteLevel });
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
</svelte:head>

<div class="journal">
  <div class="page-container">
    <!-- Decorative tape strips -->
    <div class="tape tape-1"></div>
    <div class="tape tape-2"></div>

    <div class="paper">
      <!-- Header Section -->
      <div class="header">
        <div class="handwritten-title">{spot.name}</div>
        <button class="favorite-btn" class:loved={favoriteLevel} onclick={() => favoriteLevel = !favoriteLevel}>
          <Heart size={28} fill={favoriteLevel ? "currentColor" : "none"} />
        </button>
      </div>

      <!-- Photo Polaroid -->
      <div class="polaroid">
        <div class="polaroid-inner">
          <img src={spot.photoUrl} alt={spot.name} />
          <div class="polaroid-caption">
            <Camera size={14} />
            <span>A moment to remember</span>
          </div>
        </div>
        <div class="official-rating">
          <Star size={16} fill="currentColor" />
          <span>{spot.rating}</span>
        </div>
      </div>

      <!-- Location Info -->
      <div class="info-section">
        <div class="info-line">
          <MapPin size={18} />
          <span>{spot.address}</span>
        </div>
        {#if spot.websiteURI}
          <a href={spot.websiteURI} target="_blank" rel="noopener noreferrer" class="info-line link">
            <Globe size={18} />
            <span>Visit website</span>
          </a>
        {/if}
      </div>

      <!-- Visited Stamp -->
      <div class="visited-container">
        <button class="stamp-btn" class:stamped={isVisited} onclick={() => isVisited = !isVisited}>
          <div class="stamp">VISITED</div>
        </button>
      </div>

      <!-- Rating Section -->
      <div class="section">
        <div class="section-title">My Rating</div>
        <div class="stars-handwritten">
          {#each Array(5) as _, i}
            <button
              class="star-hand-btn"
              class:filled={i < personalRating}
              onclick={() => setRating(i + 1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2.5 L14.5 9.5 L22 10.5 L17 15.5 L18.5 22.5 L12 18.5 L5.5 22.5 L7 15.5 L2 10.5 L9.5 9.5 Z" />
              </svg>
            </button>
          {/each}
          {#if personalRating > 0}
            <span class="rating-text">{personalRating} out of 5</span>
          {/if}
        </div>
      </div>

      <!-- Tags Section -->
      <div class="section">
        <div class="section-title">Tags & Vibes</div>
        <div class="tags-organic">
          {#each tags as tag, index}
            <div class="tag-sticker">
              <span>{tag}</span>
              <button class="tag-x" onclick={() => removeTag(index)}>×</button>
            </div>
          {/each}
        </div>
        <div class="add-tag-area">
          <input
            type="text"
            bind:value={newTag}
            placeholder="add a tag..."
            class="handwritten-input"
            onkeydown={(e) => e.key === 'Enter' && addTag()}
          />
          <button class="add-btn" onclick={addTag}>+</button>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="section">
        <div class="section-title">Personal Notes</div>
        <textarea
          bind:value={personalNotes}
          placeholder="Write your thoughts here..."
          class="journal-textarea"
          rows="5"
        ></textarea>
      </div>

      <!-- Memories Section -->
      <div class="section">
        <div class="section-title">Memories & Moments</div>
        <div class="memories-list">
          {#each memories as memory, index}
            <div class="memory-card">
              <div class="memory-bullet"></div>
              <div class="memory-text">{memory.text}</div>
            </div>
          {/each}
        </div>
        <div class="add-memory">
          <textarea
            bind:value={newMemory}
            placeholder="Capture a memory..."
            class="memory-input"
            rows="2"
          ></textarea>
          <button class="memory-btn" onclick={addMemory}>Add Memory</button>
        </div>
      </div>

      <!-- Social Links Section -->
      <div class="section">
        <div class="section-title">Social & Web</div>
        <div class="links-stack">
          {#each socialLinks as link, index}
            <div class="link-card">
              <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
              <button class="link-delete" onclick={() => removeSocialLink(index)}>×</button>
            </div>
          {/each}
        </div>
        <div class="add-link-area">
          <input
            type="url"
            bind:value={newLink}
            placeholder="https://..."
            class="handwritten-input"
            onkeydown={(e) => e.key === 'Enter' && addSocialLink()}
          />
          <button class="add-btn" onclick={addSocialLink}>+</button>
        </div>
      </div>

      <!-- Save Button -->
      <div class="save-area">
        <button class="save-journal-btn" onclick={handleSave}>
          Save to Journal
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #f5e6d3 0%, #e8d4b8 100%);
  }

  .journal {
    min-height: 100vh;
    padding: 3rem 1.5rem;
    font-family: 'Crimson Text', serif;
    color: #2c2416;
  }

  .page-container {
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    animation: pageFloat 0.8s ease-out;
  }

  @keyframes pageFloat {
    from {
      opacity: 0;
      transform: translateY(40px) rotate(-2deg);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotate(0);
    }
  }

  .tape {
    position: absolute;
    width: 120px;
    height: 40px;
    background: rgba(255, 246, 210, 0.7);
    border: 1px solid rgba(0, 0, 0, 0.05);
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .tape-1 {
    top: -20px;
    left: 15%;
    transform: rotate(-8deg);
  }

  .tape-2 {
    top: -20px;
    right: 18%;
    transform: rotate(12deg);
  }

  .paper {
    background: #fffef9;
    padding: 3rem 2.5rem;
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.06),
      inset 0 0 200px rgba(218, 190, 150, 0.03);
    border-radius: 3px;
    position: relative;
    background-image:
      repeating-linear-gradient(
        transparent,
        transparent 31px,
        rgba(218, 190, 150, 0.1) 31px,
        rgba(218, 190, 150, 0.1) 32px
      );
  }

  .paper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 60px;
    width: 2px;
    height: 100%;
    background: rgba(218, 120, 120, 0.15);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid rgba(218, 190, 150, 0.3);
  }

  .handwritten-title {
    font-family: 'Caveat', cursive;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    color: #2c2416;
    line-height: 1.2;
    max-width: 70%;
  }

  .favorite-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #c4a57b;
    transition: all 0.3s ease;
    padding: 0.5rem;
  }

  .favorite-btn:hover {
    transform: scale(1.15);
  }

  .favorite-btn.loved {
    color: #d64545;
    animation: heartBeat 0.6s ease;
  }

  @keyframes heartBeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.3); }
    50% { transform: scale(1.1); }
  }

  .polaroid {
    margin: 2rem auto 2.5rem;
    max-width: 400px;
    position: relative;
    animation: polaroidDrop 0.8s ease-out 0.2s backwards;
  }

  @keyframes polaroidDrop {
    from {
      opacity: 0;
      transform: translateY(-30px) rotate(-5deg);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotate(-2deg);
    }
  }

  .polaroid-inner {
    background: white;
    padding: 12px 12px 50px;
    box-shadow:
      0 8px 30px rgba(0, 0, 0, 0.15),
      0 2px 8px rgba(0, 0, 0, 0.08);
    transform: rotate(-2deg);
    transition: transform 0.3s ease;
  }

  .polaroid:hover .polaroid-inner {
    transform: rotate(0deg);
  }

  .polaroid img {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
  }

  .polaroid-caption {
    font-family: 'Caveat', cursive;
    font-size: 1.25rem;
    color: #666;
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
  }

  .official-rating {
    position: absolute;
    top: 24px;
    right: -15px;
    background: #fff5e1;
    border: 3px solid #c4a57b;
    border-radius: 50%;
    width: 70px;
    height: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    font-weight: 600;
    font-size: 1.125rem;
    color: #2c2416;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    transform: rotate(15deg);
  }

  .info-section {
    margin: 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-line {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #5a4a36;
    font-size: 1.05rem;
  }

  .info-line.link {
    color: #8b6f47;
    text-decoration: none;
    width: fit-content;
    border-bottom: 2px dotted #c4a57b;
    padding-bottom: 2px;
    transition: color 0.2s;
  }

  .info-line.link:hover {
    color: #2c2416;
  }

  .visited-container {
    margin: 2rem 0;
    display: flex;
    justify-content: flex-end;
  }

  .stamp-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .stamp {
    font-family: 'Caveat', cursive;
    font-size: 2rem;
    font-weight: 700;
    color: transparent;
    border: 4px solid #c4a57b;
    padding: 0.5rem 1.5rem;
    transform: rotate(-12deg);
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .stamp-btn:hover .stamp {
    transform: rotate(-8deg) scale(1.05);
  }

  .stamp-btn.stamped .stamp {
    color: #d64545;
    border-color: #d64545;
    background: rgba(214, 69, 69, 0.08);
    transform: rotate(-12deg);
  }

  .section {
    margin: 2.5rem 0;
    animation: fadeInUp 0.6s ease-out backwards;
  }

  .section:nth-child(4) { animation-delay: 0.1s; }
  .section:nth-child(5) { animation-delay: 0.2s; }
  .section:nth-child(6) { animation-delay: 0.3s; }
  .section:nth-child(7) { animation-delay: 0.4s; }
  .section:nth-child(8) { animation-delay: 0.5s; }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .section-title {
    font-family: 'Caveat', cursive;
    font-size: 1.75rem;
    font-weight: 600;
    color: #5a4a36;
    margin-bottom: 1.25rem;
    padding-left: 0.5rem;
    border-left: 4px solid #c4a57b;
  }

  .stars-handwritten {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .star-hand-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 40px;
    height: 40px;
    color: #d4c5a9;
    transition: all 0.2s;
  }

  .star-hand-btn svg {
    width: 100%;
    height: 100%;
  }

  .star-hand-btn.filled {
    color: #f4a261;
    fill: #f4a261;
  }

  .star-hand-btn.filled svg path {
    fill: #f4a261;
  }

  .star-hand-btn:hover {
    transform: scale(1.15) rotate(-5deg);
  }

  .rating-text {
    font-family: 'Caveat', cursive;
    font-size: 1.25rem;
    color: #5a4a36;
    margin-left: 0.5rem;
  }

  .tags-organic {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .tag-sticker {
    background: linear-gradient(135deg, #fff5e1 0%, #f9efd9 100%);
    border: 2px solid #c4a57b;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: rotate(-1deg);
    transition: transform 0.2s;
  }

  .tag-sticker:nth-child(even) {
    transform: rotate(1deg);
  }

  .tag-sticker:hover {
    transform: rotate(0deg) scale(1.05);
  }

  .tag-x {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    color: #8b6f47;
    line-height: 1;
    padding: 0;
    opacity: 0.6;
    transition: opacity 0.2s;
  }

  .tag-x:hover {
    opacity: 1;
  }

  .add-tag-area,
  .add-link-area {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .handwritten-input {
    flex: 1;
    border: none;
    border-bottom: 2px dashed #c4a57b;
    background: transparent;
    padding: 0.75rem 0.5rem;
    font-family: 'Caveat', cursive;
    font-size: 1.25rem;
    color: #2c2416;
    outline: none;
    transition: border-color 0.2s;
  }

  .handwritten-input:focus {
    border-bottom-color: #8b6f47;
  }

  .handwritten-input::placeholder {
    color: #a89578;
  }

  .add-btn {
    background: #c4a57b;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .add-btn:hover {
    background: #8b6f47;
    transform: rotate(90deg) scale(1.1);
  }

  .journal-textarea {
    width: 100%;
    border: 2px solid #e8d4b8;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.5);
    padding: 1rem;
    font-family: 'Caveat', cursive;
    font-size: 1.25rem;
    color: #2c2416;
    resize: vertical;
    outline: none;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.03);
    transition: all 0.2s;
  }

  .journal-textarea:focus {
    border-color: #c4a57b;
    background: rgba(255, 255, 255, 0.8);
  }

  .journal-textarea::placeholder {
    color: #a89578;
  }

  .memories-list {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .memory-card {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .memory-bullet {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #f4a261;
    margin-top: 0.5rem;
    flex-shrink: 0;
  }

  .memory-text {
    font-family: 'Caveat', cursive;
    font-size: 1.25rem;
    color: #2c2416;
    line-height: 1.6;
  }

  .add-memory {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .memory-input {
    width: 100%;
    border: 2px dashed #c4a57b;
    border-radius: 8px;
    background: transparent;
    padding: 0.75rem;
    font-family: 'Caveat', cursive;
    font-size: 1.25rem;
    color: #2c2416;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;
  }

  .memory-input:focus {
    border-color: #8b6f47;
    border-style: solid;
  }

  .memory-input::placeholder {
    color: #a89578;
  }

  .memory-btn {
    background: #f4a261;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 0.75rem 1.5rem;
    font-family: 'Crimson Text', serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    align-self: flex-start;
    box-shadow: 0 3px 12px rgba(244, 162, 97, 0.3);
    transition: all 0.3s;
  }

  .memory-btn:hover {
    background: #e76f51;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(244, 162, 97, 0.4);
  }

  .links-stack {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .link-card {
    background: rgba(255, 255, 255, 0.6);
    border: 2px solid #e8d4b8;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s;
  }

  .link-card:hover {
    background: rgba(255, 255, 255, 0.9);
    border-color: #c4a57b;
  }

  .link-card a {
    color: #8b6f47;
    text-decoration: none;
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .link-card a:hover {
    text-decoration: underline;
  }

  .link-delete {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: #a89578;
    line-height: 1;
    padding: 0;
    transition: color 0.2s;
  }

  .link-delete:hover {
    color: #d64545;
  }

  .save-area {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 2px dashed #c4a57b;
  }

  .save-journal-btn {
    width: 100%;
    background: linear-gradient(135deg, #8b6f47 0%, #6b563a 100%);
    color: #fffef9;
    border: none;
    border-radius: 12px;
    padding: 1.25rem;
    font-family: 'Crimson Text', serif;
    font-size: 1.25rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    transition: all 0.3s;
  }

  .save-journal-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .save-journal-btn:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    .journal {
      padding: 2rem 1rem;
    }

    .paper {
      padding: 2rem 1.5rem;
    }

    .handwritten-title {
      font-size: 2rem;
    }

    .polaroid {
      max-width: 100%;
    }
  }
</style>
