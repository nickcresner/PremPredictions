// Centralize API base URL for both axios and fetch
// Set REACT_APP_API_BASE in Vercel to your Railway backend URL.

import axios from 'axios';

const base = process.env.REACT_APP_API_BASE;

if (base) {
  // Configure axios to use the API base for relative URLs like "/api/..."
  axios.defaults.baseURL = base.replace(/\/$/, '');

  // Wrap fetch so string URLs starting with "/api/" go to the backend
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    try {
      if (typeof input === 'string' && input.startsWith('/api/')) {
        const prefixed = `${axios.defaults.baseURL}${input}`;
        return originalFetch(prefixed, init);
      }
    } catch (_) {}
    return originalFetch(input, init);
  };
}

