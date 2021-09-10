import imageProcesser from "./wasm/imageProcesser";

export function scaleCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio;
  const styleHeight = +getComputedStyle(canvas)
    .getPropertyValue("height")
    .slice(0, -2);
  const styleWidth = +getComputedStyle(canvas)
    .getPropertyValue("width")
    .slice(0, -2);
  canvas.setAttribute("height", `${styleHeight * dpr}`);
  canvas.setAttribute("width", `${styleWidth * dpr}`);
}

export async function rowIsBlack(data: ImageData, row: number) {
  if (imageProcesser.functions === undefined) await imageProcesser.loadWasm();
  const { width } = data;
  const grayScaleImageData = await imageProcesser.grayScaleImage(data);
  for (let i = row * width; i < row * width + width; i++) {
    if (grayScaleImageData[i] !== 0) return false;
  }
  return true;
}

export async function colIsBlack(data: ImageData, col: number) {
  if (imageProcesser.functions === undefined) await imageProcesser.loadWasm();
  const { width, height } = data;
  const grayScaleImageData = await imageProcesser.grayScaleImage(data);
  for (let i = col; i <= (height - 1) * width + col; i += width) {
    if (grayScaleImageData[i] !== 0) return false;
  }
  return true;
}
export async function findImageBoundaries(
  data: ImageData,
  square = true
): Promise<[x: number, y: number, width: number, height: number]> {
  if (imageProcesser.functions === undefined) await imageProcesser.loadWasm();
  return await imageProcesser.findImageBoundaries(data, square);
}
export async function findImageBoundariesJs(
  data: ImageData,
  preserveAspectRatio = true
): Promise<[x: number, y: number, width: number, height: number]> {
  await imageProcesser.loadWasm();
  const { width, height } = data;
  //top, bottom, left, and right boundaries of the digit
  let top = -1;
  let bottom = height - 1;
  let left = -1;
  let right = width - 1;

  let i = 0;
  while (i < height) {
    if (!(await imageProcesser.rowIsBlack(data, i)) && top === -1) top = i;
    else if (
      i !== 0 &&
      !(await imageProcesser.rowIsBlack(data, i - 1)) &&
      (await imageProcesser.rowIsBlack(data, i)) &&
      top !== -1
    )
      bottom = i;
    i++;
  }
  i = 0;
  while (i < width) {
    if (!(await imageProcesser.colIsBlack(data, i)) && left === -1) left = i;
    else if (
      i !== 0 &&
      !(await imageProcesser.colIsBlack(data, i - 1)) &&
      (await imageProcesser.colIsBlack(data, i)) &&
      left !== -1
    )
      right = i;
    i++;
  }
  if (top === -1 || left === -1) return [0, 0, width, height]; //never found any white pixels so just return the entire canvas

  const squareLength = Math.max(right - left, bottom - top);
  if (preserveAspectRatio) return [left, top, squareLength, squareLength];
  else return [left, top, right - left, bottom - top];
}

export async function centerImage(
  croppedImageData: Float32Array,
  width: number,
  height: number
) {
  if (imageProcesser.functions === undefined) await imageProcesser.loadWasm();
  return await imageProcesser.centerImage(croppedImageData, width, height);
}

export function centerImageJs(
  croppedImageData: Float32Array,
  boundaries: [number, number, number, number]
) {
  const width = 28;
  const [, , imgWidth, imgHeight] = boundaries;
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

export function f32ArrToImageData(data: Float32Array) {
  const imageData = new Uint8ClampedArray(data.length * 4);
  for (let i = 0; i < data.length; i++) {
    //prettier-ignore
    imageData[4*i] = imageData[4*i+1] = imageData[4*i+2] = data[i] * 255;
    imageData[4 * i + 3] = 255;
  }
  return new ImageData(imageData, 28, 28);
}

export async function grayScaleImage(data: ImageData) {
  if (imageProcesser.functions === undefined) await imageProcesser.loadWasm();
  return await imageProcesser.grayScaleImage(data);
}

export function grayScaleImageJs(data: ImageData) {
  const { data: imageData, width, height } = data;
  const newPixelData = new Float32Array(width * height);
  for (let i = 0; i < imageData.length; i += 4) {
    const grayScaleVal =
      (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
    newPixelData[i / 4] = grayScaleVal / 255; //scale between 0 and 1
  }
  return newPixelData;
}

export async function drawImageBoundaries(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const imageBoundaries = await findImageBoundaries(
      ctx.getImageData(0, 0, canvas.width, canvas.height),
      false
    );
    console.log(imageBoundaries);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "yellow";
    ctx.fillRect(...imageBoundaries);
  }
}

export async function testGrayScaleImage() {
  const pixelData = Uint8ClampedArray.from([
    1, 2, 3, 255, 100, 101, 102, 255, 0, 100, 200, 255, 1, 2, 3, 0,
  ]);
  const imageData = new ImageData(pixelData, 2, 2);
  const wasmGrayScaleData = await imageProcesser.grayScaleImage(imageData);
  const jsGrayScaleData = grayScaleImage(imageData);
  console.log("wasm gray scale data:", wasmGrayScaleData);
  console.log("js gray scale data:", jsGrayScaleData);
}
