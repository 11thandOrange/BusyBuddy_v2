import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProduct: (state) => {
      state.products.push(action.payload);
    },
    removeProduct: (state) => {
      state.products = state.products.filter(
        (product) => product.id !== action.payload 
      );
    },
  },
});

export const { addProduct, removeProduct } = productSlice.actions;

export default productSlice.reducer;