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

const MPGestureRecognizer = () => {
  //init ML algo for seven gestures
  const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.1.0-alpha-13/wasm"
    );
    const gestureRecognizer = await GestureRecognizer.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        },
        runningMode: "VIDEO",
      }
    );
  };
  //createGestureRecognizer();

  return gestureRecognizer;
};

export default MPGestureRecognizer;
