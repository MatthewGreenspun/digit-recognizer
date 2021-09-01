import PredictionDisplay from "./components/PredictionDisplay";
import Canvas from "./components/Canvas";
import { useState, useCallback, useRef } from "react";
import * as tf from "@tensorflow/tfjs";

function App() {
  const [modelOutput, setModelOutput] = useState(new Array<number>(10).fill(0));
  const modelRef = useRef<tf.LayersModel | null>(null);

  function formatImageData(data: ImageData) {
    const { data: imageData } = data;
    const newPixelData = new Float32Array(28 * 28);
    for (let i = 0; i < imageData.length; i += 4) {
      const grayScaleVal =
        (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
      newPixelData[i / 4] = grayScaleVal / 255; //scale between 0 and 1
    }
    return newPixelData;
  }
  const predict = useCallback(async (data: ImageData) => {
    let model: tf.LayersModel;
    if (modelRef.current) model = modelRef.current;
    else {
      model = await tf.loadLayersModel("/model.json");
      modelRef.current = model;
    }
    tf.tidy(() => {
      let convertedImage = tf.tensor2d(formatImageData(data), [1, 784]);
      convertedImage = convertedImage.reshape([1, 28 * 28]);
      convertedImage = tf.cast(convertedImage, "float32");

      const modelOutput = model.predict(convertedImage) as tf.Tensor;
      const outputArray = Array.from(modelOutput.dataSync());
      setModelOutput(outputArray);
    });
  }, []);
  return (
    <div id="app">
      <h1>Digit Recognizer with Tensorflow!</h1>
      <div className="wrap-container">
        <Canvas predict={predict} />
        <PredictionDisplay data={modelOutput} />
      </div>
    </div>
  );
}

export default App;
