import { useCallback, useEffect, useRef, memo } from "react";

interface Props {
  predict: (data: ImageData) => any;
}

const Canvas: React.FC<Props> = ({ predict }) => {
  const dimensions = 16;
  const mouseDownRef = useRef(false);

  const scaleCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio;
    const styleHeight = +getComputedStyle(canvas)
      .getPropertyValue("height")
      .slice(0, -2);
    const styleWidth = +getComputedStyle(canvas)
      .getPropertyValue("width")
      .slice(0, -2);
    canvas.setAttribute("height", `${styleHeight * dpr}`);
    canvas.setAttribute("width", `${styleWidth * dpr}`);
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
    const mouseUpHandler = (e: MouseEvent) => {
      e.preventDefault();
      mouseDownRef.current = false;
    };
    const touchStartHandler = (e: TouchEvent) => {
      e.preventDefault();
      mouseDownRef.current = true;
    };
    const touchEndHandler = (e: TouchEvent) => {
      e.preventDefault();
      mouseDownRef.current = false;
    };
    canvas?.addEventListener("mousedown", mouseDownHandler);
    canvas?.addEventListener("mouseup", mouseUpHandler);
    canvas?.addEventListener("touchstart", touchStartHandler);
    canvas?.addEventListener("touchend", touchEndHandler);
    return () => {
      canvas?.removeEventListener("mousedown", mouseDownHandler);
      canvas?.removeEventListener("mouseup", mouseUpHandler);
      canvas?.removeEventListener("touchstart", touchStartHandler);
      canvas?.removeEventListener("touchend", touchEndHandler);
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
          console.log("client rect: ", currentTarget.getBoundingClientRect());
          console.log(`x: ${relativeX}, y: ${relativeY}`);
          if (mouseDownRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (ctx && canvas) {
              ctx.lineCap = "round";
              ctx.strokeStyle = "#ffffffff";
              ctx.lineWidth = 25;
              ctx.beginPath();
              ctx.moveTo(relativeX, relativeY);
              ctx.lineTo(relativeX + 1, relativeY + 1);
              ctx.stroke();
            }
          }
        }}
        onMouseMove={({ clientX, clientY, currentTarget }) => {
          const dpr = window.devicePixelRatio;
          const relativeX =
            dpr * (clientX - currentTarget.getBoundingClientRect().x);
          const relativeY =
            dpr * (clientY - currentTarget.getBoundingClientRect().y);
          if (mouseDownRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (ctx && canvas) {
              ctx.lineCap = "round";
              ctx.strokeStyle = "#ffffffff";
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
      <br />
      <button
        onClick={() => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (ctx && canvas) {
            ctx.drawImage(canvas, 0, 0, 28, 28);
            const imageData = ctx.getImageData(0, 0, 28, 28);
            predict(imageData);
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
    </div>
  );
};

const MemoizedCanvas = memo(Canvas);
export default MemoizedCanvas;
