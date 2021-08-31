import { useCallback, useEffect, useRef } from "react";

interface Props {
  predict: (data: ImageData) => any;
}

const Canvas: React.FC<Props> = (props) => {
  const dimensions = 16;
  const mouseDownRef = useRef(false);

  const scaleCanvas = useCallback((canvas: HTMLCanvasElement) => {
    let dpi = window.devicePixelRatio;
    let styleHeight = +getComputedStyle(canvas)
      .getPropertyValue("height")
      .slice(0, -2);
    let styleWidth = +getComputedStyle(canvas)
      .getPropertyValue("width")
      .slice(0, -2);
    canvas.setAttribute("height", `${styleHeight * dpi}`);
    canvas.setAttribute("width", `${styleWidth * dpi}`);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      scaleCanvas(canvas);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const mouseDownHandler = (e: MouseEvent) => {
      e.preventDefault();
      mouseDownRef.current = true;
    };
    canvas?.addEventListener("mousedown", mouseDownHandler);
    canvas?.addEventListener("mouseup", () => (mouseDownRef.current = false));
    return () => {
      canvas?.removeEventListener("mousedown", mouseDownHandler);
      canvas?.removeEventListener(
        "mouseup",
        () => (mouseDownRef.current = false)
      );
    };
  });

  return (
    <>
      <canvas
        id="canvas"
        ref={canvasRef}
        height={dimensions}
        width={dimensions}
        onMouseMove={({ clientX, clientY, currentTarget }) => {
          const relativeX = clientX - currentTarget.getBoundingClientRect().x;
          const relativeY = clientY - currentTarget.getBoundingClientRect().y;
          if (mouseDownRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (ctx && canvas) {
              ctx.lineCap = "round";
              ctx.globalAlpha = 0.8;
              ctx.strokeStyle = "white";
              ctx.lineWidth = 25;
              ctx.beginPath();
              ctx.moveTo(relativeX, relativeY);
              ctx.lineTo(relativeX, relativeY);
              ctx.stroke();
            }
          }
        }}
        onMouseOut={() => (mouseDownRef.current = false)}
      />
      <button
        onClick={() => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (ctx && canvas) {
            ctx.drawImage(canvas, 0, 0, 28, 28);
            const imageData = ctx.getImageData(0, 0, 28, 28);
            props.predict(imageData);
          }
        }}
      >
        Predict
      </button>
      <button
        onClick={() => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.closePath();
          }
        }}
      >
        Clear
      </button>
    </>
  );
};

export default Canvas;
