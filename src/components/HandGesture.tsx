import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import Message from "./Message";
import Canvas from "./Canvas";

let gestureRecognizer: any;
let enableWebcamButton;
let webcamRunning = true;
let canvasCtx: any;

interface Props {
  onGesture: (
    gestureFirst: string,
    confidenceFirst: number,
    sideFirst: string,
    gestureSecond?: string,
    confidenceSecond?: number,
    sideSecond?: string
  ) => void;
}

const HandGesture = ({ onGesture }: Props) => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [results, setResults] = useState<Results | null>(null);

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
      numHands: 2,
    });
  };
  createGestureRecognizer();

  useEffect(() => {
    //init MP hand modell
    const hands = new Hands({
      locateFile: (file) => {
        //console.log(`${file}`);
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
    //console.log(results);

    //draw landmarks
    if (results.multiHandLandmarks) {
      //console.log("Found Hand");
      //console.log(results.multiHandLandmarks[0]);
      //console.log(results);

      setResults(results);
    } else {
      setResults(null);
    }
    //Detect Gesture
    let nowInMs = Date.now();
    const resultsRec = gestureRecognizer.recognizeForVideo(video, nowInMs);
    //console.log(resultsRec);
    // if (results.multiHandLandmarks[1]) {
    //   let nowInMs = Date.now();
    //   const resultsRec1 = gestureRecognizer.recognizeForVideo(video, nowInMs);
    //console.log(resultsRec);

    // }
    //console.log("Prediction durhc");
    //get one gestures out of seven
    if (resultsRec.gestures.length > 0) {
      const categoryName = resultsRec.gestures[0][0].categoryName;
      //console.log(`Predicition ${categoryName}`);
      //console.log(`GestRec:`, resultsRec.handednesses[0][0].categoryName);
      const side = resultsRec.handednesses[0][0].categoryName;
      //const handSide = resultsRec.handedne
      const categoryScore = resultsRec.gestures[0][0].score * 100;
      console.log(resultsRec);

      const gestureOutput = `Gesture: ${categoryName}\n Confidence: ${categoryScore} %`;
      //console.log(`${gestureOutput}`);
      if (resultsRec.gestures.length > 1) {
        //change Sides because of mirrroed Webcam
        onGesture(
          resultsRec.gestures[0][0].categoryName,
          resultsRec.gestures[0][0].score * 100,
          resultsRec.handednesses[1][0].categoryName,
          resultsRec.gestures[1][0].categoryName,
          resultsRec.gestures[1][0].score * 100,
          resultsRec.handednesses[0][0].categoryName
        );
      } else {
        onGesture(categoryName, categoryScore, side, "", 0, "");
      }

      //setGestureScore(categoryScore);
      setGestureOutputText(gestureOutput);
      setGestureName(categoryName);
    } else {
      setGestureOutputText("None");
      setGestureScore("NoScore");
      setGestureName("None");
      onGesture("None", 0, "None", "None", 0, "None");
    }
  };

  return (
    <>
      <div>
        {/* draw Result of gesture detection */}
        {/* <Message
          text={gestureOutputText}
          score={gestureScore}
          gesture={gestureName}
        ></Message> */}
      </div>
      <div>
        <Webcam
          audio={false}
          mirrored={true}
          ref={webcamRef}
          style={{
            //display: "none",
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
        {results && (
          <Canvas
            results={results}
            webcamRef={webcamRef}
            canvasRef={canvasRef}
          />
        )}
      </div>
    </>
  );
};

export default HandGesture;
