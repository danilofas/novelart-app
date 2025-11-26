// Mock @react-native-firebase/auth
const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  getIdToken: jest.fn(() => Promise.resolve('test-token')),
  updateProfile: jest.fn(() => Promise.resolve()),
};

const mockAuth = jest.fn(() => ({
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({user: mockUser})),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({user: mockUser})),
  signInWithCredential: jest.fn(() => Promise.resolve({user: mockUser})),
  signOut: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn();
  }),
}));

mockAuth.GoogleAuthProvider = {
  credential: jest.fn(() => ({})),
};

mockAuth.AppleAuthProvider = jest.fn();

export default mockAuth;
