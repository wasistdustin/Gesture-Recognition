import { useState, useRef } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import HandGesture from "./components/HandGesture";

function App() {
  const [count, setCount] = useState(0);
  const handleGesture = (
    gestureFirst: string,
    confidenceFirst: number,
    sideFirst: string,
    gestureSecond?: string,
    confidenceSecond?: number,
    sideSecond?: string
  ) => {
    console.log(
      `Die 1. Geste ${gestureFirst} Confi ${confidenceFirst} Hand: ${sideFirst}`
    );
    console.log(
      `Die 2. Geste ${gestureSecond} Confi ${confidenceSecond} Hand: ${sideSecond}`
    );
  };

  return (
    <div>
      <HandGesture onGesture={handleGesture} />
    </div>
  );
}

export default App;
