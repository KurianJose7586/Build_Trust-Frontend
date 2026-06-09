// Base API URL for the backend
// In local development, it points to localhost:8005
// In production, Vite will use the value from the .env file (VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8005';

export default API_URL;
