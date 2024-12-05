import axios from "axios";

function fetchClient() {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_API_ENDPOINT,
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    config.headers.Authorization = token
      ? // eslint-disable-next-line no-useless-escape
        `Bearer ${token.replace(/\"/g, "")}`
      : "";
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response.status === 401) {
        console.log('Not authorized');
        // localStorage.removeItem("token");
        // window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export default fetchClient;
