'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddProduitDialogSimpleProps {
  commandeId: string;
}

function AddProduitDialogSimple({ commandeId }: AddProduitDialogSimpleProps) {
  return (
    <Button size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Ajouter un produit
    </Button>
  );
}

export default AddProduitDialogSimple;
