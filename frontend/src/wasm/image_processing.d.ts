/* tslint:disable */
/* eslint-disable */
/**
* Just a test function to make sure the wasm works
* @param {number} num1
* @param {number} num2
* @returns {number}
*/
export function multiply(num1: number, num2: number): number;
/**
* ## Process Image
* Performs the entire image transformation in one function. 
*
* Takes in the image data from the entire canvas and returns the
* centered image as a Float32Array
* @param {ImageData} data
* @returns {Float32Array}
*/
export function process_image(data: ImageData): Float32Array;
/**
* @param {ImageData} data
* @returns {Float32Array}
*/
export function gray_scale_image(data: ImageData): Float32Array;
/**
* @param {ImageData} data
* @param {number} row
* @returns {boolean}
*/
export function row_is_black(data: ImageData, row: number): boolean;
/**
* @param {ImageData} data
* @param {number} col
* @returns {boolean}
*/
export function col_is_black(data: ImageData, col: number): boolean;
/**
* @param {ImageData} data
* @param {boolean} square
* @returns {[number, number, number, number]}
*/
export function find_image_boundaries(data: ImageData, square: boolean): [number, number, number, number];
/**
* @param {Float32Array} cropped_img_data
* @param {number} width
* @param {number} height
* @returns {Float32Array}
*/
export function center_image(cropped_img_data: Float32Array, width: number, height: number): Float32Array;
