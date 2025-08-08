import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
  type UserCredential,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebaseconfig";
import type { RegisterData, AuthUser, User } from "../types";

// Convert Firebase User to our User type
export const convertFirebaseUser = async (
  firebaseUser: FirebaseUser
): Promise<AuthUser> => {
  const userDoc = await getUserDocument(firebaseUser.uid);

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || undefined,
    photoURL: firebaseUser.photoURL || undefined,
    emailVerified: firebaseUser.emailVerified,
    name: userDoc?.name,
    company: userDoc?.company,
    phone: userDoc?.phone,
    createdAt: userDoc?.createdAt,
    updatedAt: userDoc?.updatedAt,
    role: userDoc?.role || "user",
    accessToken: await firebaseUser.getIdToken(),
  };
};

// Get user document from Firestore
export const getUserDocument = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user document:", error);
    return null;
  }
};

// Create user document in Firestore
export const createUserDocument = async (
  uid: string,
  userData: Partial<RegisterData>
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      uid,
      email: userData.email,
      name: userData.name,
      company: userData.company,
      phone: userData.phone,
      role: "user",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

// Register new user
export const registerUser = async (
  userData: RegisterData
): Promise<AuthUser> => {
  try {
    const { email, password, ...profileData } = userData;

    // Create user with email and password
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, {
      displayName: profileData.name,
    });

    // Create user document in Firestore
    await createUserDocument(user.uid, userData);

    // Return converted user
    return await convertFirebaseUser(user);
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Login user
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return await convertFirebaseUser(userCredential.user);
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  userData: Partial<User>
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user");
    }

    // Update Firebase Auth profile
    if (userData.name) {
      await updateProfile(currentUser, {
        displayName: userData.name,
      });
    }

    // Update Firestore document
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
