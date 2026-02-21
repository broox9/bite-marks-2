<script lang="ts">
  import { Star, MapPin, Globe, Plus, X, Check } from '@lucide/svelte';

  let spot = $state({
    name: "Château Étoile",
    address: "Place Vendôme, 75001 Paris, France",
    rating: 4.9,
    websiteURI: "https://chateauetoile.com",
    photoUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80"
  });

  let personalRating = $state<number>(0);
  let personalNotes = $state("");
  let isVisited = $state(false);
  let tags = $state<string[]>(["Michelin Star", "French Cuisine", "Wine Cellar"]);
  let newTag = $state("");
  let socialLinks = $state<string[]>(["https://instagram.com/chateauetoile"]);
  let newLink = $state("");
  let notes = $state<{text: string, date: string}[]>([
    {text: "Exceptional tasting menu with perfect wine pairing. Chef's attention to detail is remarkable.", date: "January 15, 2026"}
  ]);
  let newNote = $state("");
  let isBookmarked = $state(true);

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

  function addNote() {
    if (newNote.trim()) {
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      notes = [...notes, {text: newNote.trim(), date}];
      newNote = "";
    }
  }

  function handleSave() {
    console.log("Saving:", { personalRating, personalNotes, isVisited, tags, socialLinks, notes, isBookmarked });
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="luxury-container">
  <div class="card-wrapper">
    <div class="main-card">
      <!-- Hero Image Section -->
      <div class="hero-section">
        <div class="image-wrapper">
          <img src={spot.photoUrl} alt={spot.name} class="hero-image" />
          <div class="image-gradient"></div>
        </div>

        <div class="hero-overlay">
          <button class="bookmark-btn" class:active={isBookmarked} onclick={() => isBookmarked = !isBookmarked}>
            <Star size={24} fill={isBookmarked ? "currentColor" : "none"} />
          </button>

          <div class="rating-badge">
            <Star size={18} fill="currentColor" />
            <span>{spot.rating}</span>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="content-section">
        <!-- Title -->
        <div class="title-group">
          <h1 class="spot-title">{spot.name}</h1>
          <button class="visited-pill" class:checked={isVisited} onclick={() => isVisited = !isVisited}>
            <div class="pill-check">
              {#if isVisited}
                <Check size={14} />
              {/if}
            </div>
            <span>Visited</span>
          </button>
        </div>

        <!-- Location -->
        <div class="location-group">
          <MapPin size={18} />
          <span>{spot.address}</span>
        </div>

        {#if spot.websiteURI}
          <a href={spot.websiteURI} target="_blank" rel="noopener noreferrer" class="website-link">
            <Globe size={16} />
            <span>Visit Website</span>
          </a>
        {/if}

        <div class="divider"></div>

        <!-- Personal Rating -->
        <div class="section">
          <div class="section-header">
            <h3 class="section-title">Your Rating</h3>
            {#if personalRating > 0}
              <span class="rating-number">{personalRating.toFixed(1)}</span>
            {/if}
          </div>
          <div class="stars-elegant">
            {#each Array(5) as _, i}
              <button
                class="star-elegant"
                class:filled={i < personalRating}
                onclick={() => setRating(i + 1)}
              >
                <Star size={28} fill={i < personalRating ? "currentColor" : "none"} />
              </button>
            {/each}
          </div>
        </div>

        <div class="divider"></div>

        <!-- Tags -->
        <div class="section">
          <h3 class="section-title">Tags</h3>
          <div class="tags-elegant">
            {#each tags as tag, index}
              <div class="tag-elegant">
                <span>{tag}</span>
                <button class="tag-remove-elegant" onclick={() => removeTag(index)}>
                  <X size={14} />
                </button>
              </div>
            {/each}
          </div>
          <div class="input-elegant-group">
            <input
              type="text"
              bind:value={newTag}
              placeholder="Add a tag..."
              class="input-elegant"
              onkeydown={(e) => e.key === 'Enter' && addTag()}
            />
            <button class="btn-elegant-icon" onclick={addTag}>
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Personal Notes -->
        <div class="section">
          <h3 class="section-title">Notes</h3>
          <textarea
            bind:value={personalNotes}
            placeholder="Write your thoughts..."
            class="textarea-elegant"
            rows="4"
          ></textarea>
        </div>

        <div class="divider"></div>

        <!-- Journal Entries -->
        <div class="section">
          <h3 class="section-title">Journal</h3>
          <div class="journal-list">
            {#each notes as note}
              <div class="journal-entry">
                <div class="journal-date">{note.date}</div>
                <div class="journal-text">{note.text}</div>
              </div>
            {/each}
          </div>
          <div class="journal-add">
            <textarea
              bind:value={newNote}
              placeholder="Add a journal entry..."
              class="textarea-elegant small"
              rows="3"
            ></textarea>
            <button class="btn-elegant-secondary" onclick={addNote}>Add Entry</button>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Social Links -->
        <div class="section">
          <h3 class="section-title">Social & Links</h3>
          <div class="links-elegant">
            {#each socialLinks as link, index}
              <div class="link-elegant">
                <a href={link} target="_blank" rel="noopener noreferrer" class="link-text-elegant">
                  {link}
                </a>
                <button class="link-remove-elegant" onclick={() => removeSocialLink(index)}>
                  <X size={16} />
                </button>
              </div>
            {/each}
          </div>
          <div class="input-elegant-group">
            <input
              type="url"
              bind:value={newLink}
              placeholder="https://..."
              class="input-elegant"
              onkeydown={(e) => e.key === 'Enter' && addSocialLink()}
            />
            <button class="btn-elegant-icon" onclick={addSocialLink}>
              <Plus size={18} />
            </button>
          </div>
        </div>

        <!-- Save Button -->
        <div class="save-section">
          <button class="btn-save-elegant" onclick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #f8f7f5;
  }

  .luxury-container {
    min-height: 100vh;
    background: linear-gradient(to bottom, #f8f7f5 0%, #eeede9 100%);
    padding: 4rem 2rem;
    font-family: 'Montserrat', sans-serif;
  }

  .card-wrapper {
    max-width: 800px;
    margin: 0 auto;
    animation: cardFloat 1s ease-out;
  }

  @keyframes cardFloat {
    from {
      opacity: 0;
      transform: translateY(60px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .main-card {
    background: #ffffff;
    border-radius: 24px;
    overflow: hidden;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.08),
      0 8px 20px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.4s ease;
  }

  .main-card:hover {
    box-shadow:
      0 30px 80px rgba(0, 0, 0, 0.12),
      0 12px 30px rgba(0, 0, 0, 0.06);
  }

  .hero-section {
    position: relative;
    width: 100%;
    height: 500px;
    overflow: hidden;
  }

  .image-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }

  .main-card:hover .hero-image {
    transform: scale(1.05);
  }

  .image-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
    pointer-events: none;
  }

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    pointer-events: none;
  }

  .hero-overlay > * {
    pointer-events: auto;
  }

  .bookmark-btn {
    background: rgba(255, 255, 255, 0.95);
    border: none;
    border-radius: 50%;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #1a1a1a;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .bookmark-btn:hover {
    background: #ffffff;
    transform: scale(1.08);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
  }

  .bookmark-btn.active {
    color: #d4af37;
  }

  .rating-badge {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 100px;
    padding: 0.75rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #1a1a1a;
    font-weight: 500;
    font-size: 1.125rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    backdrop-filter: blur(10px);
  }

  .rating-badge :global(svg) {
    color: #d4af37;
  }

  .content-section {
    padding: 3rem;
  }

  .title-group {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .spot-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.25rem, 5vw, 3.5rem);
    font-weight: 300;
    line-height: 1.2;
    margin: 0;
    color: #1a1a1a;
    letter-spacing: -0.02em;
  }

  .visited-pill {
    background: transparent;
    border: 1.5px solid #e0e0e0;
    border-radius: 100px;
    padding: 0.625rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    color: #666;
    white-space: nowrap;
  }

  .pill-check {
    width: 18px;
    height: 18px;
    border: 1.5px solid currentColor;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .visited-pill:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
  }

  .visited-pill.checked {
    background: #1a1a1a;
    border-color: #1a1a1a;
    color: #ffffff;
  }

  .visited-pill.checked .pill-check {
    border-color: #ffffff;
  }

  .location-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #666;
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .website-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #1a1a1a;
    text-decoration: none;
    font-size: 0.9375rem;
    font-weight: 500;
    border-bottom: 1px solid #1a1a1a;
    padding-bottom: 2px;
    transition: all 0.2s ease;
  }

  .website-link:hover {
    opacity: 0.6;
  }

  .divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, #e0e0e0, transparent);
    margin: 2.5rem 0;
  }

  .section {
    margin-bottom: 0.5rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.75rem;
    font-weight: 400;
    color: #1a1a1a;
    margin: 0 0 1.5rem 0;
  }

  .rating-number {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.25rem;
    font-weight: 300;
    color: #d4af37;
  }

  .stars-elegant {
    display: flex;
    gap: 0.75rem;
  }

  .star-elegant {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #e0e0e0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .star-elegant.filled {
    color: #d4af37;
  }

  .star-elegant:hover {
    transform: scale(1.15);
    color: #d4af37;
  }

  .tags-elegant {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .tag-elegant {
    background: #f8f7f5;
    border: 1px solid #e0e0e0;
    border-radius: 100px;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: #1a1a1a;
    transition: all 0.2s ease;
  }

  .tag-elegant:hover {
    background: #eeede9;
    border-color: #1a1a1a;
  }

  .tag-remove-elegant {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #999;
    transition: color 0.2s;
  }

  .tag-remove-elegant:hover {
    color: #1a1a1a;
  }

  .input-elegant-group {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .input-elegant {
    flex: 1;
    border: none;
    border-bottom: 1.5px solid #e0e0e0;
    background: transparent;
    padding: 0.75rem 0;
    font-family: inherit;
    font-size: 0.9375rem;
    color: #1a1a1a;
    outline: none;
    transition: border-color 0.2s;
  }

  .input-elegant:focus {
    border-bottom-color: #1a1a1a;
  }

  .input-elegant::placeholder {
    color: #999;
  }

  .btn-elegant-icon {
    background: #1a1a1a;
    color: #ffffff;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .btn-elegant-icon:hover {
    background: #333;
    transform: rotate(90deg);
  }

  .textarea-elegant {
    width: 100%;
    border: 1.5px solid #e0e0e0;
    border-radius: 12px;
    background: #fafafa;
    padding: 1rem;
    font-family: inherit;
    font-size: 0.9375rem;
    line-height: 1.7;
    color: #1a1a1a;
    resize: vertical;
    outline: none;
    transition: all 0.2s;
  }

  .textarea-elegant:focus {
    border-color: #1a1a1a;
    background: #ffffff;
  }

  .textarea-elegant::placeholder {
    color: #999;
  }

  .textarea-elegant.small {
    font-size: 0.875rem;
  }

  .journal-list {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .journal-entry {
    padding: 1.25rem;
    background: #fafafa;
    border-radius: 12px;
    border-left: 3px solid #d4af37;
  }

  .journal-date {
    font-size: 0.8125rem;
    color: #999;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .journal-text {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: #333;
  }

  .journal-add {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-elegant-secondary {
    background: transparent;
    border: 1.5px solid #1a1a1a;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    color: #1a1a1a;
    cursor: pointer;
    align-self: flex-start;
    transition: all 0.3s ease;
  }

  .btn-elegant-secondary:hover {
    background: #1a1a1a;
    color: #ffffff;
  }

  .links-elegant {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .link-elegant {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .link-elegant:hover {
    background: #f8f7f5;
    border-color: #1a1a1a;
  }

  .link-text-elegant {
    color: #1a1a1a;
    text-decoration: none;
    font-size: 0.9375rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .link-text-elegant:hover {
    text-decoration: underline;
  }

  .link-remove-elegant {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    color: #999;
    transition: color 0.2s;
  }

  .link-remove-elegant:hover {
    color: #1a1a1a;
  }

  .save-section {
    margin-top: 3rem;
    padding-top: 2.5rem;
    border-top: 1px solid #e0e0e0;
  }

  .btn-save-elegant {
    width: 100%;
    background: #1a1a1a;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 1.25rem;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .btn-save-elegant:hover {
    background: #333;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .btn-save-elegant:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    .luxury-container {
      padding: 2rem 1rem;
    }

    .main-card {
      border-radius: 16px;
    }

    .hero-section {
      height: 400px;
    }

    .content-section {
      padding: 2rem 1.5rem;
    }

    .title-group {
      flex-direction: column;
      align-items: flex-start;
    }

    .spot-title {
      font-size: 2.25rem;
    }
  }
</style>
