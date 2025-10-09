// Configuração da API
export const API_CONFIG = {
  // URL do backend
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  
  // Configurações do Bling
  BLING: {
    CLIENT_ID: import.meta.env.VITE_BLING_CLIENT_ID || '',
    CLIENT_SECRET: import.meta.env.VITE_BLING_CLIENT_SECRET || '',
    REDIRECT_URI: import.meta.env.VITE_BLING_REDIRECT_URI || 'http://localhost:5173/bling/callback',
    BASE_URL: import.meta.env.VITE_BLING_BASE_URL || 'https://api.bling.com.br',
  }
} as const;

export default API_CONFIG;
