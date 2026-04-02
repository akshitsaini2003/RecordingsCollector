const ADMIN_TOKEN_KEY = "recordings_admin_token";
const USER_TOKEN_KEY = "recordings_user_token";
const USER_STORAGE_KEY = "recordings_user_profile";

const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

const setAdminToken = (token) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY);

const getStoredUser = () => {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

const setUserSession = ({ token, user }) => {
  localStorage.setItem(USER_TOKEN_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const clearUserSession = () => {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export {
  ADMIN_TOKEN_KEY,
  USER_TOKEN_KEY,
  clearAdminToken,
  clearUserSession,
  getAdminToken,
  getStoredUser,
  getUserToken,
  setAdminToken,
  setUserSession
};
