<script lang="ts">
	import type { PageData } from './$types';
	import CuisineIcon from '../../components/CuisineIcon.svelte';

	type MasterPlace = PageData['masterPlaces'] extends Array<infer Place> ? Place : any;
	type MasterPlacesResponse =
		| MasterPlace[]
		| {
				total?: number;
				rows?: MasterPlace[];
				documents?: MasterPlace[];
		  };

	let { data }: { data: PageData } = $props();
	const masterPlaces = $derived(data.masterPlaces as MasterPlacesResponse);
	const places = $derived(
		Array.isArray(masterPlaces) ? masterPlaces : (masterPlaces.rows ?? masterPlaces.documents ?? [])
	);
	const totalPlaces = $derived(
		Array.isArray(masterPlaces) ? masterPlaces.length : (masterPlaces.total ?? places.length)
	);
</script>

<div class="spots-page">
	<h1>All the Spots</h1>
	<span class="spot-count">Showing {totalPlaces} places</span>

	<div class="spots-grid">
		{#each places as place}
			<div class="spot-card">
				<div class="spot-header">
					<div class="spot-title-row">
						<CuisineIcon placeTypes={place.place_types} primaryType={place.primaryType} size={20} />
						<h2>{place.name}</h2>
					</div>
					<p>{place.address}</p>
				</div>

				<div class="spot-meta">
					<div class="badges">
						{#if place.rating}
							<span class="badge rating">
								★ {place.rating}
							</span>
						{/if}
						{#if place.price_level}
							<span class="badge price">
								{place.price_level}
							</span>
						{/if}
					</div>
				</div>

				{#if place.websiteURI}
					<a
						href={place.websiteURI}
						target="_blank"
						rel="noopener noreferrer"
						class="website-link"
					>
						Visit Website
					</a>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.spots-page {
		--page-max-width: 80rem;
		--page-padding: 1rem;
		--card-border: var(--sys-color-border);
		--card-surface: var(--sys-color-surface);
		--text-strong: var(--sys-color-text);
		--text-muted: var(--sys-color-text-muted);
		--rating-bg: var(--sys-color-warning-tint);
		--rating-text: var(--sys-color-warning-text);
		--price-bg: var(--sys-color-surface-sunken);
		--price-text: var(--sys-color-text-secondary);
		--link: var(--sys-color-brand);
		--link-hover: var(--sys-color-brand-hover);

		max-width: var(--page-max-width);
		margin: 0 auto;
		padding: var(--page-padding);
	}

	h1 {
		margin: 0 0 1.5rem;
		color: var(--text-strong);
		font-family: var(--sys-font-display);
		font-size: 1.875rem;
		font-weight: var(--sys-display-weight);
		letter-spacing: var(--sys-display-tracking);
		line-height: 1.2;
	}

	.spot-count {
		display: inline-block;
		margin-bottom: 1.5rem;
		color: var(--text-muted);
	}

	.spots-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.spot-card {
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		border: 1px solid var(--card-border);
		border-radius: 0.5rem;
		background: var(--card-surface);
		box-shadow: var(--ref-shadow-sm);
	}

	.spot-header {
		margin-bottom: 1rem;
	}

	.spot-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	h2 {
		margin: 0;
		color: var(--text-strong);
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.35;
	}

	p {
		margin: 0.25rem 0 0;
		color: var(--text-muted);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.spot-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: auto;
		font-size: 0.875rem;
	}

	.badges {
		display: flex;
		gap: 0.5rem;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		font-weight: 500;
		line-height: 1.25;
	}

	.rating {
		background: var(--rating-bg);
		color: var(--rating-text);
	}

	.price {
		background: var(--price-bg);
		color: var(--price-text);
	}

	.website-link {
		margin-top: 1rem;
		color: var(--link);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
	}

	.website-link:hover {
		color: var(--link-hover);
	}

	@media (min-width: 48rem) {
		.spots-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 64rem) {
		.spots-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
