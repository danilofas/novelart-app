// Mock @react-native-firebase/app
const app = jest.fn(() => ({
  name: '[DEFAULT]',
  options: {},
}));

app.initializeApp = jest.fn();
app.apps = [];

export default app;
