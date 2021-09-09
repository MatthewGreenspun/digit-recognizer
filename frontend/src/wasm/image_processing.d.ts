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
