import { useEffect, useRef, memo } from "react";
import {
  scaleCanvas,
  grayScaleImage,
  centerImage,
  f32ArrToImageData,
  findImageBoundaries,
} from "../utils";

interface Props {
  predict: (data: Float32Array) => any;
}

const Canvas: React.FC<Props> = ({ predict }) => {
  const dimensions = 16;
  const mouseDownRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function handlePredict() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 28, 28); //clear old image
      const imageBoundaries = await findImageBoundaries(
        ctx.getImageData(0, 0, canvas.width, canvas.height)
      );
      const canvas2 = document.createElement("canvas");
      const ctx2 = canvas2.getContext("2d") as CanvasRenderingContext2D;
      canvas2.height = imageBoundaries[3];
      canvas2.width = imageBoundaries[2];
      ctx2.putImageData(ctx.getImageData(...imageBoundaries), 0, 0);
      ctx.drawImage(canvas2, 0, 0, 20, 20); //images can fit in a 20/20 box
      const imageData = ctx.getImageData(0, 0, 28, 28);
      const boundaries = await findImageBoundaries(imageData, false);
      const croppedImageData = ctx.getImageData(...boundaries);
      const centeredImageData = await centerImage(
        grayScaleImage(croppedImageData),
        boundaries[2],
        boundaries[3]
      );
      ctx.putImageData(f32ArrToImageData(centeredImageData), 0, 0);
      predict(centeredImageData);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "yellow";
      ctx.fillRect(0, 0, 28, 28);
      ctx.globalAlpha = 1;
    }
  }

  function drawLine(x: number, y: number) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.lineCap = "round";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 25;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 1, y + 1);
      ctx.stroke();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      scaleCanvas(canvas);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const mouseDownHandler = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      mouseDownRef.current = true;
    };
    const mouseUpHandler = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      mouseDownRef.current = false;
    };
    canvas?.addEventListener("mousedown", mouseDownHandler);
    canvas?.addEventListener("mouseup", mouseUpHandler);
    canvas?.addEventListener("touchstart", mouseDownHandler);
    canvas?.addEventListener("touchend", mouseUpHandler);
    return () => {
      canvas?.removeEventListener("mousedown", mouseDownHandler);
      canvas?.removeEventListener("mouseup", mouseUpHandler);
      canvas?.removeEventListener("touchstart", mouseDownHandler);
      canvas?.removeEventListener("touchend", mouseUpHandler);
    };
  });

  return (
    <div id="canvas-container">
      <canvas
        id="canvas"
        ref={canvasRef}
        height={dimensions}
        width={dimensions}
        onTouchMove={({ touches, currentTarget }) => {
          const dpr = window.devicePixelRatio;
          const relativeX =
            dpr *
            (touches[0].clientX - currentTarget.getBoundingClientRect().x);
          const relativeY =
            dpr *
            (touches[0].clientY - currentTarget.getBoundingClientRect().y);
          console.log(
            `client x: ${touches[0].clientX}, client y: ${touches[0].clientY}`
          );
          if (mouseDownRef.current) drawLine(relativeX, relativeY);
        }}
        onMouseMove={({ clientX, clientY, currentTarget }) => {
          const dpr = window.devicePixelRatio;
          const relativeX =
            dpr * (clientX - currentTarget.getBoundingClientRect().x);
          const relativeY =
            dpr * (clientY - currentTarget.getBoundingClientRect().y);
          if (mouseDownRef.current) drawLine(relativeX, relativeY);
        }}
        onMouseOut={() => (mouseDownRef.current = false)}
      />
      <br />
      <button onClick={handlePredict}>Predict</button>
      <button
        onClick={() => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (ctx && canvas) {
            ctx.globalAlpha = 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.closePath();
          }
        }}
      >
        Clear
      </button>
    </div>
  );
};

const MemoizedCanvas = memo(Canvas);
export default MemoizedCanvas;
