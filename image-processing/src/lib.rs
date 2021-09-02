use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn multiply(num1: i32, num2: i32) -> i32 {
    num1 * num2
}