use napi_derive::napi;
use taffy::prelude::*;

#[napi(object)]
#[derive(Default, Clone)]
pub struct ComputedLayout {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub padding_top: f64,
    pub padding_right: f64,
    pub padding_bottom: f64,
    pub padding_left: f64,
    pub border_top: f64,
    pub border_right: f64,
    pub border_bottom: f64,
    pub border_left: f64,
}

impl ComputedLayout {
    pub fn from_taffy(layout: &Layout) -> Self {
        ComputedLayout {
            x: layout.location.x as f64,
            y: layout.location.y as f64,
            width: layout.size.width as f64,
            height: layout.size.height as f64,
            padding_top: layout.padding.top as f64,
            padding_right: layout.padding.right as f64,
            padding_bottom: layout.padding.bottom as f64,
            padding_left: layout.padding.left as f64,
            border_top: layout.border.top as f64,
            border_right: layout.border.right as f64,
            border_bottom: layout.border.bottom as f64,
            border_left: layout.border.left as f64,
        }
    }
}
