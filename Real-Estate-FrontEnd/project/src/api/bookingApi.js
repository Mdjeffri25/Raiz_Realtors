import axiosClient from './axiosClient';

const bookingApi = {
  getAll: () => axiosClient.get('/bookings'),

  create: ({ leadId, unitId }) =>
    axiosClient.post('/bookings', null, {
      params: {
        leadId,
        unitId,
      },
    }),
};

export default bookingApi;