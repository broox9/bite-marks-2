<script lang="ts">
  type NavItem = {
    label: string;
    icon: string;
    active?: boolean;
  };

  type StatCard = {
    label: string;
    icon: string;
    iconColor: string;
    value: string;
    hint: string;
    hintColor: string;
  };

  type RoverRow = {
    name: string;
    model: string;
    status: "Available" | "Rented" | "Maintenance";
    rate: string;
    location: string;
    action: "Rent" | "View";
  };

  const navGroups: { title: string; items: NavItem[] }[] = [
    {
      title: "Management",
      items: [
        { label: "Dashboard", icon: "dashboard", active: true },
        { label: "Fleet", icon: "rocket_launch" },
        { label: "Bookings", icon: "calendar_today" },
        { label: "Maintenance", icon: "build" }
      ]
    },
    {
      title: "System",
      items: [
        { label: "Analytics", icon: "analytics" },
        { label: "Settings", icon: "settings" }
      ]
    }
  ];

  const stats: StatCard[] = [
    {
      label: "Total Rovers",
      icon: "rocket_launch",
      iconColor: "muted",
      value: "48",
      hint: "+4 this month",
      hintColor: "green"
    },
    {
      label: "Available",
      icon: "check_circle",
      iconColor: "green",
      value: "32",
      hint: "66.7% of fleet",
      hintColor: "muted"
    },
    {
      label: "Rented Out",
      icon: "key",
      iconColor: "orange",
      value: "12",
      hint: "$18.4k revenue",
      hintColor: "orange"
    },
    {
      label: "In Maintenance",
      icon: "construction",
      iconColor: "orange",
      value: "4",
      hint: "2 due this week",
      hintColor: "orange"
    }
  ];

  const rovers: RoverRow[] = [
    {
      name: "Olympus MK-IV",
      model: "All-Terrain Explorer",
      status: "Available",
      rate: "$340",
      location: "Valles Hub",
      action: "Rent"
    },
    {
      name: "Hellas Cruiser",
      model: "Long-Range Transport",
      status: "Rented",
      rate: "$520",
      location: "Elysium Base",
      action: "View"
    },
    {
      name: "Tharsis Scout",
      model: "Light Recon",
      status: "Available",
      rate: "$180",
      location: "Gale Crater",
      action: "Rent"
    },
    {
      name: "Arcadia Hauler",
      model: "Heavy Cargo",
      status: "Maintenance",
      rate: "$680",
      location: "Utopia Depot",
      action: "View"
    },
    {
      name: "Meridiani Drifter",
      model: "Sand Navigator",
      status: "Available",
      rate: "$290",
      location: "Jezero Port",
      action: "Rent"
    },
    {
      name: "Syrtis Ranger",
      model: "Patrol Unit",
      status: "Rented",
      rate: "$410",
      location: "Olympus City",
      action: "View"
    }
  ];
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=JetBrains+Mono:wght@700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="rover-dashboard">
  <aside class="sidebar">
    <div>
      <div class="brand">
        <span class="material-symbols-rounded brand-icon">rocket_launch</span>
        <span class="brand-text">ROVER HQ</span>
      </div>

      {#each navGroups as group}
        <div class="nav-group">
          <div class="nav-title">{group.title}</div>
          <nav>
            {#each group.items as item}
              <a class:active={item.active} class="nav-item" href="/test/pencil-step-3">
                <span class="material-symbols-rounded nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            {/each}
          </nav>
        </div>
      {/each}
    </div>

    <div class="user-card">
      <div class="user-name">Jax Doe</div>
      <div class="user-email">jax@spacecorp.com</div>
    </div>
  </aside>

  <main class="main">
    <header class="topbar">
      <div>
        <h1>Rover Dashboard</h1>
        <p>Manage your fleet and rental operations</p>
      </div>
      <button type="button" class="primary-btn">Add Rover</button>
    </header>

    <section class="stats-grid" aria-label="Fleet summary">
      {#each stats as stat}
        <article class="stat-card">
          <div class="stat-head">
            <span>{stat.label}</span>
            <span class={`material-symbols-rounded stat-icon ${stat.iconColor}`}>{stat.icon}</span>
          </div>
          <div class="stat-value">{stat.value}</div>
          <div class={`stat-hint ${stat.hintColor}`}>{stat.hint}</div>
        </article>
      {/each}
    </section>

    <section class="table-card" aria-label="Rover inventory">
      <div class="table-toolbar">
        <div class="search-shell">
          <span class="material-symbols-rounded">search</span>
          <input type="text" value="Search rovers..." readonly />
        </div>
        <button type="button" class="ghost-btn">Export</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="col-name">Rover Name</th>
              <th>Model</th>
              <th class="col-status">Status</th>
              <th class="col-rate">Rate/Day</th>
              <th class="col-location">Location</th>
              <th class="col-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each rovers as rover}
              <tr>
                <td class="name">{rover.name}</td>
                <td class="muted">{rover.model}</td>
                <td>
                  <span class={`status-pill ${rover.status.toLowerCase()}`}>{rover.status}</span>
                </td>
                <td class="name">{rover.rate}</td>
                <td class="muted">{rover.location}</td>
                <td>
                  <button type="button" class="row-btn">{rover.action}</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>Showing 6 rovers</span>
        <div class="pager">
          <button type="button" class="pager-btn">Previous</button>
          <button type="button" class="pager-btn">Next</button>
        </div>
      </div>
    </section>
  </main>
</div>

<style>
  :global(.material-symbols-rounded) {
    font-family: "Material Symbols Rounded";
    font-weight: 400;
    font-style: normal;
    font-size: 20px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    font-variation-settings:
      "FILL" 0,
      "wght" 400,
      "GRAD" 0,
      "opsz" 20;
  }

  .rover-dashboard {
    --bg: #111111;
    --panel: #171717;
    --panel-2: #151515;
    --line: #232323;
    --line-soft: #1f1f1f;
    --muted: #b8b9b6;
    --text: #ffffff;
    --green: #b6ffce;
    --green-bg: rgba(182, 255, 206, 0.08);
    --orange: #ff8400;
    --orange-bg: rgba(255, 132, 0, 0.08);

    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    display: grid;
    grid-template-columns: 264px minmax(0, 1fr);
    gap: 0;
  }

  .sidebar {
    border-right: 1px solid var(--line-soft);
    padding: 20px 16px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #101010;
    min-height: 100vh;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 22px;
  }

  .brand-icon {
    color: var(--orange);
    font-size: 16px;
  }

  .brand-text {
    color: var(--orange);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    letter-spacing: 0.06em;
    font-weight: 700;
  }

  .nav-group + .nav-group {
    margin-top: 14px;
  }

  .nav-title {
    margin: 0 6px 8px;
    color: #7f807d;
    font-size: 10px;
    font-family: "Geist", sans-serif;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--muted);
    text-decoration: none;
    font-family: "Geist", sans-serif;
    font-size: 12px;
    padding: 8px 10px;
    border-radius: 10px;
    margin-bottom: 2px;
  }

  .nav-item.active {
    background: #262626;
    color: #efefef;
  }

  .nav-icon {
    font-size: 16px;
    color: inherit;
  }

  .user-card {
    border-top: 1px solid var(--line-soft);
    padding-top: 14px;
    font-family: "Geist", sans-serif;
    color: var(--muted);
    font-size: 11px;
  }

  .user-name {
    color: #f2f2f2;
    font-size: 12px;
    margin-bottom: 2px;
  }

  .main {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }

  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .topbar h1 {
    margin: 0;
    font-family: "JetBrains Mono", monospace;
    font-size: 24px;
    line-height: 1.2;
  }

  .topbar p {
    margin: 4px 0 0;
    color: var(--muted);
    font-family: "Geist", sans-serif;
    font-size: 14px;
  }

  .primary-btn {
    border: 0;
    border-radius: 999px;
    background: var(--orange);
    color: #130900;
    font-family: "Geist", sans-serif;
    font-size: 12px;
    font-weight: 500;
    padding: 8px 14px;
    cursor: pointer;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .stat-card {
    background: var(--panel);
    border: 1px solid var(--line);
    padding: 16px 18px;
    min-width: 0;
  }

  .stat-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--muted);
    font-family: "Geist", sans-serif;
    font-size: 12px;
    margin-bottom: 10px;
  }

  .stat-icon {
    font-size: 16px;
  }

  .stat-icon.muted {
    color: var(--muted);
  }

  .stat-icon.green {
    color: var(--green);
  }

  .stat-icon.orange {
    color: var(--orange);
  }

  .stat-value {
    font-family: "JetBrains Mono", monospace;
    font-size: 30px;
    font-weight: 700;
    line-height: 1.1;
  }

  .stat-hint {
    margin-top: 4px;
    font-family: "Geist", sans-serif;
    font-size: 11px;
  }

  .stat-hint.green {
    color: var(--green);
  }

  .stat-hint.orange {
    color: var(--orange);
  }

  .stat-hint.muted {
    color: var(--muted);
  }

  .table-card {
    background: var(--panel-2);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
  }

  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .search-shell {
    height: 32px;
    min-width: 280px;
    border: 1px solid var(--line);
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
    color: #8c8d8a;
    background: #141414;
  }

  .search-shell > span {
    font-size: 16px;
  }

  .search-shell input {
    background: transparent;
    border: 0;
    color: #8c8d8a;
    font-size: 12px;
    font-family: "Geist", sans-serif;
    width: 180px;
    outline: none;
  }

  .ghost-btn {
    border: 1px solid var(--line);
    background: transparent;
    color: var(--text);
    border-radius: 999px;
    padding: 7px 14px;
    font-family: "Geist", sans-serif;
    font-size: 12px;
    cursor: pointer;
  }

  .table-wrap {
    overflow-x: auto;
    border-radius: 10px;
  }

  table {
    width: 100%;
    min-width: 820px;
    border-collapse: collapse;
    font-family: "Geist", sans-serif;
    font-size: 12px;
  }

  thead th {
    text-align: left;
    color: #8f908d;
    font-weight: 400;
    padding: 10px 12px;
    border-bottom: 1px solid var(--line);
  }

  tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    white-space: nowrap;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  td.name {
    color: var(--text);
    font-weight: 500;
  }

  td.muted {
    color: var(--muted);
    font-weight: 400;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    line-height: 1.3;
    border: 1px solid transparent;
  }

  .status-pill.available {
    color: var(--green);
    background: var(--green-bg);
    border-color: rgba(182, 255, 206, 0.16);
  }

  .status-pill.rented {
    color: var(--orange);
    background: var(--orange-bg);
    border-color: rgba(255, 132, 0, 0.16);
  }

  .status-pill.maintenance {
    color: #d7d8d5;
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.08);
  }

  .row-btn {
    border: 1px solid var(--line);
    background: transparent;
    color: #efefef;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
    font-family: "Geist", sans-serif;
    cursor: pointer;
  }

  .table-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #9c9d99;
    font-family: "Geist", sans-serif;
    font-size: 12px;
    padding: 6px 4px 2px;
    gap: 12px;
  }

  .pager {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pager-btn {
    border: 0;
    background: transparent;
    color: #d7d7d5;
    font-family: "Geist", sans-serif;
    font-size: 12px;
    padding: 2px 4px;
    cursor: pointer;
  }

  .col-name {
    width: 220px;
  }

  .col-status,
  .col-rate,
  .col-location {
    width: 120px;
  }

  .col-action {
    width: 100px;
  }

  @media (max-width: 1100px) {
    .rover-dashboard {
      grid-template-columns: 1fr;
    }

    .sidebar {
      min-height: auto;
      border-right: 0;
      border-bottom: 1px solid var(--line-soft);
      gap: 18px;
    }

    .main {
      padding: 20px;
    }

    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 720px) {
    .topbar {
      flex-direction: column;
      align-items: flex-start;
    }

    .table-toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .search-shell {
      min-width: 0;
      width: 100%;
    }

    .search-shell input {
      width: 100%;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .table-footer {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
