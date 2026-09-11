import type { PersistenceRepository } from "$lib/ports/persistence.repository";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface LocalData {
  masterPlaces: Record<string, any>;
  userSpots: Record<string, any>;
}

const DATA_FILE = join(process.cwd(), "local-data.json");

async function readDataFile(): Promise<LocalData> {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // File doesn't exist or is empty, return default structure
    return {
      masterPlaces: {},
      userSpots: {},
    };
  }
}

async function writeDataFile(data: LocalData): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export class InMemoryAdapter implements PersistenceRepository {
  async saveMasterPlace(document: any): Promise<any> {
    const data = await readDataFile();
    const id = document.$id || document.id || randomUUID();
    const documentWithId = { ...document, $id: id, id };
    data.masterPlaces[id] = documentWithId;
    await writeDataFile(data);
    return documentWithId;
  }

  async saveUserSpot(document: any): Promise<any> {
    const data = await readDataFile();
    const id = document.$id || document.id || randomUUID();
    const documentWithId = { ...document, $id: id, id };
    data.userSpots[id] = documentWithId;
    await writeDataFile(data);
    return documentWithId;
  }

  async savePlaceAndSpot(masterPlace: any, userId: string | number): Promise<any> {
    const placeId = String(masterPlace.place_id ?? masterPlace.placeId ?? masterPlace.id);
    const existing = await this.hasUserSpot(placeId, String(userId));
    if (existing) return existing;

    await this.saveMasterPlace({ ...masterPlace, id: placeId, $id: placeId });
    return this.saveUserSpot({
      ...masterPlace,
      id: randomUUID(),
      place_id: placeId,
      user_id: String(userId),
      personal_rating: null,
      personal_notes: null,
      is_visited: false,
      social_links: [],
    });
  }

  async getMasterPlace(id: string): Promise<any> {
    const data = await readDataFile();
    return data.masterPlaces[id] || null;
  }

  async getUserSpot(id: string, userId: string): Promise<any> {
    const data = await readDataFile();
    const spot = data.userSpots[id];
    if (!spot) return null;
    const ownerId = spot.user_id ?? spot.userId ?? spot.$userId;
    return ownerId === userId ? spot : null;
  }

  async getUserSpots(userId: string): Promise<any[]> {
    const data = await readDataFile();
    return Object.values(data.userSpots).filter(
      (spot: any) =>
        spot.user_id === userId || spot.userId === userId || spot.$userId === userId
    );
  }

  async getMasterPlaces(): Promise<any[]> {
    const data = await readDataFile();
    return Object.values(data.masterPlaces);
  }

  async hasMasterPlace(id: string): Promise<boolean> {
    const data = await readDataFile();
    return id in data.masterPlaces;
  }

  async hasUserSpot(id: string, userId: string): Promise<boolean> {
    const data = await readDataFile();
    return Object.values(data.userSpots).some((spot: any) => {
      const ownerId = spot.user_id ?? spot.userId ?? spot.$userId;
      const placeId = spot.place_id ?? spot.placeId;
      return ownerId === userId && (placeId === id || spot.name === id);
    });
  }

  async updateUserSpot(rowId: string, patch: any, userId: string): Promise<any> {
    const data = await readDataFile();
    const existing = data.userSpots[rowId];
    const ownerId = existing?.user_id ?? existing?.userId ?? existing?.$userId;
    if (!existing || ownerId !== userId) return null;
    const updated = { ...existing, ...patch, id: rowId, $id: rowId };
    data.userSpots[rowId] = updated;
    await writeDataFile(data);
    return updated;
  }

  async deleteUserSpot(rowId: string, userId: string): Promise<boolean> {
    const data = await readDataFile();
    const existing = data.userSpots[rowId];
    const ownerId = existing?.user_id ?? existing?.userId ?? existing?.$userId;
    if (!existing || ownerId !== userId) return false;
    delete data.userSpots[rowId];
    await writeDataFile(data);
    return true;
  }
}

const inMemoryAdapter = new InMemoryAdapter();

export default inMemoryAdapter;
