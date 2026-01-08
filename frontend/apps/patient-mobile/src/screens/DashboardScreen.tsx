import React from 'react';
import { View, Text, Button } from 'react-native';
import { useGetPatientQuery } from '../services/patientApi';

export default function DashboardScreen({ route }: any) {
  const patientId = route.params?.patientId;
  const { data, isLoading } = useGetPatientQuery(patientId);

  if (isLoading) return <Text>Loading...</Text>;
  if (!data) return <Text>No data</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24 }}>Welcome, {data.firstName}</Text>
      <Text>Patient Number: {data.patientNumber}</Text>
      <Text>Phone: {data.phoneNumber}</Text>
      <View style={{ marginTop: 20 }}>
        <Button title="Book Appointment" onPress={() => {}} />
        <Button title="Start Telemedicine" onPress={() => {}} />
        <Button title="Request Ambulance" onPress={() => {}} />
      </View>
    </View>
  );
}
