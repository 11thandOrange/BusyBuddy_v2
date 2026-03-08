import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  viewportMode: "desktop", // 'desktop' | 'mobile'
  selectedElementId: null,
  elements: [],
  unsavedChanges: false,
  lastSavedState: null,
  widgetType: null, // 'announcement-bar' | 'bundle' | etc.
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setViewportMode: (state, action) => {
      state.viewportMode = action.payload;
    },
    
    selectElement: (state, action) => {
      state.selectedElementId = action.payload;
    },
    
    deselectElement: (state) => {
      state.selectedElementId = null;
    },
    
    setElements: (state, action) => {
      state.elements = action.payload;
      state.lastSavedState = JSON.parse(JSON.stringify(action.payload));
    },
    
    updateElementConfig: (state, action) => {
      const { elementId, config } = action.payload;
      const elementIndex = state.elements.findIndex(el => el.id === elementId);
      if (elementIndex !== -1) {
        state.elements[elementIndex].config = {
          ...state.elements[elementIndex].config,
          ...config
        };
        state.unsavedChanges = true;
      }
    },
    
    reorderElements: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [removed] = state.elements.splice(sourceIndex, 1);
      state.elements.splice(destinationIndex, 0, removed);
      // Update order property
      state.elements.forEach((el, idx) => {
        el.order = idx;
      });
      state.unsavedChanges = true;
    },
    
    addElement: (state, action) => {
      const newElement = {
        id: `element-${Date.now()}`,
        type: action.payload.type,
        order: state.elements.length,
        config: action.payload.config || getDefaultConfig(action.payload.type),
      };
      state.elements.push(newElement);
      state.unsavedChanges = true;
    },
    
    removeElement: (state, action) => {
      state.elements = state.elements.filter(el => el.id !== action.payload);
      // Re-index order
      state.elements.forEach((el, idx) => {
        el.order = idx;
      });
      if (state.selectedElementId === action.payload) {
        state.selectedElementId = null;
      }
      state.unsavedChanges = true;
    },
    
    saveChanges: (state) => {
      state.lastSavedState = JSON.parse(JSON.stringify(state.elements));
      state.unsavedChanges = false;
    },
    
    discardChanges: (state) => {
      if (state.lastSavedState) {
        state.elements = JSON.parse(JSON.stringify(state.lastSavedState));
      }
      state.unsavedChanges = false;
      state.selectedElementId = null;
    },
    
    setWidgetType: (state, action) => {
      state.widgetType = action.payload;
    },
    
    resetEditor: (state) => {
      return initialState;
    },
  },
});

// Helper function to get default config based on element type
function getDefaultConfig(type) {
  const defaults = {
    text: {
      text: "Your message here",
      fontSize: "16px",
      fontFamily: "Inter",
      fontWeight: "500",
      fontColor: "#ffffff",
      backgroundColor: "transparent",
      letterSpacing: "0px",
      lineHeight: "1.2",
      textAlign: "center",
      padding: "8px",
    },
    countdown: {
      theme: "Classic",
      endDate: null,
      showLabels: true,
      digitColor: "#ffffff",
      labelColor: "#ffffff",
      backgroundColor: "transparent",
      fontSize: "18px",
    },
    button: {
      text: "Shop Now",
      backgroundColor: "#000000",
      textColor: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",
      borderRadius: "8px",
      padding: "10px 20px",
      borderColor: "transparent",
    },
    image: {
      src: "",
      alt: "",
      width: "100px",
      height: "auto",
    },
    emoji: {
      emoji: "🔔",
      size: "24px",
    },
  };
  
  return defaults[type] || {};
}

export const {
  setViewportMode,
  selectElement,
  deselectElement,
  setElements,
  updateElementConfig,
  reorderElements,
  addElement,
  removeElement,
  saveChanges,
  discardChanges,
  setWidgetType,
  resetEditor,
} = editorSlice.actions;

// Selectors
export const selectViewportMode = (state) => state.editor.viewportMode;
export const selectSelectedElementId = (state) => state.editor.selectedElementId;
export const selectElements = (state) => state.editor.elements;
export const selectUnsavedChanges = (state) => state.editor.unsavedChanges;
export const selectSelectedElement = (state) => {
  const { elements, selectedElementId } = state.editor;
  return elements.find(el => el.id === selectedElementId) || null;
};

export default editorSlice.reducer;
