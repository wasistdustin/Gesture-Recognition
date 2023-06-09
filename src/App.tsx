import { useState, useRef } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import HandGesture from "./components/HandGesture";

function App() {
  const [count, setCount] = useState(0);
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [firstCon, setFirstCon] = useState(0);
  const [secondCon, setSecondCon] = useState(0);
  const [firstSide, setFirstSide] = useState("");
  const [secondSide, setSecondSide] = useState("");
  const handleGesture = (
    gestureFirst: string,
    confidenceFirst: number,
    sideFirst: string,
    gestureSecond: string,
    confidenceSecond: number,
    sideSecond: string
  ) => {
    console.log(
      `Die 1. Geste ${gestureFirst} Confi ${confidenceFirst} Hand: ${sideFirst}`
    );
    console.log(
      `Die 2. Geste ${gestureSecond} Confi ${confidenceSecond} Hand: ${sideSecond}`
    );
    setFirst(gestureFirst);
    setSecond(gestureSecond);
    setFirstCon(confidenceFirst);
    setSecondCon(confidenceSecond);
    setFirstSide(sideFirst);
    setSecondSide(sideSecond);
  };

  return (
    <div>
      1.Geste {first} {firstCon} {firstSide} <br></br>
      2. Geste {second} {secondCon} {secondSide}
      <HandGesture onGesture={handleGesture} />
    </div>
  );
}

export default App;
