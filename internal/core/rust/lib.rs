use std::collections::HashMap;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use taffy::prelude::*;

mod style;
mod layout;
mod error;

use style::LayoutStyle;
use layout::ComputedLayout;
use error::map_error;

/// Text measurement context stored per node
#[derive(Default, Clone)]
pub struct TextContext {
    pub width: f32,
    pub height: f32,
}

#[napi]
pub struct LayoutTree {
    tree: TaffyTree<TextContext>,
    nodes: HashMap<u32, NodeId>,
    next_id: u32,
}

#[napi]
impl LayoutTree {
    #[napi(constructor)]
    pub fn new() -> Self {
        LayoutTree {
            tree: TaffyTree::new(),
            nodes: HashMap::new(),
            next_id: 0,
        }
    }

    fn get_taffy_id(&self, node: u32) -> Result<NodeId> {
        self.nodes.get(&node).copied().ok_or_else(|| {
            Error::from_reason(format!("Node {} not found", node))
        })
    }

    #[napi]
    pub fn create_node(&mut self, style: LayoutStyle) -> Result<u32> {
        let taffy_style = style.to_taffy();
        let node_id = self.tree.new_leaf(taffy_style).map_err(map_error)?;
        let id = self.next_id;
        self.next_id += 1;
        self.nodes.insert(id, node_id);
        Ok(id)
    }

    #[napi]
    pub fn insert_child(&mut self, parent: u32, child: u32, index: u32) -> Result<()> {
        let parent_id = self.get_taffy_id(parent)?;
        let child_id = self.get_taffy_id(child)?;
        self.tree.insert_child_at_index(parent_id, index as usize, child_id).map_err(map_error)
    }

    #[napi]
    pub fn remove_child(&mut self, parent: u32, child: u32) -> Result<()> {
        let parent_id = self.get_taffy_id(parent)?;
        let child_id = self.get_taffy_id(child)?;
        self.tree.remove_child(parent_id, child_id).map_err(map_error)?;
        Ok(())
    }

    #[napi]
    pub fn remove_node(&mut self, node: u32) -> Result<()> {
        let node_id = self.get_taffy_id(node)?;
        self.tree.remove(node_id).map_err(map_error)?;
        self.nodes.remove(&node);
        Ok(())
    }

    #[napi]
    pub fn set_style(&mut self, node: u32, style: LayoutStyle) -> Result<()> {
        let node_id = self.get_taffy_id(node)?;
        let taffy_style = style.to_taffy();
        self.tree.set_style(node_id, taffy_style).map_err(map_error)
    }

    #[napi]
    pub fn set_text_dimensions(&mut self, node: u32, width: f64, height: f64) -> Result<()> {
        let node_id = self.get_taffy_id(node)?;
        self.tree.set_node_context(node_id, Some(TextContext {
            width: width as f32,
            height: height as f32,
        })).map_err(map_error)?;
        self.tree.mark_dirty(node_id).map_err(map_error)
    }

    #[napi]
    pub fn mark_dirty(&mut self, node: u32) -> Result<()> {
        let node_id = self.get_taffy_id(node)?;
        self.tree.mark_dirty(node_id).map_err(map_error)
    }

    #[napi]
    pub fn set_display_none(&mut self, node: u32) -> Result<()> {
        let node_id = self.get_taffy_id(node)?;
        let mut style = self.tree.style(node_id).map_err(map_error)?.clone();
        style.display = Display::None;
        self.tree.set_style(node_id, style).map_err(map_error)
    }

    #[napi]
    pub fn set_display_flex(&mut self, node: u32) -> Result<()> {
        let node_id = self.get_taffy_id(node)?;
        let mut style = self.tree.style(node_id).map_err(map_error)?.clone();
        style.display = Display::Flex;
        self.tree.set_style(node_id, style).map_err(map_error)
    }

    #[napi]
    pub fn compute_layout(&mut self, root: u32, width: f64, height: Option<f64>) -> Result<()> {
        let root_id = self.get_taffy_id(root)?;
        let available_space = Size {
            width: AvailableSpace::Definite(width as f32),
            height: height.map_or(AvailableSpace::MaxContent, |h| AvailableSpace::Definite(h as f32)),
        };

        self.tree.compute_layout_with_measure(
            root_id,
            available_space,
            |_known, _available, _node_id, context, _style| {
                context.map_or(Size::ZERO, |ctx| Size {
                    width: ctx.width,
                    height: ctx.height,
                })
            },
        ).map_err(map_error)
    }

    #[napi]
    pub fn get_layout(&self, node: u32) -> Result<ComputedLayout> {
        let node_id = self.get_taffy_id(node)?;
        let layout = self.tree.layout(node_id).map_err(map_error)?;
        Ok(ComputedLayout::from_taffy(layout))
    }

    #[napi]
    pub fn get_child_count(&self, node: u32) -> Result<u32> {
        let node_id = self.get_taffy_id(node)?;
        Ok(self.tree.child_count(node_id) as u32)
    }
}
