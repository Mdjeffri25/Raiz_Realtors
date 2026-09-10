import axiosClient from './axiosClient';

const auditApi = {
  getAll: (params) => axiosClient.get('/audit-logs', { params }),
};

export default auditApi;
