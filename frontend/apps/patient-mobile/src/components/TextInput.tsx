import React from 'react';
import { TextInput as RNTextInput, View, Text, StyleSheet } from 'react-native';

type Props = {
  label?: string;
  error?: string | null;
} & React.ComponentProps<typeof RNTextInput>;

export const TextInput: React.FC<Props> = ({ label, error, ...rest }) => {
  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput style={[styles.input, error ? styles.inputError : null]} {...rest} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: { marginBottom: 6, fontSize: 14, color: '#111' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 6 },
  inputError: { borderColor: '#ef4444' },
  error: { color: '#ef4444', marginTop: 6 },
});
