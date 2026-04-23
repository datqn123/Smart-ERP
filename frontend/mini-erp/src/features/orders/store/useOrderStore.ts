import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OrderItem } from '../types'

interface CartItem extends OrderItem {
  // additional transient fields if needed
}

interface OrderState {
  cart: CartItem[];
  customerId: number | null;
  customerName: string;
  discount: number;
  voucherCode: string | null;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setCustomer: (id: number | null, name: string) => void;
  setDiscount: (amount: number) => void;
  setVoucher: (code: string | null) => void;
  clearCart: () => void;
  
  // Selectors/Computed
  getTotal: () => number;
  getFinalTotal: () => number;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      cart: [],
      customerId: null,
      customerName: "Khách lẻ",
      discount: 0,

      addItem: (item) => set((state) => {
        const existing = state.cart.find(i => i.productId === item.productId);
        if (existing) {
          return {
            cart: state.cart.map(i => 
              i.productId === item.productId 
                ? { ...i, quantity: i.quantity + item.quantity, lineTotal: (i.quantity + item.quantity) * i.unitPrice } 
                : i
            )
          };
        }
        return { cart: [...state.cart, item] };
      }),

      removeItem: (productId) => set((state) => ({
        cart: state.cart.filter(i => i.productId !== productId)
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(i => 
          i.productId === productId 
            ? { ...i, quantity: Math.max(1, quantity), lineTotal: Math.max(1, quantity) * i.unitPrice } 
            : i
        )
      })),

      setCustomer: (id, name) => set({ customerId: id, customerName: name }),
      
      setDiscount: (amount) => set({ discount: amount }),

      setVoucher: (code) => set({ voucherCode: code }),

      clearCart: () => set({ cart: [], customerId: null, customerName: "Khách lẻ", discount: 0, voucherCode: null }),

      getTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.lineTotal, 0);
      },

      getFinalTotal: () => {
        const total = get().getTotal();
        const baseDiscount = get().discount;
        // Simple mock voucher logic: if code is "DISCOUNT10", apply 10% off
        const voucherDiscount = get().voucherCode === 'DISCOUNT10' ? total * 0.1 : 0;
        return total - baseDiscount - voucherDiscount;
      }
    }),
    {
      name: 'pos-cart-storage',
    }
  )
)
