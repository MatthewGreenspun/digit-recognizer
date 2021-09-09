interface ImageProcesserFunctions {
  multiply: (num1: number, num2: number) => number;
  gray_scale_image: (data: ImageData) => Float32Array;
  row_is_black: (data: ImageData, row: number) => boolean;
  col_is_black: (data: ImageData, col: number) => boolean;
  find_image_boundaries(
    data: ImageData,
    square: boolean
  ): [number, number, number, number];
  center_image(
    cropped_img_data: Float32Array,
    width: number,
    height: number
  ): Float32Array;
}

interface ImageProcesser {
  functions: ImageProcesserFunctions | undefined;
  loadWasm: () => Promise<ImageProcesserFunctions>;
  multiply: (num1: number, num2: number) => Promise<number>;
  grayScaleImage: (data: ImageData) => Promise<Float32Array>;
  rowIsBlack: (data: ImageData, row: number) => Promise<boolean>;
  colIsBlack: (data: ImageData, col: number) => Promise<boolean>;
  findImageBoundaries: (
    data: ImageData,
    square: boolean
  ) => Promise<[number, number, number, number]>;
  centerImage(
    croppedImageData: Float32Array,
    width: number,
    height: number
  ): Promise<Float32Array>;
}

const imageProcesser: ImageProcesser = {
  functions: undefined,
  loadWasm() {
    return import("./image_processing").then(
      (functions: ImageProcesserFunctions) => {
        this.functions = functions;
        return functions;
      }
    );
  },

  async multiply(num1: number, num2: number) {
    if (this.functions !== undefined)
      return Promise.resolve(this.functions.multiply(num1, num2));
    else {
      const functions = await this.loadWasm();
      return functions.multiply(num1, num2);
    }
  },

  async grayScaleImage(data: ImageData) {
    if (this.functions !== undefined)
      return Promise.resolve(this.functions.gray_scale_image(data));
    else {
      const functions = await this.loadWasm();
      return functions.gray_scale_image(data);
    }
  },

  async rowIsBlack(data: ImageData, row: number) {
    if (this.functions !== undefined)
      return Promise.resolve(this.functions.row_is_black(data, row));
    else {
      const functions = await this.loadWasm();
      return functions.row_is_black(data, row);
    }
  },

  async colIsBlack(data: ImageData, col: number) {
    if (this.functions !== undefined)
      return Promise.resolve(this.functions.col_is_black(data, col));
    else {
      const functions = await this.loadWasm();
      return functions.col_is_black(data, col);
    }
  },

  async findImageBoundaries(data: ImageData, square: boolean) {
    if (this.functions !== undefined)
      return Promise.resolve(
        this.functions.find_image_boundaries(data, square)
      );
    else {
      const functions = await this.loadWasm();
      return functions.find_image_boundaries(data, square);
    }
  },

  async centerImage(
    croppedImageData: Float32Array,
    width: number,
    height: number
  ) {
    if (this.functions !== undefined)
      return Promise.resolve(
        this.functions.center_image(croppedImageData, width, height)
      );
    else {
      const functions = await this.loadWasm();
      return functions.center_image(croppedImageData, width, height);
    }
  },
};

export default imageProcesser;
