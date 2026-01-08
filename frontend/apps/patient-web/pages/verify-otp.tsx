import React, { useState } from "react";
import { useRouter } from "next/router";
import { useVerifyOtpMutation } from "../../src/services/patientApi";

export default function VerifyOtpPage() {
  const router = useRouter();
  const temp = typeof router.query.temp === "string" ? router.query.temp : "";
  const [otp, setOtp] = useState("");
  const [verify, { isLoading }] = useVerifyOtpMutation();

  const submit = async () => {
    try {
      const res = await verify({ tempRegistrationId: temp, otp }).unwrap();
      // store token and redirect
      localStorage.setItem("accessToken", res.accessToken || "SIM");
      router.push(`/dashboard?patientId=${res.patient.id}`);
    } catch (e: any) {
      alert(e?.data?.message || "Verify failed");
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "48px auto" }}>
      <h1>Verify OTP</h1>
      <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
      <button onClick={submit} disabled={isLoading}>{isLoading ? "Verifying..." : "Verify"}</button>
    </main>
  );
}
