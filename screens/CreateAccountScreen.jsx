import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { db } from '../firebase/config';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

export default function CreateAccountScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleCreateAccount = async () => {
    if (!name || !email || !username || !password) {
      Alert.alert('Missing Fields', 'Please fill out all fields');
      return;
    }

    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const userRef = doc(db, 'users', username);
      await setDoc(userRef, {
        name,
        email,
        username,
        password: hashedPassword,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Account Created', `Welcome, ${name}!`);
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Something went wrong while creating the account.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title="Create Account" onPress={handleCreateAccount} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 }
});
