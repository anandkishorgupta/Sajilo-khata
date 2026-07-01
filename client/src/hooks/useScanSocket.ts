// src/hooks/useScanSocket.ts
import { addItem } from '@/store/slices/cartSlice';
import type { RootState } from "@/store/store";
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';


export function useScanSocket(sessionCode: string | null) {
    const socketRef = useRef<Socket | null>(null); // is used to store the Socket.IO connection object so that it persists across re-renders without causing the component to re-render.
    const dispatch = useDispatch();
    const cartItems = useSelector((s: RootState) => s.cart.items);
    const cartItemsRef = useRef(cartItems);

    // Keep a ref in sync so the socket callback always sees fresh cart state
    useEffect(() => {
        cartItemsRef.current = cartItems;
    }, [cartItems]);

    useEffect(() => {
        if (!sessionCode) return;

        const socket = io(`${import.meta.env.VITE_API_URL}/scan`, {
            transports: ['websocket'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('scan:register-laptop', { sessionCode });
        });

        socket.on('scan:registered', () => {
            toast.success('Scanner ready', { icon: '📱' });
        });

        socket.on('cart:product-found', ({ product, phoneSocketId }) => {
            const productId = String(product.id);


            // Don't allow duplicate scans
            const existing = cartItemsRef.current.find(i => i.id === productId);

            if (existing) {
                socket.emit("scan:duplicate", {
                    phoneSocketId,
                    product,
                });

                return;
            }

            // New item - add to cart
            dispatch(addItem({
                id: productId,
                name: product.name,
                price: product.sellingPrice,
            }));

            // Calculate after dispatch
            const cartTotal = cartItemsRef.current.reduce(
                (sum, i) => sum + i.price * i.qty, 0
            ) + product.sellingPrice;

            socket.emit('scan:accepted', {
                phoneSocketId,
                product,
                quantity: 1,
                cartTotal,
                itemCount: cartItemsRef.current.length + 1,
            });
        });

        socket.on('disconnect', () => {
            toast.error('Scanner disconnected');
        });

        return () => {
            socket.disconnect();
        };
    }, [sessionCode, dispatch]);

    return socketRef;
}