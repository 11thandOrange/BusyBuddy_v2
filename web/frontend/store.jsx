import { configureStore } from '@reduxjs/toolkit';
import productReducer from './features/product/productSlices';

export const store = configureStore({
  reducer: {
    product: productReducer,
  },
});