import React, { useEffect, useRef, useState, useReducer } from "react";
import Webcam from "react-webcam";
import {
  GestureRecognizer,
  FilesetResolver,
  GestureRecognizerResult,
} from "@mediapipe/tasks-vision";

const demosSection = document.getElementById("demos");
let gestureRecognizer: GestureRecognizer;
let runningMode = "IMAGE";
let enableWebcamButton: HTMLButtonElement;
let webcamRunning: Boolean = false;
const videoHeight = "360px";
const videoWidth = "480px";

interface Props {
  onGesture: (
    gestureFirst: string,
    confidenceFirst: number,
    sideFirst: string,
    gestureSecond: string,
    confidenceSecond: number,
    sideSecond: string
  ) => void;
}

const HandGesture = ({ onGesture }: Props) => {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bool, setBool] = useState(false);
  const [results, setResults] = useState<GestureRecognizerResult | null>(null);
  const [gestureRecognizer, setGestureRecognizer] =
    useState<GestureRecognizer | null>(null);

  useEffect(() => {
    const createGestureRecognizer = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.1.0-alpha-13/wasm"
      );
      const recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
      setGestureRecognizer(recognizer);
    };
    createGestureRecognizer();
  }, []);
  console.log(`nach create`);

  let lastVideoTime = -1;
  let resultsRec: GestureRecognizerResult;

  useEffect(() => {
    if (webcamRef.current?.video && gestureRecognizer) {
      predictWebcam();
      console.log(`bin drin`);
    } else {
      console.log(`nicht geschafft`);
      console.log(webcamRef);
      console.log(gestureRecognizer);
    }
  }, [webcamRef.current, gestureRecognizer, bool]);

  async function predictWebcam() {
    const video = webcamRef.current?.video;

    let nowInMs = Date.now();
    if (video && gestureRecognizer) {
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        const roiWidth = videoWidth;
        const roiHeight = videoHeight;

        if (roiWidth > 0 && roiHeight > 0) {
          resultsRec = gestureRecognizer.recognizeForVideo(video, nowInMs);
          setResults(resultsRec);
          console.log(resultsRec);
        } else {
          // toggle + re-render as long as no image can be processed
          console.log("Invalid ROI width or heights");
          setBool(!bool);

          return;
        }
      }
    }

    if (resultsRec && resultsRec.gestures.length > 0) {
      const categoryName = resultsRec.gestures[0][0].categoryName;

      let side = "";
      if (resultsRec.handednesses[0][0].categoryName === "Left") {
        side = "Right";
      } else if (resultsRec.handednesses[0][0].categoryName === "Right") {
        side = "Left";
      }
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
        onGesture(categoryName, categoryScore, side, "None", 0, "None");
      }
    } else {
      onGesture("None", 0, "None", "None", 0, "None");
    }
    if (webcamRef && gestureRecognizer) {
      window.requestAnimationFrame(predictWebcam);
    }
  }

  return (
    <>
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
      </div>
    </>
  );
};

export default HandGesture;
