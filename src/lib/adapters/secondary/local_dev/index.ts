import type { PersistenceRepository } from "$lib/ports/persistence.repository";
// import { randomUUID } from "crypto";
import { readFile, writeFile } from "fs/promises";
// import { join } from "path";
//

function join() { }
function randomUUID() { }

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

  async getMasterPlace(id: string): Promise<any> {
    const data = await readDataFile();
    return data.masterPlaces[id] || null;
  }

  async getUserSpot(id: string): Promise<any> {
    const data = await readDataFile();
    return data.userSpots[id] || null;
  }

  async getUserSpots(userId: string): Promise<any[]> {
    const data = await readDataFile();
    return Object.values(data.userSpots).filter(
      (spot: any) => spot.userId === userId || spot.$userId === userId
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

  async hasUserSpot(id: string): Promise<boolean> {
    const data = await readDataFile();
    return id in data.userSpots;
  }
}

const inMemoryAdapter = new InMemoryAdapter();

export default inMemoryAdapter;
