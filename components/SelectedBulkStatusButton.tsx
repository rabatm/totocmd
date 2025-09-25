'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateProduitStatus } from '@/hooks/useMutations';
import { useBulkDeleteProduits } from '@/hooks/useProduitMutations';
import { CommandeProduit } from '@/src/types';
import { jsPDF } from 'jspdf';
import { Loader2, Trash2, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import { useState } from 'react';
// import { toast } from 'sonner';

interface SelectedBulkStatusButtonProps {
  commandeId: string;
  selectedProducts: CommandeProduit[];
  onClearSelection: () => void;
}

export default function SelectedBulkStatusButton({
  commandeId,
  selectedProducts,
  onClearSelection,
}: SelectedBulkStatusButtonProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const updateProduitStatus = useUpdateProduitStatus();
  const bulkDeleteProduits = useBulkDeleteProduits();

  const handleBulkUpdate = async () => {
    if (!selectedStatus || selectedProducts.length === 0) return;

    setIsUpdating(true);
    try {
      const promises = selectedProducts.map(product =>
        updateProduitStatus.mutateAsync({
          id: product.id,
          statut: selectedStatus,
          commandeId,
        })
      );

      await Promise.all(promises);

      alert(`Statut mis à jour pour ${selectedProducts.length} produit(s) sélectionné(s)`);
      onClearSelection();
      setSelectedStatus('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour en lot:', error);
      alert('Erreur lors de la mise à jour des statuts');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    const confirmDelete = confirm(
      `Êtes-vous sûr de vouloir supprimer ${selectedProducts.length} produit(s) sélectionné(s) ?`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await bulkDeleteProduits.mutateAsync({
        ids: selectedProducts.map(p => p.id),
        commandeId,
      });

      alert(`${selectedProducts.length} produit(s) supprimé(s) avec succès`);
      onClearSelection();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression des produits');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkPrint = async () => {
    if (selectedProducts.length === 0) return;

    setIsPrinting(true);
    try {
      const LABEL_WIDTH_MM = 57;
      const LABEL_HEIGHT_MM = 27;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [LABEL_HEIGHT_MM, LABEL_WIDTH_MM],
      });

      let isFirstPage = true;
      let currentY = 4;
      const lineHeight = 2.5;
      const maxTextWidth = LABEL_WIDTH_MM - 6;
      const qrCodeSizeMM = 10;

      const startNewPage = () => {
        if (!isFirstPage) {
          pdf.addPage([LABEL_HEIGHT_MM, LABEL_WIDTH_MM], 'landscape');
        }
        currentY = 4;

        // QR Code seulement sur la première page (comme dans PrintLabel)
        if (isFirstPage) {
          // Utiliser un QR code générique pour les produits sélectionnés
          QRCode.toDataURL(`PRODUITS_SELECTIONNES_${Date.now()}`, {
            width: 64,
            margin: 1,
            errorCorrectionLevel: 'H',
          }).then(qrCodeDataURL => {
            pdf.addImage(
              qrCodeDataURL,
              'PNG',
              LABEL_WIDTH_MM - qrCodeSizeMM - 3,
              (LABEL_HEIGHT_MM - qrCodeSizeMM) / 2 - 3,
              qrCodeSizeMM,
              qrCodeSizeMM,
            );
          });
        }

        // Titre "PRODUITS SÉLECTIONNÉS" en haut de chaque page (comme CMD dans PrintLabel)
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.text(`SÉLECTION (${selectedProducts.length})`, 3, currentY);
        currentY += 3;

        isFirstPage = false;
      };

      startNewPage();

      // Liste des produits sélectionnés (utilise la même logique que generateProductsPDF)
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);

      selectedProducts.forEach((produit) => {
        const produitNom = produit.nom_produit || 'Produit inconnu';
        const sn = produit.numero_serie || 'SN non défini';

        // Calculer l'espace nécessaire (2 lignes par produit comme dans PrintLabel)
        const spaceNeeded = lineHeight * 2;

        // Si pas assez de place, nouvelle page
        if (currentY + spaceNeeded > LABEL_HEIGHT_MM - 2) {
          startNewPage();
        }

        // Nom du produit (ligne 1) - même style que PrintLabel
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'italic');
        const produitLines = pdf.splitTextToSize(
          produitNom,
          isFirstPage ? LABEL_WIDTH_MM - qrCodeSizeMM - 6 : maxTextWidth,
        );
        pdf.text(produitLines[0], 3, currentY); // Prendre seulement la première ligne si trop long
        currentY += lineHeight + 1;

        // SN (ligne 2) - même style que PrintLabel
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(sn, 3, currentY);
        currentY += lineHeight;
      });

      // Ouvrir le PDF pour impression (même logique que PrintLabel)
      pdf.autoPrint();
      const pdfUrl = pdf.output('bloburl');
      const printWindow = window.open(pdfUrl.toString(), '_blank');
      if (!printWindow) {
        alert("La fenêtre d'impression a été bloquée. Veuillez autoriser les pop-ups.");
      }
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsPrinting(false);
    }
  };

  if (selectedProducts.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="text-sm font-medium text-blue-900">
        {selectedProducts.length} produit(s) sélectionné(s)
      </span>

      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Changer le statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="scanne">Scanné</SelectItem>
          <SelectItem value="en_preparation">En préparation</SelectItem>
          <SelectItem value="pret_expedition">Prêt expédition</SelectItem>
          <SelectItem value="expedie">Expédié</SelectItem>
          <SelectItem value="livre">Livré</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={handleBulkUpdate}
        disabled={!selectedStatus || isUpdating}
        size="sm"
      >
        {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Appliquer
      </Button>

      <Button
        onClick={handleBulkDelete}
        disabled={isDeleting}
        size="sm"
        variant="destructive"
        className="flex items-center gap-1"
      >
        {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
        <Trash2 className="h-3 w-3" />
        Supprimer
      </Button>

      <Button
        onClick={handleBulkPrint}
        disabled={isPrinting}
        size="sm"
        variant="secondary"
        className="flex items-center gap-1"
      >
        {isPrinting && <Loader2 className="h-3 w-3 animate-spin" />}
        <Printer className="h-3 w-3" />
        Imprimer
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onClearSelection}
      >
        Annuler
      </Button>
    </div>
  );
}