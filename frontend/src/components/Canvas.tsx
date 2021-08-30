import { useState, useCallback, useEffect, useRef } from "react";

const generateRandomColor = () => {
  const posibilities = "0123456789abcdef";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += posibilities[Math.floor(Math.random() * 16)];
  }
  return color;
};

function Canvas() {
  const [color, setColor] = useState("#0055ff");
  const [colors, setColors] = useState(
    new Set(["#ffffff", "#000000", color, "#ff3300", "#ffff00", "#49d100"])
  );
  const [dimensions, setDimensions] = useState(16);
  const [mouseIsDown, setMouseIsDown] = useState(false);
  const [border, setBorder] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [warningShowed, setWarningShowed] = useState(false);

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
  const generateGrid = useCallback(
    (random?: boolean, color?: string) => {
      const arr = [];
      for (let i = 0; i < dimensions ** 2; i++) {
        arr.push(random ? generateRandomColor() : color ? color : "#ffffff");
      }
      return arr;
    },
    [dimensions]
  );
  const [grid, setGrid] = useState(generateGrid);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setGrid(generateGrid());
  }, [dimensions, generateGrid, scaleCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas?.addEventListener("mousedown", (e) => {
      e.preventDefault();
      setMouseIsDown(true);
    });
    canvas?.addEventListener("mouseup", () => setMouseIsDown(false));
    return () => {
      canvas?.removeEventListener("mousedown", (e) => {
        e.preventDefault();
        setMouseIsDown(true);
      });
      canvas?.removeEventListener("mouseup", () => setMouseIsDown(false));
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      scaleCanvas(canvas);

      const squareLength = Math.round(canvas.width / dimensions);
      const rows = dimensions;
      const cols = dimensions;
      let row = 0;
      let col = 0;
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      for (row = 0; row < rows; row++) {
        for (col = 0; col < cols; col++) {
          const squareX = col * squareLength;
          const squareY = row * squareLength;
          if (border) {
            ctx.beginPath();
            ctx.moveTo(squareX, squareY);
            ctx.lineTo(squareX + squareLength, squareY);
            ctx.moveTo(squareX, squareY);
            ctx.lineTo(squareX, squareY + squareLength);
            ctx.stroke();
          }
          ctx.fillStyle = grid[rows * row + col];
          ctx.fillRect(squareX, squareY, squareLength, squareLength);
        }
      }
    }
  }, [dimensions, scaleCanvas, grid, border]);

  return (
          <canvas
            ref={canvasRef}
            height={dimensions}
            width={dimensions}
            style={{
              minWidth: "700px",
              maxWidth: "vw",
              maxHeight: "vh",
              aspectRatio: "1 / 1",
            }}
            onClick={({ clientX, clientY, currentTarget }) => {
              setGrid((grid) => {
                const squareLength = currentTarget.width / dimensions;
                const row = Math.floor(
                  (clientY - currentTarget.getBoundingClientRect().y) /
                    squareLength
                );
                const col = Math.floor(
                  (clientX - currentTarget.getBoundingClientRect().x) /
                    squareLength
                );
                const idx = row * dimensions + col;
                grid[idx] = color;
                return [...grid];
              });
            }}
            onMouseMove={({ clientX, clientY, currentTarget }) => {
              if (mouseIsDown) {
                setGrid((grid) => {
                  const squareLength = currentTarget.width / dimensions;
                  const row = Math.floor(
                    (clientY - currentTarget.getBoundingClientRect().y) /
                      squareLength
                  );
                  const col = Math.floor(
                    (clientX - currentTarget.getBoundingClientRect().x) /
                      squareLength
                  );
                  const idx = row * dimensions + col;
                  grid[idx] = color;
                  return [...grid];
                });
              }
            }}
            onMouseOut={() => setMouseIsDown(false)}
          />
  );
}

export default Canvas;
