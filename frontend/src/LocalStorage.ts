

const TOKEN_KEY = "spaw_token";

// Save JWT
export const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Load JWT
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Remove JWT
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
