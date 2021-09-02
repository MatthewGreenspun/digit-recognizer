import PredictionDisplay from "./components/PredictionDisplay";
import Canvas from "./components/Canvas";
import { useState, useCallback, useRef } from "react";
import * as tf from "@tensorflow/tfjs";

function App() {
  const [modelOutput, setModelOutput] = useState(new Array<number>(10).fill(0));
  const modelRef = useRef<tf.LayersModel | null>(null);

  const predict = useCallback(async (data: Float32Array) => {
    let model: tf.LayersModel;
    if (modelRef.current) model = modelRef.current;
    else {
      model = await tf.loadLayersModel("/model.json");
      modelRef.current = model;
    }
    tf.tidy(() => {
      let convertedImage = tf.tensor2d(data, [1, 784]);
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
