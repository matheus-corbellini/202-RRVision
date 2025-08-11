import {
  addDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  type DocumentSnapshot,
  type QueryConstraint,
  deleteDoc,
  doc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { User } from "../types";

export interface SearchOptions {
  searchTerm?: string;
  field?: string;
  orderByField?: string;
  orderDirection?: "asc" | "desc";
  limitCount?: number;
  lastDoc?: DocumentSnapshot;
}

export interface SearchResult<T> {
  data: T[];
  lastDoc?: DocumentSnapshot;
  hasMore: boolean;
}

function removeUndefined<T extends Record<string, unknown>>(obj: T): T {
  const cleaned: Record<string, unknown> = {};
  Object.keys(obj).forEach((key) => {
    const value = (obj as Record<string, unknown>)[key];
    if (value !== undefined) cleaned[key] = value;
  });
  return cleaned as T;
}

// Search users by various criteria
export const searchUsers = async (
  options: SearchOptions
): Promise<SearchResult<User>> => {
  try {
    const {
      searchTerm,
      field = "name",
      orderByField = "createdAt",
      orderDirection = "desc",
      limitCount = 10,
      lastDoc,
    } = options;

    const usersRef = collection(db, "users");
    const constraints: QueryConstraint[] = [];

    // Add search constraint if provided
    if (searchTerm && field) {
      // For text search, we use range queries (limited but works for prefixes)
      constraints.push(
        where(field, ">=", searchTerm),
        where(field, "<=", searchTerm + "\uf8ff")
      );
    }

    // Add ordering
    constraints.push(orderBy(orderByField, orderDirection));

    // Add pagination
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    // Add limit
    constraints.push(limit(limitCount + 1)); // Get one extra to check if there's more

    const q = query(usersRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    const docs = querySnapshot.docs;

    // Check if there are more results
    const hasMore = docs.length > limitCount;
    const dataToReturn = hasMore ? docs.slice(0, -1) : docs;

    dataToReturn.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      users.push({
        ...(data as unknown as Partial<User>),
        uid: docSnap.id,
      } as User);
    });

    return {
      data: users,
      lastDoc: dataToReturn[dataToReturn.length - 1],
      hasMore,
    };
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

// Search users by email
export const searchUsersByEmail = async (email: string): Promise<User[]> => {
  try {
    const result = await searchUsers({
      searchTerm: email.toLowerCase(),
      field: "email",
      limitCount: 5,
    });
    return result.data;
  } catch (error) {
    console.error("Error searching users by email:", error);
    throw error;
  }
};

// Search users by name
export const searchUsersByName = async (name: string): Promise<User[]> => {
  try {
    const result = await searchUsers({
      searchTerm: name.toLowerCase(),
      field: "name",
      limitCount: 10,
    });
    return result.data;
  } catch (error) {
    console.error("Error searching users by name:", error);
    throw error;
  }
};

// Search users by company
export const searchUsersByCompany = async (
  company: string
): Promise<User[]> => {
  try {
    const result = await searchUsers({
      searchTerm: company.toLowerCase(),
      field: "company",
      limitCount: 20,
    });
    return result.data;
  } catch (error) {
    console.error("Error searching users by company:", error);
    throw error;
  }
};

// Generic search function for any collection
export const searchData = async <T>(
  collectionName: string,
  options: SearchOptions
): Promise<SearchResult<T>> => {
  try {
    const {
      searchTerm,
      field,
      orderByField = "createdAt",
      orderDirection = "desc",
      limitCount = 10,
      lastDoc,
    } = options;

    const collectionRef = collection(db, collectionName);
    const constraints: QueryConstraint[] = [];

    // Add search constraint if provided
    if (searchTerm && field) {
      constraints.push(
        where(field, ">=", searchTerm),
        where(field, "<=", searchTerm + "\uf8ff")
      );
    }

    // Add ordering
    constraints.push(orderBy(orderByField, orderDirection));

    // Add pagination
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    // Add limit
    constraints.push(limit(limitCount + 1));

    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const data: T[] = [];
    const docs = querySnapshot.docs;

    const hasMore = docs.length > limitCount;
    const dataToReturn = hasMore ? docs.slice(0, -1) : docs;

    dataToReturn.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as T);
    });

    return {
      data,
      lastDoc: dataToReturn[dataToReturn.length - 1],
      hasMore,
    };
  } catch (error) {
    console.error(`Error searching ${collectionName}:`, error);
    throw error;
  }
};

// Admin: list all users
export const listAllUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map((d) => ({
    ...(d.data() as Record<string, unknown>),
    uid: d.id,
  })) as User[];
};

// Admin: create user document (does not create auth account)
export const createUserRecord = async (
  user: Omit<User, "uid" | "createdAt" | "updatedAt"> & { uid?: string }
): Promise<string> => {
  if (!user.email) {
    throw new Error("E-mail é obrigatório");
  }
  const normalized = removeUndefined({
    ...user,
    email: user.email.trim().toLowerCase(),
  });

  if (normalized.uid) {
    const ref = doc(db, "users", normalized.uid);
    await setDoc(
      ref,
      removeUndefined({
        ...(normalized as Record<string, unknown>),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
    return normalized.uid;
  }
  const usersRef = collection(db, "users");
  const docRef = await addDoc(
    usersRef,
    removeUndefined({
      ...(normalized as Record<string, unknown>),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  );
  // ensure 'uid' field exists in the document for consistency
  await updateDoc(docRef, { uid: docRef.id });
  return docRef.id;
};

// Admin: update user document
export const updateUserRecord = async (
  uid: string,
  updates: Partial<User>
): Promise<void> => {
  const userRef = doc(db, "users", uid);
  await updateDoc(
    userRef,
    removeUndefined({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
  );
};

// Admin: delete user document
export const deleteUserRecord = async (uid: string): Promise<void> => {
  const userRef = doc(db, "users", uid);
  await deleteDoc(userRef);
};
