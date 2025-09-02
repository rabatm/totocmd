import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShopConfigState {
  shopName: string;
  setShopName: (name: string) => void;
}

export const useShopConfig = create<ShopConfigState>()(
  persist(
    set => ({
      shopName: 'TOTO CMD',
      setShopName: (name: string) => set({ shopName: name }),
    }),
    {
      name: 'shop-config',
    },
  ),
);
