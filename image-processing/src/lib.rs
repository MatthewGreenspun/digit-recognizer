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
pub fn row_is_black(data: &web_sys::ImageData, row: u32) -> bool {
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
pub fn col_is_black(data: &web_sys::ImageData, col: u32) -> bool {
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

#[wasm_bindgen]
pub fn find_image_boundaries(data: &web_sys::ImageData, square: bool) -> js_sys::Array {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
    let width = data.width() as i32;
    let height = data.height() as i32;

    //top, bottom, left, and right boundaries of the digit
    let mut top: i32 = -1;
    let mut bottom: i32 = height - 1;
    let mut left: i32 = -1;
    let mut right: i32 = width - 1;

    let mut prev_row_is_black = row_is_black(&data, 0);
    let mut i = 0;
    while i < height {
        let curr_row_is_black = row_is_black(&data, i as u32);
        if !curr_row_is_black && top == -1 {
            top = i;
        } else if i != 0 && !prev_row_is_black && curr_row_is_black && top != -1 {
            bottom = i;
        }
        i += 1;
        prev_row_is_black = curr_row_is_black;
    }

    let mut prev_col_is_black = col_is_black(&data, 0);
    i = 0;
    while i < width {
        let curr_col_is_black = col_is_black(&data, i as u32);
        if !curr_col_is_black && left == -1 {
            left = i;
        } else if i != 0 && !prev_col_is_black && curr_col_is_black && left != -1 {
            right = i;
        }
        i += 1;
        prev_col_is_black = curr_col_is_black;
    }

    let js_arr = js_sys::Array::new_with_length(4);
    if top == -1 || left == -1 {
        //never found any white pixels so just return the entire canvas
        js_arr.set(0, JsValue::from(0));
        js_arr.set(1, JsValue::from(0));
        js_arr.set(2, JsValue::from(width));
        js_arr.set(3, JsValue::from(height));
    } else if square {
        let square_length = std::cmp::max(right - left, bottom - top);
        js_arr.set(0, JsValue::from(left));
        js_arr.set(1, JsValue::from(top));
        js_arr.set(2, JsValue::from(square_length));
        js_arr.set(3, JsValue::from(square_length));
    } else {
        js_arr.set(0, JsValue::from(left));
        js_arr.set(1, JsValue::from(top));
        js_arr.set(2, JsValue::from(right-left));
        js_arr.set(3, JsValue::from(bottom-top));
    }
    js_arr
}

#[wasm_bindgen]
pub fn center_image(cropped_img_data: &js_sys::Float32Array, width: u32, height: u32) -> js_sys::Float32Array {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
    let final_img_width = 28;
    let (x_avg, y_avg) = find_center_of_mass(cropped_img_data, width, height);
    let black_rows_above = 14 - y_avg;
    let black_cols_left = 14 - x_avg;
    let mut centered_image_data: [f32; 784] = [0.0; 784];

    let mut i = black_rows_above * final_img_width;
    let end = std::cmp::min(i + height * final_img_width, 784);

    while i < end {
        let x_cord = (i - black_rows_above * final_img_width) % final_img_width;
        let y_cord = (i - x_cord) / final_img_width;
        if black_cols_left <= x_cord && x_cord < black_cols_left + width {
            let corresponding_idx = (y_cord - black_rows_above) * width + x_cord - black_cols_left;
            centered_image_data[i as usize] = cropped_img_data.get_index(corresponding_idx);
        }
        i += 1;
    }

    js_sys::Float32Array::from(&centered_image_data[..])
}

fn find_center_of_mass(data: &js_sys::Float32Array, width: u32, height: u32) -> (u32, u32) {
    let mut x_cords_sum: f32 = 0.0;
    let mut y_cords_sum: f32 = 0.0;
    let mut num_white_pixels: f32 = 0.0;

    let mut i = 0;
    while i < width * height {
        let x_cord = i % width;
        let y_cord = (i - x_cord) / width;

        let val = data.get_index(i);
        x_cords_sum += x_cord as f32 * val;
        y_cords_sum += y_cord as f32 * val;

        if val != 0.0 {
            num_white_pixels += 1.0;
        }
        i += 1;
    }

    let x_avg = (x_cords_sum / num_white_pixels).floor() as u32;
    let y_avg = (y_cords_sum / num_white_pixels).floor() as u32;

    (x_avg, y_avg)
}