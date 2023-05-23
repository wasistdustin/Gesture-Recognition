import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import Message from "./Message";

let gestureRecognizer: any;
let enableWebcamButton;
let webcamRunning = true;
let canvasCtx: any;

const MPHands = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gestureOutputText, setGestureOutputText] = useState("");
  const [gestureScore, setGestureScore] = useState("");
  const [gestureName, setGestureName] = useState("");
  //init ML algo for seven gestures
  const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.1.0-alpha-13/wasm"
    );
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
      },
      runningMode: "VIDEO",
    });
  };
  createGestureRecognizer();

  useEffect(() => {
    //init MP hand modell
    const hands = new Hands({
      locateFile: (file) => {
        console.log(`${file}`);
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(onResults);
    //get frame for hand detection
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video !== null
    ) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          const video = webcamRef.current?.video;
          if (video) {
            await hands.send({ image: video });
          }
        },
        width: 360,
        height: 640,
      });
      camera.start();
    }
  }, []);
  //draw landmarks + gesture detection
  const onResults = (results: Results) => {
    const video = webcamRef.current?.video;
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const canvasCtx = canvasElement.getContext("2d");
    if (!canvasCtx) return;

    const videoWidth = video?.videoWidth;
    const videoHeight = video?.videoHeight;
    if (!videoWidth || !videoHeight) return;

    // Set canvas width
    canvasElement.width = videoWidth;
    canvasElement.height = videoHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
    canvasCtx.translate(videoWidth, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    //draw landmarks
    if (results.multiHandLandmarks) {
      console.log("Found Hand");
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }
    canvasCtx.restore();
    let nowInMs = Date.now();
    const resultsRec = gestureRecognizer.recognizeForVideo(video, nowInMs);
    console.log("Prediction durhc");
    //detect gestures one of seven
    if (resultsRec.gestures.length > 0) {
      const categoryName = resultsRec.gestures[0][0].categoryName;
      console.log(`Predicition ${categoryName}`);

      const categoryScore = (resultsRec.gestures[0][0].score * 100).toFixed(2);

      const gestureOutput = `Gesture: ${categoryName}\n Confidence: ${categoryScore} %`;
      console.log(`${gestureOutput}`);
      setGestureScore(categoryScore);
      setGestureOutputText(gestureOutput);
      setGestureName(categoryName);
    } else {
      setGestureOutputText("None");
      setGestureScore("NoScore");
      setGestureName("None");
    }
  };

  return (
    <>
      <div>
        {/* draw Result of gesture detection */}
        <Message
          text={gestureOutputText}
          score={gestureScore}
          gesture={gestureName}
        ></Message>
      </div>
      <div>
        <Webcam
          audio={false}
          mirrored={true}
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: "0",
            right: "0",
            textAlign: "center",
            zIndex: 9,
            width: 360,
            height: 640,
          }}
        ></Webcam>
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: "0",
            right: "0",
            textAlign: "center",
            zIndex: 9,
            width: 360,
            height: 640,
          }}
        ></canvas>
      </div>
    </>
  );
};

export default MPHands;
