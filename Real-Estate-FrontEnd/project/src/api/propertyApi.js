import axiosClient from './axiosClient';

const propertyApi = {
  getProjects: () => axiosClient.get('/projects'),
  getUnits: (params) => axiosClient.get('/units', { params }),
  getUnitById: (id) => axiosClient.get(`/units/${id}`),
};

export default propertyApi;
