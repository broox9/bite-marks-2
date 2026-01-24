
export interface PersistenceRepository {
  saveMasterPlace: (document: any) => Promise<any>;
  saveUserSpot: (document: any) => Promise<any>;
  savePlaceAndSpot: (masterPlace: any, userId: string | number) => Promise<any>;
  getMasterPlace: (id: string) => Promise<any>;
  getUserSpot: (placeId: string, userId: string) => Promise<any>;
  getUserSpots: (userId: string) => Promise<any>;
  getMasterPlaces: () => Promise<any[]>;
  hasMasterPlace: (id: string) => Promise<boolean>;
  hasUserSpot: (name: string, userId: string) => Promise<boolean>;
  updateUserSpot: (rowId: string, data: any) => Promise<any>;
  deleteUserSpot: (rowId: string) => Promise<any>;
}

