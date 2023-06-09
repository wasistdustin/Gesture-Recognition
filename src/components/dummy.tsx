import { useEffect, useRef } from "react";
import "@mediapipe/control_utils/control_utils.js";
import "@mediapipe/drawing_utils/drawing_utils.js";
import { Camera } from "@mediapipe/camera_utils";

import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

import "./App.css";

function App() {
  const inputVideoRef = useRef();
  const canvasRef = useRef();
  const contextRef = useRef();

  const init = async () => {
    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`,
    });

    contextRef.current = canvasRef.current.getContext("2d");
    const constraints = {
      video: { width: { min: 1280 }, height: { min: 720 } },
    };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      inputVideoRef.current.srcObject = stream;
      sendToMediaPipe();
    });

    selfieSegmentation.setOptions({
      modelSelection: 1,
      selfieMode: true,
    });

    selfieSegmentation.onResults(onResults);

    const sendToMediaPipe = async () => {
      if (!inputVideoRef.current.videoWidth) {
        console.log(inputVideoRef.current.videoWidth);
        requestAnimationFrame(sendToMediaPipe);
      } else {
        await selfieSegmentation.send({ image: inputVideoRef.current });
        requestAnimationFrame(sendToMediaPipe);
      }
    };
  };

  useEffect(() => {
    init();
  }, []);

  const onResults = (results) => {
    contextRef.current.save();
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    contextRef.current.drawImage(
      results.segmentationMask,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    // Only overwrite existing pixels.
    // contextRef.current.globalCompositeOperation = "source-out";
    // contextRef.current.fillStyle = "#00FF00";
    // contextRef.current.fillRect(
    //   0,
    //   0,
    //   canvasRef.current.width,
    //   canvasRef.current.height
    // );

    // Only overwrite missing pixels.
    // contextRef.current.globalCompositeOperation = "destination-atop";
    contextRef.current.globalCompositeOperation = "source-in";
    contextRef.current.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    contextRef.current.restore();
  };

  return (
    <div className="App">
      <video autoPlay ref={inputVideoRef} />
      <canvas ref={canvasRef} width={1280} height={720} />
    </div>
  );
}

export default App;
