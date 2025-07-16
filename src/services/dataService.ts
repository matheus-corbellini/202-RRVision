import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  type DocumentSnapshot,
  type QueryConstraint,
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

    dataToReturn.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() } as User);
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
