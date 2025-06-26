import axios from 'axios';
import { Platform } from 'react-native';

const commonConfigs = {
  baseURL: 'http://10.0.2.2:3000/',
  timeout: 10000,
  headers: {
    buildversion: '1.0.0',
    buildnumber: 1,
    platform: Platform.OS,
  },
};

const instance = axios.create(commonConfigs);

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { data, status } = error.response || {};
    
    switch (status) {
      case 401:
        console.log('Unauthorized');
        break;
      case 403:
        console.log('Forbidden');
        break;
      case 404:
        console.log('Not Found');
        break;
      case 500:
        console.log('Internal Server Error');
        break;
      default:
        console.log('Unknown Error');
    }
    return Promise.reject(error);
  }
);

const responseBody = (response) => {

  return response;
};

const responseError = (error) => {
  return { 
    isError: true, 
    message: error.message || 'Unknown Error',
    status: error.response?.status,
    data: error.response?.data
  };
};

export const api = {
  get: (url, config) =>
    instance.get(url, config).then(responseBody).catch(responseError),
  post: (url, data, config) =>
    instance.post(url, data, config).then(responseBody).catch(responseError),
  put: (url, data, config) =>
    instance.put(url, data, config).then(responseBody).catch(responseError),
  delete: (url, config) =>
    instance.delete(url, config).then(responseBody).catch(responseError),
  patch: (url, data, config) =>
    instance.patch(url, data, config).then(responseBody).catch(responseError),
};

export default api;
