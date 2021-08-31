import Canvas from "./components/Canvas";
import * as tf from "@tensorflow/tfjs";

function App() {
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
  async function predict(data: ImageData) {
    const model = await tf.loadLayersModel("/model.json");
    tf.tidy(() => {
      let convertedImage = tf.tensor2d(formatImageData(data), [1, 784]);
      convertedImage = convertedImage.reshape([1, 28 * 28]);
      convertedImage = tf.cast(convertedImage, "float32");

      const modelOutput = model.predict(convertedImage) as tf.Tensor;
      const outputArray = Array.from(modelOutput.dataSync());
      console.log("prediction:", outputArray.indexOf(Math.max(...outputArray)));
    });
  }
  return (
    <div className="App">
      <Canvas predict={predict} />
    </div>
  );
}

export default App;
