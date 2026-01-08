import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientRegisterSchema, PatientRegisterDto } from "../../src/schemas/patient";
import { useRegisterPatientMutation } from "../../src/services/patientApi";

export default function RegisterPage() {
  const [registerPatient, { isLoading }] = useRegisterPatientMutation();
  const { register, handleSubmit, formState } = useForm<PatientRegisterDto>({
    resolver: zodResolver(PatientRegisterSchema),
  });

  const onSubmit = async (data: PatientRegisterDto) => {
    try {
      const res = await registerPatient(data).unwrap();
      // For demo, tempRegistrationId contains encoded payload for local verification
      window.location.href = `/verify-otp?temp=${encodeURIComponent(res.tempRegistrationId)}`;
    } catch (e: any) {
      alert(e?.data?.message || "Registration failed");
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "48px auto" }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="First name" {...register("firstName")} />
        {formState.errors.firstName && <div style={{ color: "red" }}>{formState.errors.firstName.message}</div>}
        <input placeholder="Last name" {...register("lastName")} />
        <input placeholder="ID Number (13 digits)" {...register("idNumber")} />
        <input type="date" {...register("dateOfBirth")} />
        <input placeholder="Phone" {...register("phoneNumber")} />
        <input placeholder="Email" {...register("email")} />
        <button type="submit" disabled={isLoading}>{isLoading ? "Sending OTP..." : "Register"}</button>
      </form>
    </main>
  );
}
