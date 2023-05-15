import { useState, useRef } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import MPHands from "./components/MPHands";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <MPHands></MPHands>
    </div>
  );
}

export default App;
