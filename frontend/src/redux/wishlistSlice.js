import { createSlice } from "@reduxjs/toolkit";

const normalizeProductId = (product) =>
  product?._id || product?.id || product?.product?._id || product?.product?.id;

const normalizeProductImage = (product) =>
  product?.image ||
  product?.images?.[0] ||
  product?.product?.image ||
  product?.product?.images?.[0] ||
  "";

const initialState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist(state, action) {
      const product = action.payload;
      const productId = normalizeProductId(product);
      if (!productId) return;

      const exists = state.items.find(
        (item) => normalizeProductId(item) === productId,
      );

      if (!exists) {
        state.items.push({
          ...product,
          _id: productId,
          id: productId,
          image: normalizeProductImage(product),
        });
      }
    },
    removeFromWishlist(state, action) {
      const id = action.payload;
      state.items = state.items.filter(
        (item) => normalizeProductId(item) !== id,
      );
    },
    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
