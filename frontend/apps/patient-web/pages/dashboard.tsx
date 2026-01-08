import React from "react";
import { useRouter } from "next/router";
import { useGetPatientQuery } from "../../src/services/patientApi";

export default function DashboardPage() {
  const router = useRouter();
  const patientId = typeof router.query.patientId === "string" ? router.query.patientId : '';
  const { data, isLoading } = useGetPatientQuery(patientId, { skip: !patientId });

  if (!patientId) return <div>Missing patientId</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <main style={{ maxWidth: 900, margin: "48px auto" }}>
      <h1>Welcome, {data.firstName}</h1>
      <section>
        <h2>Summary</h2>
        <p>Patient Number: {data.patientNumber}</p>
        <p>Phone: {data.phoneNumber}</p>
      </section>
    </main>
  );
}
