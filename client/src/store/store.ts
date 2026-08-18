import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    adminAuth: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;