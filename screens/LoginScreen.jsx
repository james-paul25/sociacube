import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import bcrypt from "bcryptjs";
import HomeScreen from "./HomeScreen";

bcrypt.setRandomFallback((len) => {
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = Math.floor(Math.random() * 256);
  }
  return buf;
});

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Missing Fields", "Please enter both username and password.");
      return;
    }

    try {
      const userRef = doc(db, "users", username);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert("User Not Found", "No account found with that username.");
        return;
      }

      const userData = userSnap.data();
      const isPasswordValid = bcrypt.compareSync(password, userData.password);

      if (!isPasswordValid) {
        Alert.alert("Incorrect Password", "The password you entered is wrong.");
        setPassword("");
        return;
      }

      // Successful login
      // Updating the lastLogin field
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
      });
      Alert.alert("Success", `Welcome back, ${userData.name}!`);
      navigation.navigate("Home", {
        user: {
          name: userData.name,
          email: userData.email,
          username: userData.username,
          password: userData.password,
          createdAt: userData.createdAt,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong while logging in.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Button title="Login" onPress={handleLogin} />

      <TouchableOpacity onPress={() => navigation.navigate("CreateAccount")}>
        <Text style={styles.createText}>Don't have an account? Create one</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  createText: {
    marginTop: 15,
    textAlign: "center",
    color: "#1e90ff",
    textDecorationLine: "underline",
  },
});
