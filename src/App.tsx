import { useState, useRef } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import HandGesture from "./components/HandGesture";

function App() {
  const [count, setCount] = useState(0);
  const handleGesture = (gestureName: string, gestureConfidence: string) => {
    console.log(`Die Geste ${gestureName} ist zu ${gestureConfidence} sicher`);
  };

  return (
    <div>
      <HandGesture onGesture={handleGesture} />
    </div>
  );
}

export default App;
