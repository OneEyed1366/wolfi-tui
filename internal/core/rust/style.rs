use napi_derive::napi;
use taffy::prelude::*;
use taffy::Overflow;
use taffy::Point;

#[napi(object)]
#[derive(Default, Clone)]
pub struct Dimension {
    pub value: f64,
    pub unit: String,  // "px" | "%" | "auto"
}

#[napi(object)]
#[derive(Default, Clone)]
pub struct Edges {
    pub top: Option<f64>,
    pub right: Option<f64>,
    pub bottom: Option<f64>,
    pub left: Option<f64>,
}

#[napi(object)]
#[derive(Default, Clone)]
pub struct LayoutStyle {
    pub position: Option<String>,           // "absolute" | "relative"
    pub display: Option<String>,            // "flex" | "none" | "grid"
    pub overflow: Option<String>,           // "visible" | "hidden" | "scroll"

    pub width: Option<Dimension>,
    pub height: Option<Dimension>,
    pub min_width: Option<Dimension>,
    pub min_height: Option<Dimension>,
    pub max_width: Option<Dimension>,
    pub max_height: Option<Dimension>,

    pub flex_direction: Option<String>,
    pub flex_wrap: Option<String>,
    pub flex_grow: Option<f64>,
    pub flex_shrink: Option<f64>,
    pub flex_basis: Option<Dimension>,

    pub align_items: Option<String>,
    pub align_self: Option<String>,
    pub align_content: Option<String>,
    pub justify_content: Option<String>,

    pub margin: Option<Edges>,
    pub padding: Option<Edges>,
    pub border: Option<Edges>,

    pub gap: Option<f64>,
    pub column_gap: Option<f64>,
    pub row_gap: Option<f64>,
}

impl LayoutStyle {
    pub fn to_taffy(&self) -> Style {
        let mut style = Style::default();

        // Position
        if let Some(ref pos) = self.position {
            style.position = match pos.as_str() {
                "absolute" => Position::Absolute,
                _ => Position::Relative,
            };
        }

        // Display
        if let Some(ref disp) = self.display {
            style.display = match disp.as_str() {
                "none" => Display::None,
                "grid" => Display::Grid,
                _ => Display::Flex,
            };
        }

        // Overflow
        if let Some(ref ovf) = self.overflow {
            let overflow_val = match ovf.as_str() {
                "hidden" => Overflow::Hidden,
                "scroll" => Overflow::Scroll,
                _ => Overflow::Visible,
            };
            style.overflow = Point { x: overflow_val, y: overflow_val };
        }

        // Dimensions
        if let Some(ref dim) = self.width {
            style.size.width = to_taffy_dimension(dim);
        }
        if let Some(ref dim) = self.height {
            style.size.height = to_taffy_dimension(dim);
        }
        if let Some(ref dim) = self.min_width {
            style.min_size.width = to_taffy_dimension(dim);
        }
        if let Some(ref dim) = self.min_height {
            style.min_size.height = to_taffy_dimension(dim);
        }
        if let Some(ref dim) = self.max_width {
            style.max_size.width = to_taffy_dimension(dim);
        }
        if let Some(ref dim) = self.max_height {
            style.max_size.height = to_taffy_dimension(dim);
        }

        // Flex direction
        if let Some(ref dir) = self.flex_direction {
            style.flex_direction = match dir.as_str() {
                "row" => FlexDirection::Row,
                "row-reverse" => FlexDirection::RowReverse,
                "column-reverse" => FlexDirection::ColumnReverse,
                _ => FlexDirection::Column,
            };
        }

        // Flex wrap
        if let Some(ref wrap) = self.flex_wrap {
            style.flex_wrap = match wrap.as_str() {
                "wrap" => FlexWrap::Wrap,
                "wrap-reverse" => FlexWrap::WrapReverse,
                _ => FlexWrap::NoWrap,
            };
        }

        // Flex grow/shrink/basis
        if let Some(grow) = self.flex_grow {
            style.flex_grow = grow as f32;
        }
        if let Some(shrink) = self.flex_shrink {
            style.flex_shrink = shrink as f32;
        }
        if let Some(ref basis) = self.flex_basis {
            style.flex_basis = to_taffy_dimension(basis);
        }

        // Alignment
        if let Some(ref align) = self.align_items {
            style.align_items = Some(to_align_items(align));
        }
        if let Some(ref align) = self.align_self {
            style.align_self = Some(to_align_items(align));
        }
        if let Some(ref align) = self.align_content {
            style.align_content = Some(to_align_content(align));
        }
        if let Some(ref justify) = self.justify_content {
            style.justify_content = Some(to_justify_content(justify));
        }

        // Margin
        if let Some(ref edges) = self.margin {
            style.margin = to_taffy_rect(edges);
        }

        // Padding
        if let Some(ref edges) = self.padding {
            style.padding = to_taffy_rect_lp(edges);
        }

        // Border
        if let Some(ref edges) = self.border {
            style.border = to_taffy_rect_lp(edges);
        }

        // Gap
        if let Some(gap) = self.gap {
            style.gap = Size {
                width: LengthPercentage::Length(gap as f32),
                height: LengthPercentage::Length(gap as f32),
            };
        }
        if let Some(col_gap) = self.column_gap {
            style.gap.width = LengthPercentage::Length(col_gap as f32);
        }
        if let Some(row_gap) = self.row_gap {
            style.gap.height = LengthPercentage::Length(row_gap as f32);
        }

        style
    }
}

fn to_taffy_dimension(dim: &Dimension) -> taffy::Dimension {
    match dim.unit.as_str() {
        "%" => taffy::Dimension::Percent(dim.value as f32 / 100.0),
        "auto" => taffy::Dimension::Auto,
        _ => taffy::Dimension::Length(dim.value as f32), // "px" or default
    }
}

fn to_taffy_rect(edges: &Edges) -> Rect<LengthPercentageAuto> {
    Rect {
        top: edges.top.map_or(LengthPercentageAuto::Length(0.0), |v| LengthPercentageAuto::Length(v as f32)),
        right: edges.right.map_or(LengthPercentageAuto::Length(0.0), |v| LengthPercentageAuto::Length(v as f32)),
        bottom: edges.bottom.map_or(LengthPercentageAuto::Length(0.0), |v| LengthPercentageAuto::Length(v as f32)),
        left: edges.left.map_or(LengthPercentageAuto::Length(0.0), |v| LengthPercentageAuto::Length(v as f32)),
    }
}

/// For padding and border which use LengthPercentage (no Auto variant)
fn to_taffy_rect_lp(edges: &Edges) -> Rect<LengthPercentage> {
    Rect {
        top: edges.top.map_or(LengthPercentage::Length(0.0), |v| LengthPercentage::Length(v as f32)),
        right: edges.right.map_or(LengthPercentage::Length(0.0), |v| LengthPercentage::Length(v as f32)),
        bottom: edges.bottom.map_or(LengthPercentage::Length(0.0), |v| LengthPercentage::Length(v as f32)),
        left: edges.left.map_or(LengthPercentage::Length(0.0), |v| LengthPercentage::Length(v as f32)),
    }
}

fn to_align_items(align: &str) -> AlignItems {
    match align {
        "flex-start" | "start" => AlignItems::FlexStart,
        "flex-end" | "end" => AlignItems::FlexEnd,
        "center" => AlignItems::Center,
        "baseline" => AlignItems::Baseline,
        "stretch" => AlignItems::Stretch,
        _ => AlignItems::Stretch,
    }
}

fn to_align_content(align: &str) -> AlignContent {
    match align {
        "flex-start" | "start" => AlignContent::FlexStart,
        "flex-end" | "end" => AlignContent::FlexEnd,
        "center" => AlignContent::Center,
        "space-between" => AlignContent::SpaceBetween,
        "space-around" => AlignContent::SpaceAround,
        "space-evenly" => AlignContent::SpaceEvenly,
        "stretch" => AlignContent::Stretch,
        _ => AlignContent::Stretch,
    }
}

fn to_justify_content(justify: &str) -> JustifyContent {
    match justify {
        "flex-start" | "start" => JustifyContent::FlexStart,
        "flex-end" | "end" => JustifyContent::FlexEnd,
        "center" => JustifyContent::Center,
        "space-between" => JustifyContent::SpaceBetween,
        "space-around" => JustifyContent::SpaceAround,
        "space-evenly" => JustifyContent::SpaceEvenly,
        _ => JustifyContent::FlexStart,
    }
}
