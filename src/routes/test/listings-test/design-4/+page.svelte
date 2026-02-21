<script lang="ts">
  import { Star, MapPin, Heart, Bookmark, Share2, MoreVertical, Navigation, Clock, DollarSign, Users } from '@lucide/svelte';

  let spots = $state([
    {
      id: "1",
      name: "Sushi Nakazawa",
      address: "23 Commerce St, New York, NY",
      rating: 4.8,
      personal_rating: 5,
      is_visited: true,
      lat: 40.7350,
      lng: -74.0080,
      cuisine: "Japanese Sushi",
      priceLevel: 4,
      visitDate: "2026-01-15",
      note: "Absolutely incredible omakase experience. Chef's attention to detail is unmatched.",
      photoUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80",
      isFavorite: true,
      tags: ["omakase", "date night", "must-try"]
    },
    {
      id: "2",
      name: "Le Bernardin",
      address: "155 W 51st St, New York, NY",
      rating: 4.9,
      personal_rating: 4,
      is_visited: true,
      lat: 40.7614,
      lng: -73.9776,
      cuisine: "French Seafood",
      priceLevel: 4,
      visitDate: "2025-12-10",
      note: "Impeccable service and the freshest seafood in the city.",
      photoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
      isFavorite: false,
      tags: ["seafood", "michelin"]
    },
    {
      id: "3",
      name: "Momofuku Ko",
      address: "8 Extra Pl, New York, NY",
      rating: 4.6,
      personal_rating: 0,
      is_visited: false,
      lat: 40.7285,
      lng: -73.9905,
      cuisine: "Asian Fusion",
      priceLevel: 3,
      visitDate: null,
      note: "",
      photoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
      isFavorite: false,
      tags: ["to-try", "ramen"]
    },
    {
      id: "4",
      name: "Gramercy Tavern",
      address: "42 E 20th St, New York, NY",
      rating: 4.7,
      personal_rating: 4,
      is_visited: false,
      lat: 40.7389,
      lng: -73.9886,
      cuisine: "New American",
      priceLevel: 3,
      visitDate: null,
      note: "Reservation booked for next month!",
      photoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
      isFavorite: true,
      tags: ["upcoming", "farm-to-table"]
    }
  ]);

  let activeFilter = $state<"all" | "visited" | "wishlist">("all");
  let expandedSpotId = $state<string | null>(null);

  let filteredSpots = $derived(spots.filter(spot => {
    if (activeFilter === "visited") return spot.is_visited;
    if (activeFilter === "wishlist") return !spot.is_visited;
    return true;
  }));

  function toggleFavorite(id: string) {
    const spot = spots.find(s => s.id === id);
    if (spot) spot.isFavorite = !spot.isFavorite;
  }

  function toggleExpand(id: string) {
    expandedSpotId = expandedSpotId === id ? null : id;
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<div class="feed-app">
  <!-- Header -->
  <header class="app-header">
    <div class="header-content">
      <h1 class="app-title">Bite Marks</h1>
      <button class="header-btn">
        <MoreVertical size={24} />
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        class="tab"
        class:active={activeFilter === "all"}
        onclick={() => activeFilter = "all"}
      >
        <span>All</span>
        <span class="tab-count">{spots.length}</span>
      </button>
      <button
        class="tab"
        class:active={activeFilter === "visited"}
        onclick={() => activeFilter = "visited"}
      >
        <span>Visited</span>
        <span class="tab-count">{spots.filter(s => s.is_visited).length}</span>
      </button>
      <button
        class="tab"
        class:active={activeFilter === "wishlist"}
        onclick={() => activeFilter = "wishlist"}
      >
        <span>Wishlist</span>
        <span class="tab-count">{spots.filter(s => !s.is_visited).length}</span>
      </button>
    </div>
  </header>

  <!-- Feed -->
  <div class="feed">
    {#each filteredSpots as spot, index}
      <article class="spot-card" style="animation-delay: {index * 0.1}s;">
        <!-- Card Header -->
        <div class="card-header">
          <div class="header-left">
            <div class="spot-avatar" style="background: linear-gradient(135deg, {spot.is_visited ? '#10B981' : '#F59E0B'} 0%, {spot.is_visited ? '#059669' : '#D97706'} 100%);">
              {spot.name.charAt(0)}
            </div>
            <div class="header-info">
              <h2 class="spot-name-header">{spot.name}</h2>
              <div class="spot-cuisine-tag">{spot.cuisine}</div>
            </div>
          </div>
          <button class="header-action">
            <MoreVertical size={20} />
          </button>
        </div>

        <!-- Photo -->
        <div class="card-photo">
          <img src={spot.photoUrl} alt={spot.name} />
          {#if spot.is_visited}
            <div class="visited-overlay">
              <div class="visited-stamp">VISITED</div>
            </div>
          {/if}
        </div>

        <!-- Actions Bar -->
        <div class="actions-bar">
          <div class="actions-left">
            <button
              class="action-btn"
              class:liked={spot.isFavorite}
              onclick={() => toggleFavorite(spot.id)}
            >
              <Heart size={24} fill={spot.isFavorite ? "currentColor" : "none"} />
            </button>
            <a href={`/spot/${spot.id}`} class="action-btn">
              <Bookmark size={24} />
            </a>
            <button class="action-btn">
              <Share2 size={24} />
            </button>
          </div>
          <button class="action-btn">
            <Navigation size={24} />
          </button>
        </div>

        <!-- Content -->
        <div class="card-content">
          <!-- Ratings -->
          <div class="ratings-row">
            <div class="rating-item">
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <span class="rating-value">{spot.rating}</span>
              <span class="rating-label">Rating</span>
            </div>
            {#if spot.personal_rating > 0}
              <div class="rating-divider"></div>
              <div class="rating-item personal">
                <Star size={16} fill="#EC4899" color="#EC4899" />
                <span class="rating-value">{spot.personal_rating}</span>
                <span class="rating-label">You</span>
              </div>
            {/if}
          </div>

          <!-- Location & Details -->
          <div class="details-grid">
            <div class="detail-item">
              <MapPin size={16} />
              <span>{spot.address}</span>
            </div>
            <div class="detail-item">
              <DollarSign size={16} />
              <span>{"$".repeat(spot.priceLevel)}</span>
            </div>
            {#if spot.visitDate}
              <div class="detail-item">
                <Clock size={16} />
                <span>Visited {formatDate(spot.visitDate)}</span>
              </div>
            {/if}
          </div>

          <!-- Note -->
          {#if spot.note}
            <div class="spot-note">
              <p class="note-text" class:expanded={expandedSpotId === spot.id}>
                {spot.note}
              </p>
              {#if spot.note.length > 80}
                <button class="note-toggle" onclick={() => toggleExpand(spot.id)}>
                  {expandedSpotId === spot.id ? 'Show less' : 'Show more'}
                </button>
              {/if}
            </div>
          {/if}

          <!-- Tags -->
          {#if spot.tags.length > 0}
            <div class="tags-row">
              {#each spot.tags as tag}
                <span class="tag">#{tag}</span>
              {/each}
            </div>
          {/if}

          <!-- Inline Map -->
          <div class="inline-map">
            <div class="map-preview">
              <div
                class="map-marker-inline"
                style="left: {(spot.lng + 74.01) * 25}%; top: {(40.77 - spot.lat) * 25}%;"
              >
                <div class="marker-dot"></div>
              </div>
            </div>
            <button class="map-cta">
              <Navigation size={14} />
              <span>Get Directions</span>
            </button>
          </div>
        </div>
      </article>
    {/each}

    {#if filteredSpots.length === 0}
      <div class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h3>No spots here yet</h3>
        <p>Start adding restaurants to your collection!</p>
      </div>
    {/if}
  </div>

  <!-- Floating Action Button -->
  <button class="fab">
    <span class="fab-icon">+</span>
  </button>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #FAFAFA;
  }

  .feed-app {
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    background: #FAFAFA;
    padding-bottom: 5rem;
  }

  .app-header {
    background: #FFFFFF;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid #E5E7EB;
    animation: slideDown 0.4s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    padding-top: max(1rem, env(safe-area-inset-top));
  }

  .app-title {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(135deg, #EC4899 0%, #F59E0B 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    color: #6B7280;
  }

  .filter-tabs {
    display: flex;
    padding: 0 1rem;
    gap: 0.5rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .filter-tabs::-webkit-scrollbar {
    display: none;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    padding: 1rem 0.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #9CA3AF;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    white-space: nowrap;
  }

  .tab.active {
    color: #1F2937;
    border-bottom-color: #EC4899;
  }

  .tab-count {
    background: #F3F4F6;
    color: #6B7280;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .tab.active .tab-count {
    background: #FDF2F8;
    color: #EC4899;
  }

  .feed {
    max-width: 640px;
    margin: 0 auto;
  }

  .spot-card {
    background: #FFFFFF;
    margin: 0.75rem 0;
    border-radius: 0;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    animation: cardFadeIn 0.6s ease-out backwards;
  }

  @keyframes cardFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.875rem 1rem;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .spot-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-weight: 700;
    font-size: 1.125rem;
    flex-shrink: 0;
  }

  .header-info {
    flex: 1;
    min-width: 0;
  }

  .spot-name-header {
    font-size: 0.9375rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: #1F2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .spot-cuisine-tag {
    font-size: 0.8125rem;
    color: #6B7280;
  }

  .header-action {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    color: #9CA3AF;
  }

  .card-photo {
    position: relative;
    width: 100%;
    height: 400px;
    overflow: hidden;
    background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  }

  .card-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .visited-overlay {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .visited-stamp {
    background: rgba(16, 185, 129, 0.95);
    color: #FFFFFF;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  .actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid #F3F4F6;
  }

  .actions-left {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    color: #1F2937;
    transition: all 0.2s;
    text-decoration: none;
  }

  .action-btn:active {
    transform: scale(0.9);
  }

  .action-btn.liked {
    color: #EC4899;
    animation: heartBeat 0.4s ease;
  }

  @keyframes heartBeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.2); }
    50% { transform: scale(0.95); }
  }

  .card-content {
    padding: 1rem;
  }

  .ratings-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #F3F4F6;
  }

  .rating-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .rating-value {
    font-size: 1rem;
    font-weight: 700;
    color: #1F2937;
  }

  .rating-label {
    font-size: 0.8125rem;
    color: #9CA3AF;
  }

  .rating-divider {
    width: 1px;
    height: 20px;
    background: #E5E7EB;
    margin: 0 0.5rem;
  }

  .details-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6B7280;
    font-size: 0.875rem;
  }

  .spot-note {
    margin-bottom: 1rem;
  }

  .note-text {
    color: #1F2937;
    font-size: 0.9375rem;
    line-height: 1.6;
    margin: 0 0 0.5rem 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }

  .note-text:not(.expanded) {
    -webkit-line-clamp: 2;
  }

  .note-text.expanded {
    -webkit-line-clamp: unset;
  }

  .note-toggle {
    background: none;
    border: none;
    color: #9CA3AF;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
  }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tag {
    color: #3B82F6;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .inline-map {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #E5E7EB;
  }

  .map-preview {
    height: 120px;
    background: linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 100%);
    position: relative;
    overflow: hidden;
  }

  .map-marker-inline {
    position: absolute;
    transform: translate(-50%, -50%);
  }

  .marker-dot {
    width: 16px;
    height: 16px;
    background: #EF4444;
    border: 3px solid #FFFFFF;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  }

  .map-cta {
    width: 100%;
    background: #F9FAFB;
    border: none;
    padding: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #3B82F6;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .map-cta:active {
    background: #F3F4F6;
  }

  .fab {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #EC4899 0%, #F59E0B 100%);
    color: #FFFFFF;
    border: none;
    box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    z-index: 50;
  }

  .fab:active {
    transform: scale(0.9);
  }

  .fab-icon {
    font-size: 2rem;
    font-weight: 300;
    line-height: 1;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #9CA3AF;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #6B7280;
    margin: 0 0 0.5rem 0;
  }

  .empty-state p {
    font-size: 0.9375rem;
    margin: 0;
  }

  @media (min-width: 768px) {
    .spot-card {
      border-radius: 12px;
      margin: 1rem;
    }
  }
</style>
