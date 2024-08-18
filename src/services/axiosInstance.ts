// src/services/axiosInstance.ts
import { useRouter } from 'vue-router'
import axios from 'axios';
import router from '@/router'

const API_URL = 'https://api.maabi.online/v1.0';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Verifica si el código de error es "invalid_token" y el mensaje es "TOKEN inválido", incluso si el status es 200
    const errorCode = response.data?.response?.code;
    const errorMessage = response.data?.response?.message;

    if (response.status === 200 && errorCode === 'invalid_token' && errorMessage === 'TOKEN inválido') {
      alert('TOKEN inválido. Por favor, inicia sesión de nuevo.');
      
      // Redirige al usuario a la página de login
      router.push({ name: 'signin' });

      // Rechaza la promesa para detener cualquier procesamiento adicional de este response
      return Promise.reject(new Error('TOKEN inválido'));
    }

    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const errorCode = error.response.data?.response?.code;

      if (errorCode === 'token_missing' || errorCode === 'invalid_token') {
        alert(error.response.data?.response?.message || 'Token no válido o faltante.');
        
        // Redirige al usuario a la página de login
        router.push({ name: 'signin' });
      } else if (errorCode === 'invalid_token' && error.response.data?.response?.message === 'El TOKEN ha caducado') {
        alert('El TOKEN ha caducado. Por favor, inicia sesión de nuevo.');
        
        // Redirige al usuario a la página de login
        router.push({ name: 'signin' });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
