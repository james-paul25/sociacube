import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  Alert,
  Pressable,
  Platform,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import generateScramble from "cube-scramble";

export default function HomeScreen({ route }) {
  const { user } = route.params;

  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [inspection, setInspection] = useState(15);
  const [inspectionActive, setInspectionActive] = useState(false);
  const [solves, setSolves] = useState([]);
  const [scramble, setScramble] = useState("");

  useEffect(() => {
    const loadSolves = async () => {
      const stored = await AsyncStorage.getItem("solves");
      if (stored) setSolves(JSON.parse(stored));
    };
    loadSolves();
    newScramble();

    // Spacebar support (web only)
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleStartStop();
      }
    };
    if (Platform.OS === "web") {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      if (Platform.OS === "web") {
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    let timer;
    if (inspectionActive && inspection > 0) {
      timer = setTimeout(() => setInspection(inspection - 1), 1000);
    } else if (inspection === 0) {
      setInspectionActive(false);
      handleStart();
    }
    return () => clearTimeout(timer);
  }, [inspectionActive, inspection]);

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    const msStr = (ms % 1000).toString().padStart(3, "0");
    return `${s}.${msStr}s`;
  };

  const handleStart = () => {
    setStartTime(Date.now());
    setElapsed(0);
    setRunning(true);
  };

  const handleStartStop = () => {
    if (running) {
      setRunning(false);
      saveSolve(elapsed);
    } else {
      setInspection(15);
      setInspectionActive(true);
    }
  };

  const saveSolve = async (time) => {
    const solveTime = formatTime(time);
    const newSolve = {
      id: Date.now().toString(),
      time: solveTime,
      raw: time,
      scramble: scramble,
      createdAt: new Date(),
    };

    const updatedSolves = [newSolve, ...solves.slice(0, 11)];
    setSolves(updatedSolves);
    await AsyncStorage.setItem("solves", JSON.stringify(updatedSolves));

    try {
      await addDoc(collection(db, "users", userData.username, "solves"), {
        ...newSolve,
        username: userData.username,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.warn("❌ Firestore sync failed", err);
    }

    newScramble();
  };

  const newScramble = () => {
    const scramble = generateScramble();
    setScramble(scramble);
  };

  const calculateAverage = (count) => {
    if (solves.length < count) return "N/A";
    const last = solves.slice(0, count);
    const times = last.map((s) => s.raw).sort((a, b) => a - b);
    if (count >= 5) times.shift();
    if (count >= 5) times.pop();
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    return formatTime(avg);
  };

  const handleDelete = async (id) => {
    Alert.alert("Delete Solve", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = solves.filter((s) => s.id !== id);
          setSolves(updated);
          await AsyncStorage.setItem("solves", JSON.stringify(updated));

          // Optional: delete from Firestore if you stored the ID
        },
      },
    ]);
  };

  return (
    <Pressable style={styles.container} onPress={handleStartStop}>
      <Text style={styles.title}>Welcome, {user?.name}!</Text>

      <Text style={styles.scramble}>Scramble: {scramble}</Text>

      {inspectionActive ? (
        <Text style={styles.inspection}>Inspection: {inspection}s</Text>
      ) : (
        <Text style={styles.timer}>{formatTime(elapsed)}</Text>
      )}

      <Text style={styles.subtitle}>Last Solves (Tap to Delete):</Text>
      <FlatList
        data={solves}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity onLongPress={() => handleDelete(item.id)}>
            <Text style={styles.solveItem}>
              #{index + 1} ⏱ {item.time} 🧩 {item.scramble}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.average}>🔥 Ao5: {calculateAverage(5)}</Text>
      <Text style={styles.average}>🔥 Ao12: {calculateAverage(12)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: { fontSize: 22, textAlign: "center", marginBottom: 10 },
  scramble: {
    fontSize: 16,
    marginBottom: 10,
    color: "#444",
    textAlign: "center",
  },
  inspection: {
    fontSize: 40,
    color: "orange",
    textAlign: "center",
    marginBottom: 20,
  },
  timer: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: { marginTop: 20, fontSize: 18, fontWeight: "600" },
  solveItem: { fontSize: 16, marginTop: 8 },
  average: {
    fontSize: 18,
    marginTop: 12,
    fontWeight: "bold",
    color: "#008080",
  },
});
