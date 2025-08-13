import axios, { AxiosRequestHeaders } from "axios";

axios.interceptors.request.use(
  function (config) {
    config.baseURL = getBaseUrl();

    try {
      const token = `Bearer ${localStorage.getItem("token") || ""}`;

      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }

      config.headers.Authorization = token;

      config.validateStatus = (status: number) => status >= 200 && status < 300;
    } catch (error) {
      console.error(
        "Error setting Authorization header or validateStatus:",
        error
      );
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

function getBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL;
}

axios.interceptors.response.use(
  (response) => response,
  function (error) {
    return Promise.reject(error?.response ?? error);
  }
);
