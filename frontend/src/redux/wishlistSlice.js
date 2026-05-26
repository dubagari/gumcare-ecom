import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/wishlist";

// ====================
// HELPERS
// ====================
const normalizeProduct = (item) => item?.productId || item;

const normalizeItems = (payload) => {
  if (!payload) return [];
  if (!Array.isArray(payload.items)) return [];

  return payload.items.map((i) => i.productId).filter(Boolean);
};

// ====================
// FETCH WISHLIST
// ====================
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, thunkAPI) => {
    try {
      const user = thunkAPI.getState().auth.user;

      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
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

      const res = await axios.post(
        API_URL,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        },
      );

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
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

      await axios.delete(`${API_URL}/${productId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      return productId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

// ====================
// INITIAL STATE
// ====================
const initialState = {
  items: [],
  loading: false,
  error: null,
};

// ====================
// SLICE
// ====================
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // LOCAL ADD
    addToWishlist(state, action) {
      const product = action.payload;

      // 🔒 GUARANTEE items is always an array
      if (!Array.isArray(state.items)) {
        state.items = [];
      }

      const id = product?._id || product?.id;
      if (!id) return;

      const exists = state.items.some((item) => (item?._id || item?.id) === id);

      if (!exists) {
        state.items.push({
          ...product,
          _id: id,
          id: id,
        });
      }
    },

    // LOCAL REMOVE
    removeFromWishlist(state, action) {
      const id = action.payload;

      state.items = state.items.filter(
        (item) => (item?._id || item?.id) !== id,
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
        state.items = normalizeItems(action.payload);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      })

      // ADD
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.items = normalizeItems(action.payload);
      })

      // REMOVE
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        const id = action.payload;

        state.items = state.items.filter(
          (item) => (item?._id || item?.id) !== id,
        );
      });
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
