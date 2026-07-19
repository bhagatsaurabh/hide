import axios from "axios";
import { auth } from "./firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_HIDE_SERVER,
});

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_HIDE_SERVER,
});

const cdn = axios.create({
  baseURL: import.meta.env.VITE_HIDE_CDN,
});

api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      config.headers.Authorization = idToken;
    }
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  },
);

export default api;
export { publicApi, cdn };
