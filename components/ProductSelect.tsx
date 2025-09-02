'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useProduits } from '@/hooks/useProduits';
import { cn } from '@/lib/utils';
import { Produit } from '@/src/types';
import { Check, ChevronsUpDown, Loader2, Package, Search } from 'lucide-react';
import React, { useState } from 'react';

interface ProductSelectProps {
  value?: number;
  onSelect: (produit: Produit | null) => void;
  placeholder?: string;
  disabled?: boolean;
  familleId?: number;
  showStock?: boolean;
  className?: string;
}

export const ProductSelect: React.FC<ProductSelectProps> = ({
  value,
  onSelect,
  placeholder = 'Sélectionner un produit...',
  disabled = false,
  familleId,
  showStock = true,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: produits = [], isLoading } = useProduits({
    search: search || undefined,
    familleId,
    limit: 50,
  });

  const selectedProduit = produits.find(p => p.id === value);

  const handleSelect = (produit: Produit) => {
    onSelect(produit);
    setOpen(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getStockStatus = (produit: Produit) => {
    if (!produit.tenue_stock) return null;

    if ((produit.stock_physique ?? 0) <= 0) {
      return { label: 'Rupture', color: 'bg-red-500' };
    }
    if ((produit.stock_physique ?? 0) <= (produit.stock_mini || 0)) {
      return { label: 'Stock faible', color: 'bg-orange-500' };
    }
    return {
      label: `Stock: ${produit.stock_physique ?? 0}`,
      color: 'bg-green-500',
    };
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !selectedProduit && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Package className="h-4 w-4 flex-shrink-0" />
            {selectedProduit ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate">
                  {selectedProduit.code} - {selectedProduit.libelle}
                </span>
                {showStock && selectedProduit.tenue_stock && (
                  <Badge variant="secondary" className="flex-shrink-0 text-xs">
                    {selectedProduit.stock_physique}
                  </Badge>
                )}
              </div>
            ) : (
              placeholder
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Rechercher un produit..."
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Chargement...
                </span>
              </div>
            ) : (
              <>
                <CommandEmpty>
                  <div className="text-center p-4">
                    <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Aucun produit trouvé
                    </p>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {produits.map(produit => {
                    const stockStatus = getStockStatus(produit);

                    return (
                      <CommandItem
                        key={produit.id}
                        value={`${produit.code} ${produit.libelle} ${
                          produit.description || ''
                        }`}
                        onSelect={() => handleSelect(produit)}
                        className="flex items-center justify-between p-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Check
                            className={cn(
                              'h-4 w-4 flex-shrink-0',
                              value === produit.id
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {produit.code}
                              </span>
                              <span className="text-sm truncate">
                                {produit.libelle}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatPrice(produit.prix)}</span>
                              {produit.famille_libelle && (
                                <>
                                  <span>•</span>
                                  <span>{produit.famille_libelle}</span>
                                </>
                              )}
                              {showStock && stockStatus && (
                                <>
                                  <span>•</span>
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      'text-white text-xs',
                                      stockStatus.color,
                                    )}
                                  >
                                    {stockStatus.label}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
