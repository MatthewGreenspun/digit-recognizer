/**
 * @param {number} num1
 * @param {number} num2
 * @returns {Promise<number>}
 */
export async function multiply(num1, num2) {
  const wasm = await import("./image_processing_bg.wasm");
  var ret = wasm.multiply(num1, num2);
  return ret;
}
