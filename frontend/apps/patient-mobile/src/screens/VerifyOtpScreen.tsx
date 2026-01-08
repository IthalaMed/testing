import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useVerifyOtpMutation } from '../services/patientApi';
import * as SecureStore from 'expo-secure-store';

export default function VerifyOtpScreen({ route, navigation }: any) {
  const tempRegistrationId = route.params?.tempRegistrationId;
  const [otp, setOtp] = useState('');
  const [verify, { isLoading }] = useVerifyOtpMutation();

  const submit = async () => {
    try {
      const res = await verify({ tempRegistrationId, otp }).unwrap();
      if (res.accessToken) {
        await SecureStore.setItemAsync('accessToken', res.accessToken);
      }
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard', params: { patientId: res.patient.id } }] });
    } catch (e: any) {
      Alert.alert('Verify failed', e?.data?.message || e.message || 'Unknown error');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Enter OTP</Text>
      <TextInput placeholder="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" style={{ borderWidth: 1, padding: 10, marginBottom: 12 }} />
      <Button title={isLoading ? 'Verifying...' : 'Verify'} onPress={submit} disabled={isLoading} />
    </View>
  );
}
