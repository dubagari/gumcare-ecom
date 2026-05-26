import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/wishlist";

const normalizeProductId = (product) =>
  product?._id || product?.id || product?.product?._id || product?.product?.id;

const normalizeProductImage = (product) =>
  product?.image ||
  product?.images?.[0] ||
  product?.product?.image ||
  product?.product?.images?.[0] ||
  "";

// ====================
// FETCH WISHLIST
// ====================
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, thunkAPI) => {
    try {
      const user = thunkAPI.getState().auth.user;

      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const response = await axios.get(API_URL, config);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

// ====================
// ADD TO WISHLIST
// ====================
export const addToWishlistAsync = createAsyncThunk(
  "wishlist/addToWishlistAsync",
  async (productId, thunkAPI) => {
    try {
      const user = thunkAPI.getState().auth.user;

      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(API_URL, { productId }, config);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

// ====================
// REMOVE FROM WISHLIST
// ====================
export const removeFromWishlistAsync = createAsyncThunk(
  "wishlist/removeFromWishlistAsync",
  async (productId, thunkAPI) => {
    try {
      const user = thunkAPI.getState().auth.user;

      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      await axios.delete(`${API_URL}/${productId}`, config);

      return productId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Guest/local wishlist
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

  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        const exists = state.items.find(
          (item) =>
            normalizeProductId(item) === normalizeProductId(action.payload),
        );

        if (!exists) {
          state.items.push(action.payload);
        }
      })

      // REMOVE
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => normalizeProductId(item) !== action.payload,
        );
      });
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
