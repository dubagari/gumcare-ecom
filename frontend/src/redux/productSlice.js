import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = '/api/products';

// Async thunk to fetch products from backend
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to create a product
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { getState, rejectWithValue }) => {
    try {
      const { auth: { user } } = getState();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(productData),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error?.message;
      })
      // Create Product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default productSlice.reducer;
