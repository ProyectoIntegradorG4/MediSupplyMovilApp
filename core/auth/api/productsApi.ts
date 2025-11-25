import axios from 'axios';
import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';
import { CONFIG } from '@/constants/config';

// Cliente Axios para productos a través del API Gateway
const productsApi = axios.create({
  baseURL: CONFIG.API.GATEWAY_URL,
  timeout: CONFIG.API.TIMEOUT,
});

productsApi.interceptors.request.use(async (config) => {
  const token = await SecureStorageAdapter.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { productsApi };
