use napi::bindgen_prelude::*;
use taffy::TaffyError;

pub fn map_error(err: TaffyError) -> Error {
    Error::from_reason(format!("Taffy error: {:?}", err))
}
