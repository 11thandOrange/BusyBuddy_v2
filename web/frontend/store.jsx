import { configureStore } from '@reduxjs/toolkit';
import productReducer from './features/product/productSlices';
import editorReducer from './features/editor/editorSlice';

export const store = configureStore({
  reducer: {
    product: productReducer,
    editor: editorReducer,
  },
});