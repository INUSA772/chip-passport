// Client/services/api.js
//
// import.meta.env.DEV is true when running `npm run dev` on your computer
// and false in the production build that Vercel serves.

export const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://chip-passport-server.onrender.com';