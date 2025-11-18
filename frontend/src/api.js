// src/axios.js

import axios from "axios";
import { API_BASE_URL } from "./config";

const instance = axios.create({
  baseURL: API_BASE_URL,
});

// 요청마다 자동으로 토큰 붙도록 설정
instance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default instance;
