import { createRxDatabase, type RxDatabase, type RxCollection, addRxPlugin } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { userSchema, type UserDocType } from "@/db/schemas/user.schema";
import { taskSchema, type TaskDocType } from "@/db/schemas/task.schema";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";

addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);

let devModeInitialized = false;
async function initializeDevMode() {
  if (import.meta.env.DEV && !devModeInitialized) {
    try {
      const devModeModule = await import("rxdb/plugins/dev-mode");
      addRxPlugin(devModeModule.RxDBDevModePlugin);
      devModeInitialized = true;
      console.log("✅ RxDB Dev Mode enabled - You will see detailed error messages");
    } catch (error) {
      console.warn("Failed to load RxDB dev mode plugin:", error);
    }
  }
}

export interface ConstructionTasksDatabase {
  users: RxCollection<UserDocType>;
  tasks: RxCollection<TaskDocType>;
}

type Database = RxDatabase<ConstructionTasksDatabase>;

let databasePromise: Promise<Database> | null = null;

export async function getDatabase(): Promise<Database> {
  if (!databasePromise) {
    databasePromise = (async () => {
      try {
        await initializeDevMode();

        const db = await createRxDatabase<ConstructionTasksDatabase>({
          name: "construction_tasks",
          storage: wrappedValidateAjvStorage({
            storage: getRxStorageDexie(),
          }),
          ignoreDuplicate: false,
        });

        await db.addCollections({
          users: {
            schema: userSchema,
          },
          tasks: {
            schema: taskSchema,
          },
        });

        return db;
      } catch (error) {
        databasePromise = null;
        console.error("Failed to initialize database:", error);
        throw error;
      }
    })();
  }
  return databasePromise;
}

export async function getUsersCollection(): Promise<RxCollection<UserDocType>> {
  const db = await getDatabase();
  return db.users;
}

export async function getTasksCollection(): Promise<RxCollection<TaskDocType>> {
  const db = await getDatabase();
  return db.tasks;
}
