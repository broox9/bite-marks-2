<script lang="ts">
  import { Star, MapPin, Check, X, ChevronRight } from '@lucide/svelte';

  // Mock data organized by "lines" (cuisine types)
  let lines = $state([
    {
      id: "italian",
      name: "Italian Line",
      color: "#E63946",
      spots: [
        { id: "1", name: "Osteria Francescana", address: "Via Stella, 22, Modena", rating: 4.9, is_visited: true, distance: "2.1 mi" },
        { id: "2", name: "Trattoria Sostanza", address: "Via del Porcellana, 25r", rating: 4.7, is_visited: false, distance: "3.5 mi" },
        { id: "3", name: "Da Vittorio", address: "Via Cantalupa, 17", rating: 4.8, is_visited: true, distance: "5.2 mi" }
      ]
    },
    {
      id: "japanese",
      name: "Japanese Line",
      color: "#F4A261",
      spots: [
        { id: "4", name: "Sushi Nakazawa", address: "23 Commerce St, New York", rating: 4.8, is_visited: true, distance: "0.5 mi" },
        { id: "5", name: "Masa", address: "10 Columbus Circle", rating: 4.9, is_visited: false, distance: "1.8 mi" }
      ]
    },
    {
      id: "french",
      name: "French Line",
      color: "#2A9D8F",
      spots: [
        { id: "6", name: "Le Bernardin", address: "155 W 51st St", rating: 4.9, is_visited: true, distance: "1.2 mi" },
        { id: "7", name: "Daniel", address: "60 E 65th St", rating: 4.7, is_visited: false, distance: "2.4 mi" },
        { id: "8", name: "Le Coucou", address: "138 Lafayette St", rating: 4.6, is_visited: false, distance: "0.9 mi" }
      ]
    },
    {
      id: "american",
      name: "American Line",
      color: "#457B9D",
      spots: [
        { id: "9", name: "Gramercy Tavern", address: "42 E 20th St", rating: 4.6, is_visited: false, distance: "1.5 mi" },
        { id: "10", name: "The Spotted Pig", address: "314 W 11th St", rating: 4.5, is_visited: true, distance: "0.8 mi" }
      ]
    }
  ]);

  let selectedLine = $state<string | null>(null);
  let selectedSpot = $state<string | null>(null);

  function selectLine(lineId: string) {
    selectedLine = selectedLine === lineId ? null : lineId;
    selectedSpot = null;
  }

  function selectSpot(spotId: string) {
    selectedSpot = selectedSpot === spotId ? null : spotId;
  }

  function deleteSpot(lineId: string, spotId: string) {
    const line = lines.find(l => l.id === lineId);
    if (line) {
      line.spots = line.spots.filter(s => s.id !== spotId);
      if (line.spots.length === 0) {
        lines = lines.filter(l => l.id !== lineId);
      }
    }
    selectedSpot = null;
  }

  let totalSpots = $derived(lines.reduce((sum, line) => sum + line.spots.length, 0));
  let visitedSpots = $derived(
    lines.reduce((sum, line) => sum + line.spots.filter(s => s.is_visited).length, 0)
  );
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&display=swap" rel="stylesheet">
</svelte:head>

<div class="metro-app">
  <!-- Header -->
  <header class="metro-header">
    <div class="header-top">
      <h1 class="metro-title">BITE MARKS</h1>
      <div class="network-badge">TRANSIT MAP</div>
    </div>
    <div class="stats-bar">
      <div class="stat">
        <span class="stat-value">{totalSpots}</span>
        <span class="stat-label">Stations</span>
      </div>
      <div class="stat">
        <span class="stat-value">{lines.length}</span>
        <span class="stat-label">Lines</span>
      </div>
      <div class="stat">
        <span class="stat-value">{visitedSpots}</span>
        <span class="stat-label">Visited</span>
      </div>
    </div>
  </header>

  <!-- Map Legend -->
  <div class="legend">
    <div class="legend-title">LINES</div>
    <div class="legend-items">
      {#each lines as line}
        <button
          class="legend-item"
          class:active={selectedLine === line.id}
          onclick={() => selectLine(line.id)}
        >
          <div class="line-indicator" style="background: {line.color};"></div>
          <span>{line.name}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Transit Map -->
  <div class="transit-map">
    <div class="map-grid">
      {#each lines as line, lineIndex}
        <div class="transit-line" class:selected={selectedLine === line.id || selectedLine === null}>
          <!-- Line rail -->
          <div class="line-rail" style="background: {line.color};"></div>

          <!-- Stations -->
          <div class="stations">
            {#each line.spots as spot, spotIndex}
              <button
                class="station"
                class:visited={spot.is_visited}
                class:selected={selectedSpot === spot.id}
                onclick={() => selectSpot(spot.id)}
              >
                <div class="station-marker" style="border-color: {line.color};">
                  {#if spot.is_visited}
                    <Check size={12} />
                  {/if}
                </div>
                <div class="station-info">
                  <div class="station-name">{spot.name}</div>
                  <div class="station-meta">
                    <span class="station-distance">{spot.distance}</span>
                    <span class="station-rating">
                      <Star size={10} fill="currentColor" />
                      {spot.rating}
                    </span>
                  </div>
                </div>

                <!-- Expanded station details -->
                {#if selectedSpot === spot.id}
                  <div class="station-expanded">
                    <div class="expanded-content">
                      <div class="expanded-address">
                        <MapPin size={14} />
                        <span>{spot.address}</span>
                      </div>
                      <div class="expanded-actions">
                        <a href={`/spot/${spot.id}`} class="action-detail">
                          View Details
                          <ChevronRight size={16} />
                        </a>
                        <button
                          class="action-delete"
                          onclick={(e) => {
                            e.stopPropagation();
                            deleteSpot(line.id, spot.id);
                          }}
                        >
                          <X size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                {/if}
              </button>

              <!-- Connection line between stations -->
              {#if spotIndex < line.spots.length - 1}
                <div class="station-connector" style="background: {line.color};"></div>
              {/if}
            {/each}
          </div>

          <!-- Line label -->
          <div class="line-label" style="background: {line.color};">
            <span>{line.name}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Footer info -->
  <div class="map-footer">
    <div class="footer-info">
      <div class="legend-symbol">
        <div class="symbol-item">
          <div class="symbol-marker visited"></div>
          <span>Visited</span>
        </div>
        <div class="symbol-item">
          <div class="symbol-marker"></div>
          <span>To Visit</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #FAFAFA;
  }

  .metro-app {
    min-height: 100vh;
    font-family: 'Manrope', sans-serif;
    background: #FAFAFA;
    padding-bottom: 2rem;
  }

  .metro-header {
    background: #1A1A1A;
    color: #FFFFFF;
    padding: 1.5rem 1rem;
    padding-top: max(1.5rem, env(safe-area-inset-top) + 0.5rem);
    animation: headerSlide 0.5s ease-out;
  }

  @keyframes headerSlide {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .metro-title {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    margin: 0;
  }

  .network-badge {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .stats-bar {
    display: flex;
    gap: 2rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.7;
  }

  .legend {
    background: #FFFFFF;
    padding: 1rem;
    border-bottom: 2px solid #E5E5E5;
    animation: fadeIn 0.6s ease-out 0.2s backwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .legend-title {
    font-size: 0.6875rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #666;
    margin-bottom: 0.75rem;
  }

  .legend-items {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .legend-items::-webkit-scrollbar {
    display: none;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #F5F5F5;
    border: 2px solid transparent;
    border-radius: 20px;
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .legend-item.active {
    background: #FFFFFF;
    border-color: #1A1A1A;
  }

  .line-indicator {
    width: 16px;
    height: 4px;
    border-radius: 2px;
  }

  .transit-map {
    padding: 2rem 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .map-grid {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    min-width: 320px;
  }

  .transit-line {
    position: relative;
    opacity: 0.3;
    transition: opacity 0.3s;
    animation: lineAppear 0.8s ease-out backwards;
  }

  .transit-line.selected {
    opacity: 1;
  }

  @keyframes lineAppear {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 0.3;
      transform: translateX(0);
    }
  }

  .transit-line:nth-child(1) { animation-delay: 0.1s; }
  .transit-line:nth-child(2) { animation-delay: 0.2s; }
  .transit-line:nth-child(3) { animation-delay: 0.3s; }
  .transit-line:nth-child(4) { animation-delay: 0.4s; }

  .line-rail {
    position: absolute;
    top: 20px;
    left: 0;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    opacity: 0.2;
  }

  .stations {
    position: relative;
    z-index: 1;
  }

  .station {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    background: #FFFFFF;
    border: none;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    text-align: left;
    width: 100%;
    font-family: inherit;
    position: relative;
  }

  .station:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateX(4px);
  }

  .station.selected {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateX(8px);
  }

  .station-marker {
    width: 28px;
    height: 28px;
    border: 4px solid;
    border-radius: 50%;
    background: #FFFFFF;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: all 0.3s;
  }

  .station.visited .station-marker {
    background: currentColor;
    border-color: currentColor;
    color: #FFFFFF;
  }

  .station-info {
    flex: 1;
  }

  .station-name {
    font-size: 1rem;
    font-weight: 600;
    color: #1A1A1A;
    margin-bottom: 0.25rem;
    line-height: 1.3;
  }

  .station-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8125rem;
    color: #666;
  }

  .station-distance {
    display: flex;
    align-items: center;
  }

  .station-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #F4A261;
  }

  .station-connector {
    width: 6px;
    height: 1rem;
    margin-left: 11px;
    border-radius: 3px;
    opacity: 0.3;
  }

  .station-expanded {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #F5F5F5;
    border-radius: 0 0 12px 12px;
    padding: 1rem;
    margin-top: -8px;
    animation: expandDown 0.3s ease-out;
    z-index: 10;
  }

  @keyframes expandDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .expanded-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .expanded-address {
    display: flex;
    gap: 0.5rem;
    color: #666;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .expanded-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-detail,
  .action-delete {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    text-decoration: none;
  }

  .action-detail {
    background: #1A1A1A;
    color: #FFFFFF;
    border: none;
  }

  .action-detail:active {
    transform: scale(0.98);
  }

  .action-delete {
    background: transparent;
    border: 2px solid #E5E5E5;
    color: #E63946;
  }

  .action-delete:active {
    background: #FFF5F5;
  }

  .line-label {
    position: absolute;
    bottom: -1.5rem;
    right: 0;
    color: #FFFFFF;
    padding: 0.375rem 0.875rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .map-footer {
    background: #FFFFFF;
    padding: 1rem;
    border-top: 2px solid #E5E5E5;
    position: sticky;
    bottom: 0;
  }

  .footer-info {
    max-width: 600px;
    margin: 0 auto;
  }

  .legend-symbol {
    display: flex;
    gap: 2rem;
    justify-content: center;
  }

  .symbol-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: #666;
  }

  .symbol-marker {
    width: 20px;
    height: 20px;
    border: 3px solid #CCC;
    border-radius: 50%;
    background: #FFFFFF;
  }

  .symbol-marker.visited {
    background: #CCC;
    border-color: #CCC;
  }

  @media (min-width: 768px) {
    .map-grid {
      padding: 0 2rem;
    }
  }
</style>
