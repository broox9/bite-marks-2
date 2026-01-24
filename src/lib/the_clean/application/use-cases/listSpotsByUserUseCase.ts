import type { UserSpotRecord } from "$lib/the_clean/domain/Spot/ISpot";

interface ListSpotsByUserParams {
  userId: string;
  presenter: (docs: any) => UserSpotRecord[];
  getListAdapter: (userId: string) => Promise<any>;
}

export async function listSpotsByUser({ userId, presenter, getListAdapter }: ListSpotsByUserParams) {
  try {
    const spots = await getListAdapter(userId)
    return presenter(spots);
    // const spots = await fetch('http://localhost:9009/spot-list');
    // return presenter(await spots.json());
  } catch (error) {
    console.error(error)
    return []
  }
}
