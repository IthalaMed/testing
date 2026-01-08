import React from 'react';
import { View, Text, Button, Alert, ScrollView } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientRegisterSchema, PatientRegisterDto } from '../schemas/patient';
import { TextInput } from '../components/TextInput';
import { useRegisterPatientMutation } from '../services/patientApi';
import * as SecureStore from 'expo-secure-store';

export default function RegisterScreen({ navigation }: any) {
  const [registerPatient, { isLoading }] = useRegisterPatientMutation();
  const { control, handleSubmit, formState } = useForm<PatientRegisterDto>({
    resolver: zodResolver(PatientRegisterSchema),
    defaultValues: {
      emergencyContacts: [{ name: '', relationship: '', phone: '' }],
      otpChannel: 'sms',
    } as any,
  });

  const onSubmit = async (data: PatientRegisterDto) => {
    try {
      const res = await registerPatient(data).unwrap();
      // For local dev stub: tempRegistrationId contains base64 encoded payload.
      // Navigate to Verify OTP with param
      navigation.navigate('VerifyOtp', { tempRegistrationId: res.tempRegistrationId });
    } catch (err: any) {
      Alert.alert('Registration failed', err?.data?.message || err.message || 'Unknown error');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 12 }}>Register</Text>

      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, value } }) => (
          <TextInput label="First name" value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, value } }) => <TextInput label="Last name" value={value} onChangeText={onChange} />}
      />
      <Controller
        control={control}
        name="idNumber"
        render={({ field: { onChange, value } }) => <TextInput label="SA ID Number" value={value} onChangeText={onChange} keyboardType="number-pad" />}
      />
      <Controller
        control={control}
        name="dateOfBirth"
        render={({ field: { onChange, value } }) => <TextInput label="Date of birth (YYYY-MM-DD)" value={value} onChangeText={onChange} />}
      />
      <Controller
        control={control}
        name="phoneNumber"
        render={({ field: { onChange, value } }) => <TextInput label="Phone" value={value} onChangeText={onChange} keyboardType="phone-pad" />}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => <TextInput label="Email (optional)" value={value} onChangeText={onChange} keyboardType="email-address" />}
      />

      <Button title={isLoading ? 'Sending OTP...' : 'Register'} onPress={() => handleSubmit(onSubmit)()} disabled={isLoading} />
    </ScrollView>
  );
}
