<script lang="ts">
  import { Star, MapPin, Navigation, Filter, Search, Trash2, Check } from '@lucide/svelte';

  // Mock data - replace with actual data
  let spots = $state([
    {
      id: "1",
      name: "Sushi Nakazawa",
      address: "23 Commerce St, New York, NY 10014",
      rating: 4.8,
      personal_rating: 5,
      is_visited: true,
      lat: 40.7350,
      lng: -74.0080,
      cuisine: "Japanese",
      distance: "0.5 mi"
    },
    {
      id: "2",
      name: "Le Bernardin",
      address: "155 W 51st St, New York, NY 10019",
      rating: 4.9,
      personal_rating: 4,
      is_visited: true,
      lat: 40.7614,
      lng: -73.9776,
      cuisine: "French",
      distance: "1.2 mi"
    },
    {
      id: "3",
      name: "Momofuku Noodle Bar",
      address: "171 1st Ave, New York, NY 10003",
      rating: 4.5,
      personal_rating: 0,
      is_visited: false,
      lat: 40.7295,
      lng: -73.9862,
      cuisine: "Asian Fusion",
      distance: "2.1 mi"
    },
    {
      id: "4",
      name: "The Spotted Pig",
      address: "314 W 11th St, New York, NY 10014",
      rating: 4.6,
      personal_rating: 4,
      is_visited: false,
      lat: 40.7358,
      lng: -74.0068,
      cuisine: "British",
      distance: "0.8 mi"
    }
  ]);

  let currentIndex = $state(0);
  let showSearch = $state(false);
  let searchQuery = $state("");
  let filterVisited = $state<"all" | "visited" | "unvisited">("all");

  $effect(() => {
    // Ensure currentIndex is within bounds
    if (currentIndex >= filteredSpots.length) {
      currentIndex = Math.max(0, filteredSpots.length - 1);
    }
  });

  let filteredSpots = $derived(spots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         spot.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterVisited === "all" ||
                         (filterVisited === "visited" && spot.is_visited) ||
                         (filterVisited === "unvisited" && !spot.is_visited);
    return matchesSearch && matchesFilter;
  }));

  let currentSpot = $derived(filteredSpots[currentIndex]);

  function nextSpot() {
    if (currentIndex < filteredSpots.length - 1) {
      currentIndex++;
    }
  }

  function prevSpot() {
    if (currentIndex > 0) {
      currentIndex--;
    }
  }

  function deleteSpot(id: string) {
    spots = spots.filter(s => s.id !== id);
  }

  function toggleVisited(id: string) {
    const spot = spots.find(s => s.id === id);
    if (spot) spot.is_visited = !spot.is_visited;
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@600&display=swap" rel="stylesheet">
</svelte:head>

<div class="app">
  <!-- Header -->
  <header class="header">
    <div class="header-content">
      <h1 class="title">My Spots</h1>
      <div class="header-actions">
        <button class="icon-btn" onclick={() => showSearch = !showSearch}>
          <Search size={20} />
        </button>
        <button class="icon-btn">
          <Navigation size={20} />
        </button>
      </div>
    </div>

    {#if showSearch}
      <div class="search-bar">
        <Search size={18} />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search spots..."
          class="search-input"
        />
      </div>
    {/if}

    <!-- Filter Pills -->
    <div class="filter-pills">
      <button
        class="pill"
        class:active={filterVisited === "all"}
        onclick={() => filterVisited = "all"}
      >
        All ({spots.length})
      </button>
      <button
        class="pill"
        class:active={filterVisited === "visited"}
        onclick={() => filterVisited = "visited"}
      >
        Visited ({spots.filter(s => s.is_visited).length})
      </button>
      <button
        class="pill"
        class:active={filterVisited === "unvisited"}
        onclick={() => filterVisited = "unvisited"}
      >
        To Visit ({spots.filter(s => !s.is_visited).length})
      </button>
    </div>
  </header>

  <!-- Map Container -->
  <div class="map-container">
    <div class="map-placeholder">
      {#if currentSpot}
        <!-- Simplified map visualization -->
        <div class="map-grid">
          {#each filteredSpots as spot, i}
            <div
              class="map-pin"
              class:active={i === currentIndex}
              style="left: {(spot.lng + 74.01) * 3000}px; top: {(40.77 - spot.lat) * 3000}px;"
              onclick={() => currentIndex = i}
            >
              <div class="pin-dot"></div>
              {#if i === currentIndex}
                <div class="pin-label">{spot.name}</div>
              {/if}
            </div>
          {/each}
        </div>

        <div class="map-overlay">
          <div class="location-badge">
            <MapPin size={14} />
            <span>{currentSpot.distance} away</span>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Card Stack -->
  <div class="card-container">
    {#if currentSpot}
      <div class="card" style="--card-index: 0;">
        <!-- Card Content -->
        <div class="card-header">
          <div class="card-title-group">
            <h2 class="card-title">{currentSpot.name}</h2>
            {#if currentSpot.is_visited}
              <div class="visited-badge">
                <Check size={14} />
              </div>
            {/if}
          </div>
          <button class="card-delete" onclick={() => deleteSpot(currentSpot.id)}>
            <Trash2 size={18} />
          </button>
        </div>

        <div class="card-meta">
          <span class="cuisine-tag">{currentSpot.cuisine}</span>
          <span class="distance">{currentSpot.distance}</span>
        </div>

        <div class="card-address">
          <MapPin size={16} />
          <span>{currentSpot.address}</span>
        </div>

        <div class="card-ratings">
          <div class="rating-group">
            <span class="rating-label">Rating</span>
            <div class="rating-value">
              <Star size={16} fill="currentColor" />
              <span>{currentSpot.rating}</span>
            </div>
          </div>
          {#if currentSpot.personal_rating > 0}
            <div class="rating-group">
              <span class="rating-label">Your Rating</span>
              <div class="rating-value personal">
                <Star size={16} fill="currentColor" />
                <span>{currentSpot.personal_rating}</span>
              </div>
            </div>
          {/if}
        </div>

        <div class="card-actions">
          <button
            class="action-btn secondary"
            onclick={() => toggleVisited(currentSpot.id)}
          >
            {currentSpot.is_visited ? "Mark Unvisited" : "Mark Visited"}
          </button>
          <a href={`/spot/${currentSpot.id}`} class="action-btn primary">
            View Details
          </a>
        </div>
      </div>

      <!-- Preview of next card -->
      {#if currentIndex < filteredSpots.length - 1}
        {@const nextSpot = filteredSpots[currentIndex + 1]}
        <div class="card preview" style="--card-index: 1;">
          <div class="card-header">
            <h2 class="card-title">{nextSpot.name}</h2>
          </div>
        </div>
      {/if}
    {:else}
      <div class="empty-state">
        <p>No spots found</p>
      </div>
    {/if}
  </div>

  <!-- Navigation -->
  <div class="nav-controls">
    <button class="nav-btn" disabled={currentIndex === 0} onclick={prevSpot}>
      ←
    </button>
    <div class="nav-indicator">
      {currentIndex + 1} / {filteredSpots.length}
    </div>
    <button class="nav-btn" disabled={currentIndex >= filteredSpots.length - 1} onclick={nextSpot}>
      →
    </button>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #f5f5f7;
    overflow: hidden;
  }

  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    color: #1d1d1f;
    background: linear-gradient(to bottom, #ffffff 0%, #f5f5f7 100%);
  }

  .header {
    padding: 1rem;
    padding-top: max(1rem, env(safe-area-inset-top));
    background: #ffffff;
    border-bottom: 1px solid #e8e8ed;
    z-index: 10;
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
    margin-bottom: 1rem;
  }

  .title {
    font-family: 'Playfair Display', serif;
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .icon-btn {
    background: #f5f5f7;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .icon-btn:active {
    transform: scale(0.95);
    background: #e8e8ed;
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #f5f5f7;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    animation: expandSearch 0.3s ease-out;
  }

  @keyframes expandSearch {
    from {
      opacity: 0;
      transform: scaleY(0.8);
    }
    to {
      opacity: 1;
      transform: scaleY(1);
    }
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1rem;
    outline: none;
    font-family: inherit;
  }

  .filter-pills {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .filter-pills::-webkit-scrollbar {
    display: none;
  }

  .pill {
    background: transparent;
    border: 1.5px solid #e8e8ed;
    border-radius: 20px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    color: #1d1d1f;
  }

  .pill.active {
    background: #1d1d1f;
    color: #ffffff;
    border-color: #1d1d1f;
  }

  .map-container {
    height: 200px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    animation: fadeIn 0.6s ease-out 0.2s backwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .map-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;
  }

  .map-grid {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .map-pin {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: pointer;
    transition: all 0.3s;
    z-index: 1;
  }

  .map-pin.active {
    z-index: 2;
  }

  .pin-dot {
    width: 12px;
    height: 12px;
    background: #ffffff;
    border: 2px solid #1d1d1f;
    border-radius: 50%;
    transition: all 0.3s;
  }

  .map-pin.active .pin-dot {
    width: 16px;
    height: 16px;
    background: #ff3b30;
    border-color: #ffffff;
    box-shadow: 0 4px 12px rgba(255, 59, 48, 0.4);
  }

  .pin-label {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #1d1d1f;
    color: #ffffff;
    padding: 0.25rem 0.75rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    margin-top: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .pin-label::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-bottom-color: #1d1d1f;
  }

  .map-overlay {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .location-badge {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .card-container {
    flex: 1;
    position: relative;
    padding: 1.5rem 1rem;
    overflow: visible;
  }

  .card {
    background: #ffffff;
    border-radius: 24px;
    padding: 1.5rem;
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.08),
      0 4px 12px rgba(0, 0, 0, 0.04);
    position: absolute;
    top: 1.5rem;
    left: 1rem;
    right: 1rem;
    transform: translateY(calc(var(--card-index) * 8px)) scale(calc(1 - var(--card-index) * 0.02));
    opacity: calc(1 - var(--card-index) * 0.3);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: calc(10 - var(--card-index));
    animation: cardSlide 0.5s ease-out;
  }

  @keyframes cardSlide {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(calc(var(--card-index) * 8px)) scale(calc(1 - var(--card-index) * 0.02));
    }
  }

  .card.preview {
    pointer-events: none;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .card-title-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
  }

  .visited-badge {
    background: #34c759;
    color: #ffffff;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .card-delete {
    background: #f5f5f7;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #ff3b30;
    transition: all 0.2s;
  }

  .card-delete:active {
    transform: scale(0.9);
    background: #ffebea;
  }

  .card-meta {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .cuisine-tag {
    background: #f5f5f7;
    padding: 0.375rem 0.75rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .distance {
    color: #86868b;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
  }

  .card-address {
    display: flex;
    gap: 0.5rem;
    color: #86868b;
    font-size: 0.9375rem;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .card-ratings {
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
    background: #f5f5f7;
    border-radius: 12px;
    margin-bottom: 1.5rem;
  }

  .rating-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .rating-label {
    font-size: 0.75rem;
    color: #86868b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .rating-value {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #f5a623;
  }

  .rating-value.personal {
    color: #667eea;
  }

  .card-actions {
    display: flex;
    gap: 0.75rem;
  }

  .action-btn {
    flex: 1;
    border: none;
    border-radius: 12px;
    padding: 1rem;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-btn.primary {
    background: #1d1d1f;
    color: #ffffff;
  }

  .action-btn.primary:active {
    transform: scale(0.98);
    background: #333336;
  }

  .action-btn.secondary {
    background: transparent;
    color: #1d1d1f;
    border: 1.5px solid #e8e8ed;
  }

  .action-btn.secondary:active {
    background: #f5f5f7;
  }

  .nav-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
    background: #ffffff;
    border-top: 1px solid #e8e8ed;
  }

  .nav-btn {
    background: #f5f5f7;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-family: inherit;
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .nav-btn:not(:disabled):active {
    transform: scale(0.95);
    background: #e8e8ed;
  }

  .nav-indicator {
    font-size: 0.9375rem;
    font-weight: 500;
    color: #86868b;
  }

  .empty-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #86868b;
  }
</style>
