<script lang="ts">
	import type { PageData } from './$types';

	const { data } = $props()
	const { masterPlaces } = data;
	console.log("[bs] adapter::getAllMasterPlaces::data", masterPlaces);
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-6 text-3xl font-bold">All the Spots</h1>
	<span>Showing {masterPlaces.total} places</span>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each masterPlaces.rows as place}
			<div class="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<div class="mb-4">
					<h2 class="text-lg font-bold text-gray-900">{place.name}</h2>
					<p class="text-sm text-gray-600">{place.address}</p>
				</div>

				<div class="mt-auto flex items-center justify-between text-sm">
					<div class="flex gap-2">
						{#if place.rating}
							<span class="rounded bg-yellow-100 px-2 py-1 font-medium text-yellow-800">
								★ {place.rating}
							</span>
						{/if}
						{#if place.price_level}
							<span class="rounded bg-gray-100 px-2 py-1 font-medium text-gray-800">
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
						class="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
					>
						Visit Website
					</a>
				{/if}
			</div>
		{/each}
	</div>
</div>
