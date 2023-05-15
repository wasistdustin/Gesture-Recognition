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
import { useEffect, useRef } from "react";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

const MPHands = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Create task for image file processing:

  useEffect(() => {
    // Create task for image file processing:

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
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  }, []);

  const onResults = (results: Results) => {
    async () => {
      const vision = await FilesetResolver.forVisionTasks(
        // path/to/wasm/root
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm "
      );
      const gestureRecognizer = await GestureRecognizer.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
          },
          numHands: 2,
        }
      );
      const gestureRecognitionResult = gestureRecognizer.recognize(
        results.image
      );
      const categoryName = gestureRecognitionResult.gestures[0][0].categoryName;
      console.log(`Geste Erkannt ${categoryName}`);
    };
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
    // const gestureRecognitionResult = gestureRecognizer.recognize(results.image);
    // const categoryName = gestureRecognitionResult.gestures[0][0].categoryName;
    // console.log(`Geste Erkannt ${categoryName}`);
  };

  return (
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
          width: 1280,
          height: 720,
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
          width: 1280,
          height: 720,
        }}
      ></canvas>
    </div>
  );
};

export default MPHands;
