import axiosClient from './axiosClient';

const authApi = {
  login: (email, password) =>
    axiosClient.post('/auth/login', { email, password }),

  logout: () => {
    localStorage.removeItem('raiz_token');
    localStorage.removeItem('raiz_user');
  },
};

export default authApi;
