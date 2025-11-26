/**
 * @format
 */

describe('App', () => {
  it('exports correctly', () => {
    const App = require('../App').default;
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });
});

