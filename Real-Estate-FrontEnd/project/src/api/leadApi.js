import axiosClient from "./axiosClient";

const leadApi = {
  getAll: () => axiosClient.get("/leads"),

  getById: (id) => axiosClient.get(`/leads/${id}`),

  create: (data) => axiosClient.post("/leads", data),

  update: (id, data) => axiosClient.put(`/leads/${id}`, data),

  delete: (id) => axiosClient.delete(`/leads/${id}`),
};

export default leadApi;