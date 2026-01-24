import type { PersistenceRepository } from "$lib/ports/persistence.repository";
import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
import type { UserSpotRecord } from "$lib/core/domain/Spot/Spot";
import { appwriteAuthRepository } from "./auth";
import { transformResultToPlace } from "./dtos/placesToRecord";
import { transformPlaceToUserSpot } from "./dtos/placeToUserSpot";
import { COLLECTIONS, DATABASE_ID, ID, Query, createAdminTablesDB } from "./server-client.server";

// @TODO: review the DB factory pattern to see if we need a singleton or a new instance for each request.
export class AppwriteAdapter implements PersistenceRepository {
  #database: any | null = null; // Appwrite TablesDB/Databases client (lazy)
  constructor(private databaseFactory: () => any) {}

  #db() {
    if (!this.#database) this.#database = this.databaseFactory();
    return this.#database;
  }

  async saveMasterPlace(doc: ResultPlaceRecord, transactionId?: string): Promise<any> {
    const placeRecord = transformResultToPlace(doc);
    const { document } = await this.#db().upsertRow({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.masterPlaces,
      rowId: placeRecord.place_id,
      data: placeRecord,
      total: true,
      ...(transactionId ? { transactionId } : {}),
    });
    return document;
  }

  async saveUserSpot(doc: UserSpotRecord, transactionId?: string): Promise<any> {
    const { document } = await this.#db().createRow({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.userPlaces,
      rowId: ID.unique(),
      data: doc,
      total: true,
      ...(transactionId ? { transactionId } : {}),
    });
    return document;
  }

  async savePlaceAndSpot(masterPlace: any, userId: string | number) {
    const existingSpot = await this.hasUserSpot(masterPlace.name ?? '', userId as string);
    if (existingSpot) {
      console.log("[bs] adapter::savePlaceAndSpot::EXISTING SPOT", existingSpot);
      return { success: true, spotResult: existingSpot };
    }

    try {
    const placeRecordInput: ResultPlaceRecord = transformResultToPlace(masterPlace);
    const spotRecordInput: UserSpotRecord = transformPlaceToUserSpot(masterPlace, userId as string);
    console.log("[bs] adapter::savePlaceAndSpot::placeInput", placeRecordInput);
    console.log("[bs] adapter::savePlaceAndSpot::spotInput", spotRecordInput);

    const tx = await this.#db().createTransaction();
    const txId = tx.$id;
    const placeResult = await this.saveMasterPlace(placeRecordInput, txId);
    const spotResult = await this.saveUserSpot(spotRecordInput, txId);
    console.log("[bs] adapter::savePlaceAndSpot::placeResult", placeResult);
    console.log("[bs] adapter::savePlaceAndSpot::spotResult", spotResult);
    const result = await this.#db().updateTransaction({ transactionId: txId, commit: true });
    return { success: true, spotResult };
  } catch (error) {
    console.error("[bs] adapter::savePlaceAndSpot::error", error);
    return { success: false, error};
  }
  }

  async getMasterPlace(id: string): Promise<any> {
    const { document } = await this.#db().getDocument(DATABASE_ID, COLLECTIONS.masterPlaces, id);
    return document;
  }

  async getUserSpot(rowId: string): Promise<UserSpotRecord | null> {
    try {
    const rowResult = await this.#db().getRow({
        databaseId: DATABASE_ID,
        tableId: COLLECTIONS.userPlaces,
        rowId,
        queries: [Query.select(['*', 'place_id.*'])]
      });
      return rowResult;
    } catch (error) {
      console.error("[bs] adapter::getUserSpot::error", error);
      return null;
    }
  }

  async getUserSpotByName(name: string, userId: string): Promise<any> {
    const { rows } = await this.#db().listRows({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.userPlaces,
      queries: [
        Query.equal("name", name),
      ],
    });
  }

  async updateUserSpot(rowId: string, data: Partial<UserSpotRecord>): Promise<any> {
    await this.#db().updateRow({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.userPlaces,
      rowId: rowId,
      data: data,
      total: true,
    });
    // Fetch the updated row with relationship expanded
    const { rows } = await this.#db().listRows({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.userPlaces,
      queries: [
        Query.equal("$id", rowId),
        Query.select(['*', 'place_id.*'])
      ],
      total: true,
    });
    return rows.length > 0 ? rows[0] : null;
  }

  async getUserSpots(userId: string): Promise<any> {
    const result = await this.#db().listRows({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.userPlaces,
      queries: [
        // Query.equal("user_id", userId),
        Query.select(['*', 'place_id.*']),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ],
      total: true,
    });
    return result;
  }

  async getMasterPlaces(): Promise<any[]> {
    const result = await this.#db().listRows({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.masterPlaces,
      queries: [
        // Query.select(['*', 'place_id.*']),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ],
      total: true,
    });
    // console.log("[bs] adapter::getMasterPlaces::result", result);
    return result?.documents ?? result;
  }

  async hasMasterPlace(id: string): Promise<boolean> {
    const result = await this.#db().listRows({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.masterPlaces,
      queries: [
        Query.equal("id", id),
      ],
    });
    return (result?.total ?? result?.documents?.length ?? 0) > 0;
  }

  async hasUserSpot(name: string, userId): Promise<boolean> {
    const result = await this.#db().listRows({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.userPlaces,
      queries: [
        Query.equal("name", name),
        Query.equal("user_id", userId),
      ],
      total: true,
    });
    console.log("[bs] adapter::hasUserSpot::result", result);
    return (result?.total ?? result?.rows?.length ?? 0) > 0;
  }

  async deleteUserSpot(rowId: string): Promise<any> {
    try {
    const result = await this.#db().deleteRow({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.userPlaces,
      rowId: rowId,
    });
    return { success: true, result };
    } catch (error) {
      console.error("[bs] adapter::deleteUserSpot::error", error);
      return { success: false, error };
    }
  }
}

const appwriteAdapter = new AppwriteAdapter(() => createAdminTablesDB());

export default appwriteAdapter;
export { appwriteAuthRepository };
