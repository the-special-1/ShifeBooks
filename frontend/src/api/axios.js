import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.PROD ? '' : 'http://localhost:5000',
  withCredentials: true
});

export default instance;
