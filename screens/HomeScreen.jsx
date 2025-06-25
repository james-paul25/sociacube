import React from "react";
import { StyleSheet, View, Text } from "react-native";

export default function HomeScreen({ user }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Homepage!</Text>
      <Text style={styles.text}>Name: {user.displayName}!</Text>
      <Text style={styles.text}>Email: {user.email}!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  text: {
    fontSize: 20,
    color: "#333",
  },
});
