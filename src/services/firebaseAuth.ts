import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authService} from './api';

// Configure Google Sign-In
// Note: Replace with actual web client ID from Firebase Console > Authentication > Sign-in method > Google
// The web client ID should be in the format: YOUR_CLIENT_ID.apps.googleusercontent.com
// For production, this should be loaded from environment variables or a config file
const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
}

class FirebaseAuthService {
  private currentUser: FirebaseAuthTypes.User | null = null;

  constructor() {
    // Listen for auth state changes
    auth().onAuthStateChanged(user => {
      this.currentUser = user;
    });
  }

  // Email/Password Authentication
  async signInWithEmail(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      const idToken = await userCredential.user.getIdToken();
      await this.syncWithBackend('email', idToken);
      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      if (displayName) {
        await userCredential.user.updateProfile({displayName});
      }
      const idToken = await userCredential.user.getIdToken();
      await this.syncWithBackend('email', idToken);
      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Google Sign-In
  async signInWithGoogle(): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const signInResult = await GoogleSignin.signIn();

      const idToken = signInResult.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token present in Google Sign-In result');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);

      const firebaseToken = await userCredential.user.getIdToken();
      await this.syncWithBackend('google', firebaseToken);

      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Apple Sign-In (iOS only)
  // Note: Apple Sign-In requires:
  // 1. @invertase/react-native-apple-authentication package installed
  // 2. Apple Sign-In capability enabled in Xcode
  // 3. Apple Developer account configured with Sign in with Apple
  // See: https://rnfirebase.io/auth/social-auth#apple
  async signInWithApple(): Promise<FirebaseAuthTypes.UserCredential> {
    throw new Error(
      'Apple Sign-In is not yet configured. To enable Apple Sign-In:\n' +
      '1. Install @invertase/react-native-apple-authentication\n' +
      '2. Enable Apple Sign-In capability in Xcode\n' +
      '3. Configure Apple Developer account\n' +
      '4. Implement the authentication flow'
    );
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      // Sign out from Google if signed in with Google
      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore Google sign out errors
      }

      // Sign out from Firebase
      await auth().signOut();

      // Clear local storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Password Reset
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Get current user
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return auth().currentUser !== null;
  }

  // Get ID Token for API calls
  async getIdToken(): Promise<string | null> {
    const user = auth().currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Sync Firebase auth with backend
  private async syncWithBackend(
    provider: string,
    token: string,
  ): Promise<void> {
    try {
      const response = await authService.socialLogin(provider, token);
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
      }
      if (response.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      // Continue even if backend sync fails - user is still authenticated with Firebase
    }
  }

  // Handle authentication errors
  private handleAuthError(error: unknown): Error {
    if (error instanceof Error) {
      const firebaseError = error as FirebaseAuthTypes.NativeFirebaseAuthError;
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          return new Error('No user found with this email address.');
        case 'auth/wrong-password':
          return new Error('Incorrect password.');
        case 'auth/email-already-in-use':
          return new Error('This email address is already registered.');
        case 'auth/weak-password':
          return new Error(
            'Password is too weak. Please use a stronger password.',
          );
        case 'auth/invalid-email':
          return new Error('Invalid email address.');
        case 'auth/user-disabled':
          return new Error('This account has been disabled.');
        case 'auth/operation-not-allowed':
          return new Error('This operation is not allowed.');
        case 'auth/network-request-failed':
          return new Error('Network error. Please check your connection.');
        default:
          return new Error(
            firebaseError.message || 'An authentication error occurred.',
          );
      }
    }
    return new Error('An unknown error occurred.');
  }
}

export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
