import { useCallback, useEffect, useRef, memo } from "react";

interface Props {
  predict: (data: Float32Array) => any;
}

const Canvas: React.FC<Props> = ({ predict }) => {
  const dimensions = 16;
  const mouseDownRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  function rowIsBlack(data: ImageData, row: number) {
    const { width } = data;
    const grayScaleImageData = grayScaleImage(data);
    for (let i = row * width; i < row * width + width; i++) {
      if (grayScaleImageData[i] !== 0) return false;
    }
    return true;
  }

  function colIsBlack(data: ImageData, col: number) {
    const { width, height } = data;
    const grayScaleImageData = grayScaleImage(data);
    for (let i = col; i <= (height - 1) * width + col; i += width) {
      if (grayScaleImageData[i] !== 0) return false;
    }
    return true;
  }

  function findImageBoundaries(
    data: ImageData,
    preserveAspectRatio = true
  ): [x: number, y: number, width: number, height: number] {
    const { width, height } = data;
    //top, bottom, left, and right boundaries of the digit
    let top = -1;
    let bottom = height - 1;
    let left = -1;
    let right = width - 1;

    let i = 0;
    while (i <= height) {
      if (!rowIsBlack(data, i) && top === -1) top = i;
      else if (!rowIsBlack(data, i - 1) && rowIsBlack(data, i) && top !== -1)
        bottom = i;
      i++;
    }
    i = 0;
    while (i <= width) {
      if (!colIsBlack(data, i) && left === -1) left = i;
      else if (!colIsBlack(data, i - 1) && colIsBlack(data, i) && left !== -1)
        right = i;
      i++;
    }
    if (top === -1 || left === -1) return [0, 0, width, height]; //never found any white pixels so just return the entire canvas

    const squareLength = Math.max(right - left, bottom - top);
    if (preserveAspectRatio) return [left, top, squareLength, squareLength];
    else return [left, top, right - left, bottom - top];
  }
  function centerImage(data: ImageData) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;
    const { width } = data;
    const [imgX, imgY, imgWidth, imgHeight] = findImageBoundaries(data, false);
    const croppedImageData = grayScaleImage(
      ctx.getImageData(imgX, imgY, imgWidth, imgHeight)
    );
    //coordinates of the center of mass of the image
    let xAvg = 0;
    let yAvg = 0;
    let numWhitePixels = 0;
    for (let i = 0; i < imgWidth * imgHeight; i++) {
      const xCord = i % imgWidth;
      const yCord = (i - xCord) / imgWidth;
      xAvg += xCord * croppedImageData[i];
      yAvg += yCord * croppedImageData[i];
      if (croppedImageData[i] !== 0) numWhitePixels++;
    }
    xAvg = Math.floor(xAvg / numWhitePixels);
    yAvg = Math.floor(yAvg / numWhitePixels);

    const blackRowsOnTop = 14 - yAvg;
    const blackColsOnLeft = 14 - xAvg;
    const centeredImage = new Float32Array(28 * 28);
    for (
      let i = blackRowsOnTop * width;
      i < blackRowsOnTop * width + imgHeight * width;
      i++
    ) {
      const xCord = (i - blackRowsOnTop * width) % width;
      const yCord = (i - xCord) / width;
      if (xCord < blackColsOnLeft) continue;
      if (blackColsOnLeft <= xCord && xCord < blackColsOnLeft + imgWidth)
        centeredImage[i] =
          croppedImageData[
            (yCord - blackRowsOnTop) * imgWidth + xCord - blackColsOnLeft
          ];
    }

    return centeredImage;
  }

  function f32ArrToImageData(data: Float32Array) {
    const imageData = new Uint8ClampedArray(data.length * 4);
    for (let i = 0; i < data.length; i++) {
      //prettier-ignore
      imageData[4*i] = imageData[4*i+1] = imageData[4*i+2] = data[i] * 255;
      imageData[4 * i + 3] = 255;
    }
    return new ImageData(imageData, 28, 28);
  }

  function grayScaleImage(data: ImageData) {
    const { data: imageData, width, height } = data;
    const newPixelData = new Float32Array(width * height);
    for (let i = 0; i < imageData.length; i += 4) {
      const grayScaleVal =
        (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
      newPixelData[i / 4] = grayScaleVal / 255; //scale between 0 and 1
    }
    return newPixelData;
  }

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
          if (mouseDownRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (ctx && canvas) {
              ctx.lineCap = "round";
              ctx.strokeStyle = "white";
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
              ctx.strokeStyle = "white";
              ctx.lineWidth = 20;
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
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, 28, 28); //clear old image
            const imageBoundaries = findImageBoundaries(
              ctx.getImageData(0, 0, canvas.width, canvas.height)
            );
            const canvas2 = document.createElement("canvas");
            const ctx2 = canvas2.getContext("2d") as CanvasRenderingContext2D;
            canvas2.height = imageBoundaries[3];
            canvas2.width = imageBoundaries[2];
            ctx2.putImageData(ctx.getImageData(...imageBoundaries), 0, 0);
            ctx.drawImage(canvas2, 0, 0, 20, 20); //images can fit in a 20/20 box
            const imageData = ctx.getImageData(0, 0, 28, 28);
            const [imgX, imgY, imgWidth, imgHeight] = findImageBoundaries(
              imageData,
              false
            );
            ctx.putImageData(
              ctx.getImageData(imgX, imgY, imgWidth, imgHeight),
              0,
              0
            );
            const centeredImageData = centerImage(imageData);
            ctx.putImageData(f32ArrToImageData(centeredImageData), 0, 0);
            predict(centeredImageData);
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "yellow";
            ctx.fillRect(0, 0, 28, 28);
            ctx.globalAlpha = 1;
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
