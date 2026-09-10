import axiosClient from './axiosClient';

const dashboardApi = {
  getData: () => axiosClient.get('/dashboard'),
};

export default dashboardApi;
