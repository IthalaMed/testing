import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PatientRegisterDto } from '../schemas/patient';
import * as SecureStore from 'expo-secure-store';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

const prepareHeaders = async (headers: Headers) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
};

export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: fetchBaseQuery({ baseUrl, prepareHeaders: (headers) => prepareHeaders(headers) }),
  endpoints: (builder) => ({
    registerPatient: builder.mutation<{ tempRegistrationId: string; message: string }, PatientRegisterDto>({
      query: (body) => ({ url: '/patients/register', method: 'POST', body }),
    }),
    verifyOtp: builder.mutation<{ patient: any; accessToken?: string }, { tempRegistrationId: string; otp: string }>({
      query: (body) => ({ url: '/patients/verify-otp', method: 'POST', body }),
    }),
    getPatient: builder.query<any, string>({
      query: (id) => `/patients/${id}`,
    }),
  }),
});

export const { useRegisterPatientMutation, useVerifyOtpMutation, useGetPatientQuery } = patientApi;
