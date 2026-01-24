import { Account, Client, Databases, ID, Permission, Query, Role, TablesDB } from "appwrite";
// import type { SpotInput } from "../../interface-adapters/repositories/SpotRecord";

const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = "665bda0c000ab78d998f";
export const DATABASE_ID = "bite_marks";
export const COLLECTIONS = {
  userPlaces: "places_user",
  masterPlaces: "66b02cb3001e8f0fa113",
  tags: "tags",
};

const client = new Client();
client.setEndpoint(APPWRITE_ENDPOINT);
client.setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);

export const database = new Databases(client);
export const tablesDB = new TablesDB(client);

export { Query, ID, Permission, Role } from "appwrite";

