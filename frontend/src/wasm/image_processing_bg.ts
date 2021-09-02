interface ImageProcesserFunctions {
  multiply: (num1: number, num2: number) => number;
}

interface ImageProcesser {
  functions: ImageProcesserFunctions | undefined;
  loadWasm: () => Promise<ImageProcesserFunctions>;
  multiply: (num1: number, num2: number) => Promise<number>;
}

const imageProcesser: ImageProcesser = {
  functions: undefined,
  loadWasm() {
    return import("./image_processing_bg.wasm").then(
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
};

export default imageProcesser;
