<script lang="ts">
  import { Star, MapPin, Navigation2, Layers, Filter, Search, X, ChevronDown } from '@lucide/svelte';

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
      cuisine: "Japanese",
      priceLevel: "$$$$"
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
      cuisine: "French",
      priceLevel: "$$$$"
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
      priceLevel: "$$$"
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
      cuisine: "American",
      priceLevel: "$$$"
    },
    {
      id: "5",
      name: "Eleven Madison Park",
      address: "11 Madison Ave, New York, NY",
      rating: 4.9,
      personal_rating: 5,
      is_visited: true,
      lat: 40.7424,
      lng: -73.9873,
      cuisine: "Contemporary",
      priceLevel: "$$$$"
    }
  ]);

  let selectedSpotId = $state<string | null>(null);
  let hoveredSpotId = $state<string | null>(null);
  let showFilters = $state(false);
  let searchQuery = $state("");
  let mapView = $state<"standard" | "satellite">("standard");

  let selectedSpot = $derived(spots.find(s => s.id === selectedSpotId));

  let filteredSpots = $derived(spots.filter(spot =>
    spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  function selectSpot(id: string) {
    selectedSpotId = selectedSpotId === id ? null : id;
  }

  function centerOnSpot(spot: any) {
    selectedSpotId = spot.id;
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="explorer">
  <!-- Map Section -->
  <div class="map-section">
    <div class="map-container">
      <!-- Simplified map visualization -->
      <div class="map-view" class:satellite={mapView === "satellite"}>
        <!-- Map pins -->
        {#each filteredSpots as spot}
          {@const isSelected = selectedSpotId === spot.id}
          {@const isHovered = hoveredSpotId === spot.id}
          <button
            class="map-marker"
            class:selected={isSelected}
            class:hovered={isHovered}
            class:visited={spot.is_visited}
            style="left: {(spot.lng + 74.01) * 3500}px; top: {(40.77 - spot.lat) * 3500}px;"
            onclick={() => selectSpot(spot.id)}
            onmouseenter={() => hoveredSpotId = spot.id}
            onmouseleave={() => hoveredSpotId = null}
          >
            <div class="marker-pin"></div>
            {#if isHovered || isSelected}
              <div class="marker-popup">
                <div class="popup-name">{spot.name}</div>
                <div class="popup-rating">
                  <Star size={10} fill="currentColor" />
                  {spot.rating}
                </div>
              </div>
            {/if}
          </button>
        {/each}

        <!-- Selected spot detail card -->
        {#if selectedSpot}
          <div class="map-detail-card">
            <button class="card-close" onclick={() => selectedSpotId = null}>
              <X size={18} />
            </button>
            <h3 class="card-title">{selectedSpot.name}</h3>
            <div class="card-meta">
              <span class="card-cuisine">{selectedSpot.cuisine}</span>
              <span class="card-price">{selectedSpot.priceLevel}</span>
            </div>
            <div class="card-rating-row">
              <div class="rating-item">
                <Star size={14} fill="#FFB800" color="#FFB800" />
                <span>{selectedSpot.rating}</span>
              </div>
              {#if selectedSpot.personal_rating > 0}
                <div class="rating-item personal">
                  <Star size={14} fill="#6366F1" color="#6366F1" />
                  <span>{selectedSpot.personal_rating}</span>
                </div>
              {/if}
              {#if selectedSpot.is_visited}
                <div class="visited-indicator">Visited</div>
              {/if}
            </div>
            <a href={`/spot/${selectedSpot.id}`} class="card-action">
              View Full Details
            </a>
          </div>
        {/if}
      </div>

      <!-- Map controls -->
      <div class="map-controls">
        <button
          class="map-control-btn"
          class:active={mapView === "standard"}
          onclick={() => mapView = "standard"}
        >
          <Layers size={18} />
        </button>
        <button class="map-control-btn">
          <Navigation2 size={18} />
        </button>
      </div>
    </div>
  </div>

  <!-- List Section -->
  <div class="list-section">
    <!-- Search Header -->
    <div class="list-header">
      <div class="search-container">
        <Search size={20} />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search spots..."
          class="search-input"
        />
        {#if searchQuery}
          <button class="clear-btn" onclick={() => searchQuery = ""}>
            <X size={16} />
          </button>
        {/if}
      </div>
      <button class="filter-btn" onclick={() => showFilters = !showFilters}>
        <Filter size={18} />
      </button>
    </div>

    {#if showFilters}
      <div class="filters-panel">
        <button class="filter-chip">All</button>
        <button class="filter-chip">Visited</button>
        <button class="filter-chip">To Visit</button>
        <button class="filter-chip">Rated</button>
      </div>
    {/if}

    <!-- Spots List -->
    <div class="spots-list">
      <div class="list-count">
        {filteredSpots.length} {filteredSpots.length === 1 ? 'spot' : 'spots'}
      </div>

      {#each filteredSpots as spot}
        <button
          class="spot-item"
          class:selected={selectedSpotId === spot.id}
          onclick={() => selectSpot(spot.id)}
          onmouseenter={() => hoveredSpotId = spot.id}
          onmouseleave={() => hoveredSpotId = null}
        >
          <div class="spot-main">
            <div class="spot-header">
              <h3 class="spot-name">{spot.name}</h3>
              {#if spot.is_visited}
                <div class="spot-badge visited">✓</div>
              {/if}
            </div>

            <div class="spot-address">
              <MapPin size={14} />
              <span>{spot.address}</span>
            </div>

            <div class="spot-meta-row">
              <span class="spot-cuisine">{spot.cuisine}</span>
              <span class="spot-price">{spot.priceLevel}</span>
            </div>

            <div class="spot-ratings">
              <div class="spot-rating">
                <Star size={14} fill="#FFB800" color="#FFB800" />
                <span>{spot.rating}</span>
              </div>
              {#if spot.personal_rating > 0}
                <div class="spot-rating personal">
                  <Star size={14} fill="#6366F1" color="#6366F1" />
                  <span>{spot.personal_rating}</span>
                  <span class="rating-label">You</span>
                </div>
              {/if}
            </div>
          </div>

          <div class="spot-action">
            <ChevronDown size={20} class="chevron" />
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  .explorer {
    height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Work Sans', sans-serif;
    background: #FAFAFA;
  }

  .map-section {
    height: 50vh;
    position: relative;
    flex-shrink: 0;
  }

  .map-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .map-view {
    width: 100%;
    height: 100%;
    background:
      radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(251, 146, 60, 0.15) 0%, transparent 50%),
      linear-gradient(135deg, #E0F2FE 0%, #F3F4F6 100%);
    position: relative;
    animation: mapLoad 0.8s ease-out;
  }

  @keyframes mapLoad {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .map-view.satellite {
    background:
      radial-gradient(circle at 30% 40%, rgba(20, 20, 40, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(40, 20, 20, 0.3) 0%, transparent 50%),
      linear-gradient(135deg, #1F2937 0%, #374151 100%);
  }

  .map-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    z-index: 1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .map-marker.selected,
  .map-marker.hovered {
    z-index: 10;
  }

  .marker-pin {
    width: 32px;
    height: 32px;
    background: #FFFFFF;
    border: 3px solid #3B82F6;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    transition: all 0.3s;
  }

  .map-marker.visited .marker-pin {
    background: #10B981;
    border-color: #10B981;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .map-marker.selected .marker-pin {
    width: 40px;
    height: 40px;
    border-width: 4px;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5);
  }

  .map-marker.hovered .marker-pin {
    transform: rotate(-45deg) scale(1.15);
  }

  .marker-popup {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #FFFFFF;
    padding: 0.5rem 0.875rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    white-space: nowrap;
    margin-bottom: 0.75rem;
    animation: popupAppear 0.2s ease-out;
  }

  @keyframes popupAppear {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .marker-popup::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: #FFFFFF;
  }

  .popup-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1F2937;
    margin-bottom: 0.25rem;
  }

  .popup-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #FFB800;
    font-weight: 600;
  }

  .map-detail-card {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    background: #FFFFFF;
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    animation: cardSlideUp 0.4s ease-out;
    z-index: 20;
  }

  @keyframes cardSlideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #F3F4F6;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .card-close:active {
    transform: scale(0.9);
    background: #E5E7EB;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1F2937;
    margin: 0 2rem 0.75rem 0;
    line-height: 1.3;
  }

  .card-meta {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .card-cuisine,
  .card-price {
    background: #F3F4F6;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #6B7280;
  }

  .card-rating-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .rating-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .visited-indicator {
    background: #10B981;
    color: #FFFFFF;
    padding: 0.25rem 0.625rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .card-action {
    display: block;
    width: 100%;
    background: #3B82F6;
    color: #FFFFFF;
    text-align: center;
    padding: 0.875rem;
    border-radius: 10px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
  }

  .card-action:active {
    transform: scale(0.98);
    background: #2563EB;
  }

  .map-controls {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .map-control-btn {
    background: #FFFFFF;
    border: none;
    border-radius: 10px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
    color: #6B7280;
  }

  .map-control-btn:active {
    transform: scale(0.95);
  }

  .map-control-btn.active {
    background: #3B82F6;
    color: #FFFFFF;
  }

  .list-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #FFFFFF;
    overflow: hidden;
  }

  .list-header {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    border-bottom: 1px solid #E5E7EB;
    background: #FFFFFF;
    animation: slideDown 0.5s ease-out 0.2s backwards;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .search-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #F3F4F6;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    color: #6B7280;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1rem;
    outline: none;
    font-family: inherit;
    color: #1F2937;
  }

  .search-input::placeholder {
    color: #9CA3AF;
  }

  .clear-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    color: #6B7280;
  }

  .filter-btn {
    background: #F3F4F6;
    border: none;
    border-radius: 12px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #6B7280;
    transition: all 0.2s;
  }

  .filter-btn:active {
    transform: scale(0.95);
    background: #E5E7EB;
  }

  .filters-panel {
    padding: 0.75rem 1rem;
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    border-bottom: 1px solid #E5E7EB;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .filters-panel::-webkit-scrollbar {
    display: none;
  }

  .filter-chip {
    background: #F3F4F6;
    border: none;
    border-radius: 20px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    color: #6B7280;
  }

  .filter-chip:active {
    background: #E5E7EB;
  }

  .spots-list {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .list-count {
    padding: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .spot-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #F3F4F6;
    cursor: pointer;
    transition: all 0.2s;
    background: #FFFFFF;
    border: none;
    width: 100%;
    text-align: left;
    font-family: inherit;
  }

  .spot-item:active {
    background: #F9FAFB;
  }

  .spot-item.selected {
    background: #EFF6FF;
    border-left: 4px solid #3B82F6;
  }

  .spot-main {
    flex: 1;
  }

  .spot-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .spot-name {
    font-size: 1rem;
    font-weight: 600;
    color: #1F2937;
    margin: 0;
    line-height: 1.3;
  }

  .spot-badge {
    background: #10B981;
    color: #FFFFFF;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
  }

  .spot-address {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #6B7280;
    font-size: 0.8125rem;
    margin-bottom: 0.5rem;
  }

  .spot-meta-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .spot-cuisine,
  .spot-price {
    font-size: 0.75rem;
    color: #9CA3AF;
  }

  .spot-ratings {
    display: flex;
    gap: 1rem;
  }

  .spot-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .rating-label {
    font-size: 0.75rem;
    color: #9CA3AF;
    font-weight: 500;
  }

  .spot-action {
    color: #9CA3AF;
    transition: transform 0.3s;
  }

  .spot-item.selected .spot-action {
    transform: rotate(180deg);
  }

  @media (min-width: 768px) {
    .explorer {
      flex-direction: row;
    }

    .map-section {
      width: 60%;
      height: 100vh;
    }

    .list-section {
      width: 40%;
    }
  }
</style>
