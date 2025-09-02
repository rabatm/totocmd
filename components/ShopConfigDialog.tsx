'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useShopConfig } from '@/lib/shop-config';
import { Settings } from 'lucide-react';
import { useState } from 'react';

const ShopConfigDialog: React.FC = () => {
  const { shopName, setShopName } = useShopConfig();
  const [tempShopName, setTempShopName] = useState(shopName);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    setShopName(tempShopName.trim() || 'TOTO CMD');
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTempShopName(shopName);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Paramètres
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configuration du magasin</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shopName" className="text-right">
              Nom du magasin
            </Label>
            <Input
              id="shopName"
              value={tempShopName}
              onChange={e => setTempShopName(e.target.value)}
              className="col-span-3"
              placeholder="TOTO CMD"
              maxLength={20}
            />
          </div>
          <div className="text-sm text-gray-500">
            Ce nom apparaîtra sur les étiquettes d&apos;impression.
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShopConfigDialog;
