import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export function mapAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'An unexpected authentication error occurred. Please try again.';
  }
  const code = (error as { code?: string }).code || '';
  const message = (error as { message?: string }).message || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please double-check your credentials.';
    case 'auth/too-many-requests':
      return 'Too many attempts detected. Please wait a few minutes and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support for assistance.';
    case 'auth/network-request-failed':
      return 'Network error while reaching Firebase Authentication. Check your connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completion.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in Firebase Console (Authentication → Sign-in method → Email/Password). Enable it in Firebase Console or use Google Sign-In.';
    default:
      return message || 'Authentication failed. Please try again.';
  }
}

export async function registerStudentAccount(
  fullName: string,
  email: string,
  password: string
): Promise<User> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(credential.user, { displayName: fullName.trim() });
    await sendEmailVerification(credential.user);
    return credential.user;
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function loginStudentAccount(email: string, password: string): Promise<User> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    await credential.user.reload();
    if (credential.user.emailVerified) {
      await credential.user.getIdToken(true);
    }
    return credential.user;
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function loginWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    await credential.user.getIdToken(true);
    return credential.user;
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function resendStudentVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No active session found. Please log in again.');
  }
  try {
    await sendEmailVerification(user);
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function checkEmailVerificationStatus(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  try {
    await user.reload();
    if (user.emailVerified) {
      await user.getIdToken(true);
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function sendStudentPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function logoutStudentAccount(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}
