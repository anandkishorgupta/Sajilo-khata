import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
export type CartItem = {
    id: string;
    name: string;
    price: number;
    img?: string;
    qty: number;
};

type CartState = {
    items: CartItem[];
};

const initialState: CartState = {
    items: [],
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<Omit<CartItem, "qty">>) => {
            const existing = state.items.find(i => i.id === action.payload.id);

            if (existing) {
                existing.qty += 1;
            } else {
                state.items.push({ ...action.payload, qty: 1 });
            }
        },

        increaseQty: (state, action: PayloadAction<string>) => {
            const item = state.items.find(i => i.id === action.payload);
            if (item) item.qty += 1;
        },

        decreaseQty: (state, action: PayloadAction<string>) => {
            const item = state.items.find(i => i.id === action.payload);
            if (!item) return;

            item.qty -= 1;
            if (item.qty <= 0) {
                state.items = state.items.filter(i => i.id !== action.payload);
            }
        },

        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(i => i.id !== action.payload);
        },

        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const {
    addItem,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;