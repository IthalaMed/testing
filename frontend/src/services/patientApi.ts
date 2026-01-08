import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PatientRegisterDto } from "../schemas/patient";

export const patientApi = createApi({
  reducerPath: "patientApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Patient"],
  endpoints: (builder) => ({
    registerPatient: builder.mutation<{ tempRegistrationId: string; message: string }, PatientRegisterDto>({
      query: (body) => ({ url: "/patients/register", method: "POST", body }),
    }),
    verifyOtp: builder.mutation<{ patient: any; accessToken?: string }, { tempRegistrationId: string; otp: string }>({
      query: (body) => ({ url: "/patients/verify-otp", method: "POST", body }),
    }),
    getPatient: builder.query<any, string>({
      query: (id) => `/patients/${id}`,
      providesTags: (res, err, id) => [{ type: "Patient", id }],
    }),
  }),
});

export const { useRegisterPatientMutation, useVerifyOtpMutation, useGetPatientQuery } = patientApi;
