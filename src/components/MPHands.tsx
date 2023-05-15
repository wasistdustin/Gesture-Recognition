import React from "react";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import * as hands from "@mediapipe/hands"; //notwendig??
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import * as cam from "@mediapipe/camera_utils"; //notwendig?
import { drawConnectors } from "@mediapipe/drawing_utils";
import { drawLandmarks } from "@mediapipe/drawing_utils";
import { useEffect, useRef, useState } from "react";
import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

let gestureRecognizer: any;
let enableWebcamButton;
let webcamRunning = true;
let canvasCtx: any;
const videoHeight = "360px";
const videoWidth = "480px";

const MPHands = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Before we can use HandLandmarker class we must wait for it to finish
  // loading. Machine Learning models can be large and take a moment to
  // get everything needed to run.
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
  console.log("nach init GestureRec");

  setTimeout(enableCam, 3000);
  console.log("nach Timeout");
  /********************************************************************
  // Demo 2: Continuously grab image from webcam stream and detect it.
  ********************************************************************/

  const video = document.getElementById("webcam") as HTMLVideoElement;
  const canvasElement = document.getElementById(
    "output_canvas"
  ) as HTMLCanvasElement;
  if (canvasElement) {
    const canvasCtx = canvasElement.getContext("2d");
  }

  const gestureOutput = document.getElementById("gesture_output");

  // Check if webcam access is supported.
  function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  console.log("nach deklaraitons");

  // Enable the live webcam view and start detection.
  function enableCam() {
    console.log("Start EnableCAM");
    if (!gestureRecognizer) {
      alert("Please wait for gestureRecognizer to load");
      return;
    }
    // getUsermedia parameters.
    const constraints = {
      video: true,
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    });
  }

  async function predictWebcam() {
    const webcamElement = document.getElementById("webcam");
    // Now let's start detecting the stream.

    let nowInMs = Date.now();
    const results = gestureRecognizer.recognizeForVideo(video, nowInMs);
    console.log("Predicten durch");

    //Anzeigen der Keypoints START
    // canvasCtx.save();
    // canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // if (webcamElement) {
    //   webcamElement.style.width = videoWidth;
    //   webcamElement.style.height = videoHeight;
    // }

    // canvasElement.style.height = videoHeight;

    // canvasElement.style.width = videoWidth;

    // if (results.landmarks) {
    //   for (const landmarks of results.landmarks) {
    //     drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
    //       color: "#00FF00",
    //       lineWidth: 5,
    //     });
    //     drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
    //   }
    // }
    // canvasCtx.restore();
    //Anzeigen der Keypoints ENDE

    if (results.gestures.length > 0) {
      // gestureOutput.style.display = "block";
      const categoryName = results.gestures[0][0].categoryName;
      console.log(`Predicition ${categoryName}`);

      // const categoryScore = parseFloat(
      //   results.gestures[0][0].score * 100
      // ).toFixed(2);
      // gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %`;
    } else {
      // gestureOutput.style.display = "none";
    }
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }
  }

  return (
    <div>
      <div style={{ position: "relative" }}>
        <video id="webcam" autoPlay playsInline></video>
        <canvas
          className="output_canvas"
          id="output_canvas"
          width="1280"
          height="720"
          style={{ position: "absolute", left: "0px", top: "0px" }}
        ></canvas>
        <p id="gesture_output" className="output"></p>
      </div>
    </div>
  );
};

export default MPHands;
