import type { MasterPlaceRecord } from "../Place/IPlace";

export interface UserSpotResult {
  id: string;
  name: string | null;
  personal_rating: number | null;
  personal_notes: string  | null;
  is_visited: boolean;
  user_id: string;
  place_id: string;
  social_links: string[];
}

export type UserSpotInput = Omit<UserSpotResult, 'id'> 

export type UserSpotRecord = UserSpotInput & MasterPlaceRecord