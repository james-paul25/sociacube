import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const cubeTypes = ["2x2", "3x3", "3x3 OH", "Pyraminx"];

const generateScramble = (type) => {
  const moves = [
    "U",
    "D",
    "L",
    "R",
    "F",
    "B",
    "U'",
    "D'",
    "L'",
    "R'",
    "F'",
    "B'",
  ];
  const scrambleLength =
    type === "2x2"
      ? 10
      : type === "3x3"
      ? 23
      : type === "3x3 OH"
      ? 23
      : type === "Pyraminx"
      ? 12
      : 20;
  let scramble = [];
  for (let i = 0; i < scrambleLength; i++) {
    const move = moves[Math.floor(Math.random() * moves.length)];
    scramble.push(move);
  }
  return scramble.join(" ");
};

export default function HomeScreen({ route }) {
  const { user } = route.params || {};
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [inspection, setInspection] = useState(15);
  const [inspectionActive, setInspectionActive] = useState(false);
  const [solves, setSolves] = useState([]);
  const [scramble, setScramble] = useState("");
  const [bestTime, setBestTime] = useState(null);
  const [cubeType, setCubeType] = useState("3x3");

  useEffect(() => {
    loadSolves();
    generateNewScramble();
  }, [cubeType]);

  const loadSolves = async () => {
    try {
      const stored = await AsyncStorage.getItem(`solves-${cubeType}`);
      if (stored) setSolves(JSON.parse(stored));
    } catch (error) {
      console.error("Failed to load solves", error);
    }
  };

  const saveSolves = async (newList) => {
    setSolves(newList);
    try {
      await AsyncStorage.setItem(`solves-${cubeType}`, JSON.stringify(newList));
    } catch (error) {
      console.error("Failed to save solves", error);
    }
  };

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
      timer = setTimeout(() => setInspection((prev) => prev - 1), 1000);
    } else if (inspection === 0 && inspectionActive) {
      setInspectionActive(false);
      handleStart();
    }
    return () => clearTimeout(timer);
  }, [inspectionActive, inspection]);

  const generateNewScramble = () => {
    const newScramble = generateScramble(cubeType);
    setScramble(newScramble);
  };

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
      cubeType,
      createdAt: new Date(),
    };

    const updatedSolves = [newSolve, ...solves.slice(0, 11)];
    saveSolves(updatedSolves);

    if (!bestTime || time < bestTime.raw) {
      setBestTime(newSolve);
    }

    try {
      await addDoc(collection(db, "users", user.username, "solves"), {
        ...newSolve,
        username: user.username,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.warn("Firestore sync failed", err);
    }

    generateNewScramble();
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
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const solveToDelete = solves.find((s) => s.id === id);
            if (solveToDelete) {
              await deleteDoc(
                doc(
                  db,
                  "users",
                  user.username,
                  "solves",
                  solveToDelete.firestoreId
                )
              );
            }
            const updated = solves.filter((s) => s.id !== id);
            saveSolves(updated);
          } catch (error) {
            console.error("Failed to delete solve", error);
          }
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleStartStop}
      activeOpacity={1}
    >
      <Text style={styles.title}>Welcome, {user?.name || "Socia Cuber"}!</Text>

      <Picker
        selectedValue={cubeType}
        style={{ height: 50, width: 200 }}
        onValueChange={(itemValue) => setCubeType(itemValue)}
      >
        {cubeTypes.map((type) => (
          <Picker.Item key={type} label={type} value={type} />
        ))}
      </Picker>

      <Text style={styles.scramble}>Scramble: {scramble}</Text>

      {inspectionActive ? (
        <Text style={styles.inspection}>Inspection: {inspection}s</Text>
      ) : (
        <Text style={styles.timer}>{formatTime(elapsed)}</Text>
      )}

      {bestTime && (
        <Text style={styles.best}>
          Best Time ({cubeType}): {bestTime.time}
        </Text>
      )}

      <Text style={styles.subtitle}>Last Solves (Tap to Delete):</Text>
      <FlatList
        data={solves}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity onLongPress={() => handleDelete(item.id)}>
            <Text style={styles.solveItem}>
              #{index + 1} {item.time} - {item.scramble}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.average}>Ao5: {calculateAverage(5)}</Text>
      <Text style={styles.average}>Ao12: {calculateAverage(12)}</Text>
    </TouchableOpacity>
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
  best: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
    color: "green",
    textAlign: "center",
  },
});
