import { openDB, DBSchema, IDBPDatabase } from "idb";

// Define the Session interface matching the PRD data model
export interface Session {
  id: string;                  // unique UUID to differentiate sessions
  vehicleLabel: string;        // e.g., "My car" or "Work van"
  floor: string;               // floor level, e.g. "B2"
  bay: string;                 // bay number, e.g. "124"
  note: string;                // free-text note
  photoBlob: Blob | null;      // compressed JPEG/WebP captured in-app
  startTime: number;           // epoch milliseconds
  durationMinutes: number;     // duration set by user
  expiryTime: number;          // epoch milliseconds (startTime + durationMinutes * 60 * 1000)
  status: "active" | "completed" | "expired";
  completedAt: number | null;  // epoch milliseconds when user marked as "Found My Car"
}

// Define the schema representing the database stores and indexes for type-safety with the `idb` wrapper
interface ParkingTrackerDB extends DBSchema {
  sessions: {
    key: string;
    value: Session;
    indexes: {
      status: string;
      expiryTime: number;
    };
  };
}

const DB_NAME = "parking-tracker-db";
const DB_VERSION = 1;

/**
 * Initializes and returns the IndexedDB database instance.
 * Automatically handles schema migrations and index creation.
 */
export async function initDb(): Promise<IDBPDatabase<ParkingTrackerDB>> {
  return openDB<ParkingTrackerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object store for sessions with 'id' as keyPath
      const store = db.createObjectStore("sessions", {
        keyPath: "id",
      });
      // Index for cheap lookup of active sessions
      store.createIndex("status", "status");
      // Index for sorting active sessions by expiration
      store.createIndex("expiryTime", "expiryTime");
    },
  });
}

/**
 * Saves or updates a session in the database.
 */
export async function saveSession(session: Session): Promise<void> {
  const db = await initDb();
  await db.put("sessions", session);
}

/**
 * Fetches a session by its ID.
 */
export async function getSession(id: string): Promise<Session | undefined> {
  const db = await initDb();
  return db.get("sessions", id);
}

/**
 * Fetches all sessions currently stored in the database.
 */
export async function getAllSessions(): Promise<Session[]> {
  const db = await initDb();
  return db.getAll("sessions");
}

/**
 * Retrieves all sessions flagged as "active" in IndexedDB, sorted by soonest to expire.
 * Note: Some 'active' sessions may be temporally expired but not yet updated in the database.
 * The useSessions hook will handle status re-computation on load.
 */
export async function getActiveSessionsFromDb(): Promise<Session[]> {
  const db = await initDb();
  const activeSessions = await db.getAllFromIndex("sessions", "status", "active");
  // Sort by expiryTime ascending (soonest expiring first)
  return activeSessions.sort((a, b) => a.expiryTime - b.expiryTime);
}

/**
 * Retrieves past sessions (completed or expired), sorted in reverse chronological order
 * (newest completed/expired at the top).
 */
export async function getHistorySessionsFromDb(): Promise<Session[]> {
  const db = await initDb();
  const all = await db.getAll("sessions");
  return all
    .filter((s) => s.status === "completed" || s.status === "expired")
    .sort((a, b) => {
      const timeA = a.completedAt || a.expiryTime;
      const timeB = b.completedAt || b.expiryTime;
      return timeB - timeA; // descending order
    });
}

/**
 * Deletes all completed and expired history sessions, leaving active ones untouched.
 */
export async function clearHistoryFromDb(): Promise<void> {
  const db = await initDb();
  const tx = db.transaction("sessions", "readwrite");
  const store = tx.objectStore("sessions");
  const all = await store.getAll();
  
  for (const session of all) {
    if (session.status === "completed" || session.status === "expired") {
      await store.delete(session.id);
    }
  }
  await tx.done;
}
