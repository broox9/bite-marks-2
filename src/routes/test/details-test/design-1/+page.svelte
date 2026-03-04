<script lang="ts">
  import { Star, MapPin, Globe, Check, Plus, X } from '@lucide/svelte';

  // Mock data for demonstration
  let spot = $state({
    name: "Osteria Francescana",
    address: "Via Stella, 22, 41121 Modena MO, Italy",
    rating: 4.8,
    websiteURI: "https://osteriafrancescana.it",
    photoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
  });

  let personalRating = $state<number>(0);
  let personalNotes = $state("");
  let isVisited = $state(false);
  let tags = $state<string[]>(["Italian", "Fine Dining"]);
  let newTag = $state("");
  let socialLinks = $state<string[]>(["https://instagram.com/osteria"]);
  let newLink = $state("");
  let comments = $state<{text: string, date: string}[]>([
    {text: "Incredible tasting menu experience", date: "2024-01-15"}
  ]);
  let newComment = $state("");

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

  function addComment() {
    if (newComment.trim()) {
      comments = [...comments, {
        text: newComment.trim(),
        date: new Date().toISOString().split('T')[0]
      }];
      newComment = "";
    }
  }

  function handleSave() {
    console.log("Saving:", { personalRating, personalNotes, isVisited, tags, socialLinks, comments });
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Libre+Bodoni:wght@700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="page">
  <div class="grid">
    <!-- Header Block -->
    <div class="block header-block">
      <div class="issue">DESIGN 01</div>
      <h1 class="title">{spot.name}</h1>
      <div class="meta">
        <div class="meta-item">
          <MapPin size={16} />
          <span>{spot.address}</span>
        </div>
        {#if spot.websiteURI}
          <a href={spot.websiteURI} target="_blank" rel="noopener noreferrer" class="meta-item link">
            <Globe size={16} />
            <span>Website</span>
          </a>
        {/if}
      </div>
    </div>

    <!-- Image Block -->
    <div class="block image-block">
      <img src={spot.photoUrl} alt={spot.name} />
      <div class="image-overlay">
        <div class="rating-badge">
          <Star size={20} fill="currentColor" />
          <span>{spot.rating}</span>
        </div>
      </div>
    </div>

    <!-- Rating Block -->
    <div class="block rating-block">
      <div class="section-label">YOUR RATING</div>
      <div class="stars">
        {#each Array(5) as _, i}
          <button
            class="star-btn"
            class:active={i < personalRating}
            onclick={() => setRating(i + 1)}
          >
            <Star size={32} fill={i < personalRating ? "currentColor" : "none"} />
          </button>
        {/each}
      </div>
      <div class="rating-value">{personalRating}/5</div>
    </div>

    <!-- Visited Block -->
    <div class="block visited-block">
      <button
        class="visited-btn"
        class:checked={isVisited}
        onclick={() => isVisited = !isVisited}
      >
        <div class="checkbox">
          {#if isVisited}
            <Check size={24} />
          {/if}
        </div>
        <span class="visited-label">VISITED</span>
      </button>
    </div>

    <!-- Tags Block -->
    <div class="block tags-block">
      <div class="section-label">TAGS</div>
      <div class="tags-container">
        {#each tags as tag, index}
          <div class="tag">
            <span>{tag}</span>
            <button class="tag-remove" onclick={() => removeTag(index)}>
              <X size={14} />
            </button>
          </div>
        {/each}
      </div>
      <div class="input-row">
        <input
          type="text"
          bind:value={newTag}
          placeholder="Add tag..."
          class="input-minimal"
          onkeydown={(e) => e.key === 'Enter' && addTag()}
        />
        <button class="btn-icon" onclick={addTag}>
          <Plus size={16} />
        </button>
      </div>
    </div>

    <!-- Notes Block -->
    <div class="block notes-block">
      <div class="section-label">PERSONAL NOTES</div>
      <textarea
        bind:value={personalNotes}
        placeholder="Write your thoughts..."
        class="textarea-minimal"
        rows="6"
      ></textarea>
    </div>

    <!-- Comments Block -->
    <div class="block comments-block">
      <div class="section-label">COMMENTS</div>
      <div class="comments-list">
        {#each comments as comment}
          <div class="comment">
            <div class="comment-date">{comment.date}</div>
            <div class="comment-text">{comment.text}</div>
          </div>
        {/each}
      </div>
      <div class="comment-input">
        <textarea
          bind:value={newComment}
          placeholder="Add a comment..."
          class="textarea-minimal small"
          rows="2"
        ></textarea>
        <button class="btn-add" onclick={addComment}>ADD</button>
      </div>
    </div>

    <!-- Social Links Block -->
    <div class="block social-block">
      <div class="section-label">SOCIAL LINKS</div>
      <div class="links-list">
        {#each socialLinks as link, index}
          <div class="link-item">
            <a href={link} target="_blank" rel="noopener noreferrer" class="link-text">
              {link}
            </a>
            <button class="link-remove" onclick={() => removeSocialLink(index)}>
              <X size={16} />
            </button>
          </div>
        {/each}
      </div>
      <div class="input-row">
        <input
          type="url"
          bind:value={newLink}
          placeholder="https://..."
          class="input-minimal"
          onkeydown={(e) => e.key === 'Enter' && addSocialLink()}
        />
        <button class="btn-icon" onclick={addSocialLink}>
          <Plus size={16} />
        </button>
      </div>
    </div>

    <!-- Save Block -->
    <div class="block save-block">
      <button class="btn-save" onclick={handleSave}>
        SAVE CHANGES
      </button>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #000;
  }

  .page {
    min-height: 100vh;
    background: #000;
    color: #fff;
    font-family: 'IBM Plex Mono', monospace;
    padding: 2rem;
    animation: fadeIn 0.6s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .grid {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1.5rem;
    position: relative;
  }

  .block {
    background: #fff;
    color: #000;
    padding: 2rem;
    border: 3px solid #000;
    position: relative;
    animation: slideUp 0.8s ease-out backwards;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .header-block {
    grid-column: 1 / 13;
    background: #FF3366;
    color: #fff;
    border-color: #FF3366;
    animation-delay: 0.1s;
  }

  .issue {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    margin-bottom: 1rem;
  }

  .title {
    font-family: 'Libre Bodoni', serif;
    font-size: clamp(2.5rem, 6vw, 5rem);
    font-weight: 700;
    line-height: 0.95;
    margin: 0 0 1.5rem 0;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    font-size: 0.875rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .meta-item.link {
    color: #fff;
    text-decoration: none;
    border-bottom: 2px solid #fff;
    padding-bottom: 2px;
    transition: opacity 0.2s;
  }

  .meta-item.link:hover {
    opacity: 0.7;
  }

  .image-block {
    grid-column: 1 / 8;
    padding: 0;
    overflow: hidden;
    position: relative;
    min-height: 500px;
    animation-delay: 0.2s;
  }

  .image-block img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    right: 0;
    padding: 2rem;
  }

  .rating-badge {
    background: #FFFF00;
    color: #000;
    padding: 0.75rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 1.25rem;
    border: 3px solid #000;
  }

  .rating-block {
    grid-column: 8 / 13;
    background: #FFFF00;
    border-color: #FFFF00;
    animation-delay: 0.3s;
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    margin-bottom: 1.5rem;
  }

  .stars {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .star-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #000;
    opacity: 0.3;
    transition: all 0.2s;
  }

  .star-btn.active {
    opacity: 1;
    transform: scale(1.1);
  }

  .star-btn:hover {
    opacity: 0.6;
    transform: scale(1.15);
  }

  .rating-value {
    font-size: 2rem;
    font-weight: 600;
  }

  .visited-block {
    grid-column: 8 / 13;
    background: #00FF00;
    border-color: #00FF00;
    padding: 0;
    animation-delay: 0.4s;
  }

  .visited-btn {
    width: 100%;
    height: 100%;
    min-height: 120px;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    transition: all 0.3s;
  }

  .visited-btn:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .visited-btn.checked {
    background: #000;
    color: #00FF00;
  }

  .checkbox {
    width: 48px;
    height: 48px;
    border: 3px solid currentColor;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .visited-label {
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.2em;
  }

  .tags-block {
    grid-column: 1 / 7;
    animation-delay: 0.5s;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .tag {
    background: #000;
    color: #fff;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    border: 2px solid #000;
  }

  .tag-remove {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 0;
    display: flex;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .tag-remove:hover {
    opacity: 1;
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
  }

  .input-minimal {
    flex: 1;
    border: none;
    border-bottom: 3px solid #000;
    background: transparent;
    padding: 0.75rem 0;
    font-family: inherit;
    font-size: 0.875rem;
    outline: none;
  }

  .input-minimal:focus {
    border-bottom-color: #FF3366;
  }

  .btn-icon {
    background: #000;
    color: #fff;
    border: none;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-icon:hover {
    background: #FF3366;
    transform: scale(1.05);
  }

  .notes-block {
    grid-column: 7 / 13;
    animation-delay: 0.6s;
  }

  .textarea-minimal {
    width: 100%;
    border: none;
    border-bottom: 3px solid #000;
    background: transparent;
    padding: 0.75rem 0;
    font-family: inherit;
    font-size: 0.875rem;
    outline: none;
    resize: vertical;
  }

  .textarea-minimal:focus {
    border-bottom-color: #FF3366;
  }

  .textarea-minimal.small {
    font-size: 0.8125rem;
  }

  .comments-block {
    grid-column: 1 / 7;
    animation-delay: 0.7s;
  }

  .comments-list {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .comment {
    border-left: 3px solid #000;
    padding-left: 1rem;
  }

  .comment-date {
    font-size: 0.75rem;
    opacity: 0.6;
    margin-bottom: 0.5rem;
  }

  .comment-text {
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .comment-input {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-add {
    background: #000;
    color: #fff;
    border: none;
    padding: 0.75rem 1.5rem;
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    cursor: pointer;
    align-self: flex-start;
    transition: all 0.2s;
  }

  .btn-add:hover {
    background: #FF3366;
    transform: translateX(4px);
  }

  .social-block {
    grid-column: 7 / 13;
    animation-delay: 0.8s;
  }

  .links-list {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .link-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem;
    border: 2px solid #000;
  }

  .link-text {
    color: #000;
    text-decoration: none;
    font-size: 0.875rem;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .link-text:hover {
    text-decoration: underline;
  }

  .link-remove {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .link-remove:hover {
    opacity: 1;
  }

  .save-block {
    grid-column: 1 / 13;
    background: #000;
    border-color: #000;
    padding: 0;
    animation-delay: 0.9s;
  }

  .btn-save {
    width: 100%;
    height: 100%;
    min-height: 80px;
    background: none;
    border: none;
    color: #fff;
    font-family: inherit;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all 0.3s;
  }

  .btn-save:hover {
    background: #FF3366;
    color: #000;
  }

  @media (max-width: 1024px) {
    .grid {
      grid-template-columns: 1fr;
    }

    .header-block,
    .image-block,
    .rating-block,
    .visited-block,
    .tags-block,
    .notes-block,
    .comments-block,
    .social-block,
    .save-block {
      grid-column: 1 / -1;
    }
  }
</style>
