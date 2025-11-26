/**
 * @format
 */

import React from 'react';
import {render} from '@testing-library/react-native';

// Simple smoke test - just checking that the App module can be imported
// More comprehensive testing would require setting up the full navigation context

describe('App', () => {
  it('exports correctly', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const App = require('../App').default;
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });
});

