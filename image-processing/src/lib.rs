use wasm_bindgen::{ prelude::*};
use std::{iter::Iterator};
extern crate console_error_panic_hook;

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
/// Just a test function to make sure the wasm works
pub fn multiply(num1: i32, num2: i32) -> i32 {
    num1 * num2
}

#[wasm_bindgen]
pub fn gray_scale_image(data: web_sys::ImageData) -> js_sys::Float32Array {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));

    let pixel_data: Vec<u8> = data.data().0;
    let mut new_pixel_data: Vec<f32>  = Vec::new();
    new_pixel_data.resize((data.width()*data.height()) as usize, 0.0);

    for (idx,_) in pixel_data.iter().enumerate(){
        if idx % 4 == 0 {
            let gray_scale_val = f32::from((pixel_data[idx] as u16) + (pixel_data[idx+1] as u16) + (pixel_data[idx+2] as u16)) / 3.0;
            let scaled_val = gray_scale_val / 255.0;
            new_pixel_data[idx/4] = scaled_val;
        }
    }
    js_sys::Float32Array::from(new_pixel_data.as_slice())
}

#[wasm_bindgen]
pub fn row_is_black(data: web_sys::ImageData, row: u32) -> bool {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
    let width: u32 = data.width() * 4;
    let pixel_data: Vec<u8> = data.data().0;
    
    let mut i = row * width;
    let end = i + width;
    while i < end {
        if (pixel_data[i as usize] != 0) ||
           (pixel_data[(i+1) as usize] != 0) ||
           (pixel_data[(i+2) as usize] != 0) {
            return false
        }
        i += 4;
    }
    true
}

#[wasm_bindgen]
pub fn col_is_black(data: web_sys::ImageData, col: u32) -> bool {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
    let width: u32 = data.width() * 4;
    let height: u32 = data.height();
    let pixel_data: Vec<u8> = data.data().0;
    
    let mut i = col * 4;
    let end = (height-1)*width + i;
    while i < end {
        if (pixel_data[i as usize] != 0) ||
           (pixel_data[(i+1) as usize] != 0) ||
           (pixel_data[(i+2) as usize] != 0) {
            return false
        }
        i += width;
    }
    true
}
