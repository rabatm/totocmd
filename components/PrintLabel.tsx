'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CommandeProduit, CommandeWithDetails } from '@/src/types';
import { jsPDF } from 'jspdf';
import { Printer, Zap } from 'lucide-react';
import QRCode from 'qrcode';

interface PrintLabelProps {
  commande: CommandeWithDetails;
}

const PrintLabel: React.FC<PrintLabelProps> = ({ commande }) => {
  const LABEL_WIDTH_MM = 57;
  const LABEL_HEIGHT_MM = 27;
  function forceSplitLines(lines: string[], maxLen: number): string[] {
    const result: string[] = [];
    lines.forEach(line => {
      while (line.length > maxLen) {
        result.push(line.slice(0, maxLen));
        line = line.slice(maxLen);
      }
      result.push(line);
    });
    return result;
  }
  const generateProductsPDF = async () => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [LABEL_HEIGHT_MM, LABEL_WIDTH_MM],
    });

    // Récupérer les produits de la commande
    const produits = commande.commande_produits || [];

    if (produits.length === 0) {
      alert('Aucun produit trouvé dans cette commande.');
      return;
    }

    let isFirstPage = true;
    let currentY = 4;
    const lineHeight = 2.5;
    const maxTextWidth = LABEL_WIDTH_MM - 6; // Plus de place sans QR code sur les autres pages
    const qrCodeSizeMM = 10;

    const startNewPage = () => {
      if (!isFirstPage) {
        pdf.addPage([LABEL_HEIGHT_MM, LABEL_WIDTH_MM], 'landscape');
      }
      currentY = 4;

      // QR Code seulement sur la première page
      if (isFirstPage) {
        QRCode.toDataURL(commande.numero_commande, {
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

      // Titre "CMD" en haut de chaque page
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text(`CMD ${commande.numero_commande}`, 3, currentY);
      currentY += 3;

      isFirstPage = false;
    };

    startNewPage();

    // Liste des produits
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);

    produits.forEach((ligne: CommandeProduit) => {
      console.log(ligne);
      const produitNom = ligne.nom_produit || 'Produit inconnu';
      const sn = ligne.numero_serie || 'SN non défini';

      // Calculer l'espace nécessaire (2 lignes par produit)
      const spaceNeeded = lineHeight * 2;

      // Si pas assez de place, nouvelle page
      if (currentY + spaceNeeded > LABEL_HEIGHT_MM - 2) {
        startNewPage();
      }

      // Nom du produit (ligne 1)
      pdf.setFontSize(5);
      pdf.setFont('helvetica', 'italic');
      const produitLines = pdf.splitTextToSize(
        produitNom,
        isFirstPage ? LABEL_WIDTH_MM - qrCodeSizeMM - 6 : maxTextWidth,
      );
      pdf.text(produitLines[0], 3, currentY); // Prendre seulement la première ligne si trop long
      currentY += lineHeight + 1;

      // SN (ligne 2)
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(sn, 3, currentY);
      currentY += lineHeight;
    });

    // Ouvrir le PDF pour impression
    pdf.autoPrint();
    const pdfUrl = pdf.output('bloburl');
    const printWindow = window.open(pdfUrl.toString(), '_blank');
    if (!printWindow) {
      alert(
        "La fenêtre d'impression a été bloquée. Veuillez autoriser les pop-ups.",
      );
    }
  };

  const generatePDF = async (action: 'print' | 'preview') => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [LABEL_HEIGHT_MM, LABEL_WIDTH_MM],
    });
    const clientName = commande.clients?.name || 'Client inconnu';
    // --- QR Code ---
    const qrCodeSizeMM = 10;
    const qrCodeDataURL = await QRCode.toDataURL(commande.numero_commande, {
      width: 64, // pixels
      margin: 0,
      errorCorrectionLevel: 'H',
    });

    pdf.addImage(
      qrCodeDataURL,
      'PNG',
      LABEL_WIDTH_MM - qrCodeSizeMM , // x position
      (LABEL_HEIGHT_MM - qrCodeSizeMM) - 5, // y position
      qrCodeSizeMM, // width
      qrCodeSizeMM, // height
    );

    // --- Text ---
    pdf.setTextColor(0, 0, 0);

    // Client name (en haut, en gras) - gestion multi-lignes
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);

    // Largeur maximale disponible pour le texte (en laissant de la place pour le QR code)
    const maxTextWidth = LABEL_WIDTH_MM - qrCodeSizeMM - 10;

    // Découper le nom du client en plusieurs lignes si nécessaire
    const rawLines = pdf.splitTextToSize(
      (commande.clients?.name || 'Client inconnu').split(' - ').pop() || 'Client inconnu',
      maxTextWidth,
    );
    // Découpe les mots trop longs (ex: max 20 caractères par ligne)
    const clientLines = forceSplitLines(rawLines, 20);

    // Limiter à 3 lignes maximum
    const maxLines = 5;
    const displayLines = clientLines.slice(0, maxLines);
    pdf.setFontSize(14);
    // Afficher chaque ligne
    displayLines.forEach((line: string, index: number) => {
      pdf.text(line, 0, 7 + index * 5); // Espacement de 3mm entre les lignes (descendu de 1mm)
    });

    // Command number (positionné après les lignes du client)
    const commandY = 7 + displayLines.length * 4 + 2; // 2mm d'espacement supplémentaire (descendu de 1mm)
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    const cmdText = `CMD ${commande.numero_commande.toUpperCase()}`;
    pdf.text(cmdText, 3, commandY);

    if (action === 'print') {
      pdf.autoPrint();
      const pdfUrl = pdf.output('bloburl');
      const printWindow = window.open(pdfUrl.toString(), '_blank');
      if (!printWindow) {
        alert(
          "La fenêtre d'impression a été bloquée. Veuillez autoriser les pop-ups.",
        );
      }
    } else {
      const pdfUrl = pdf.output('bloburl');
      const previewWindow = window.open(pdfUrl.toString(), '_blank');
      if (!previewWindow) {
        alert(
          "La fenêtre d'aperçu a été bloquée. Veuillez autoriser les pop-ups.",
        );
      }
    }
  };

  const generateZPL = () => {
    const clientName = commande.clients?.name || 'Client inconnu';

    const zplCode = `
^XA
^PW456
^LL216
^LS0

^FO20,30^A0N,28,28^FD${clientName.toUpperCase()}^FS
^FO20,80^A0N,25,25^FD${commande.numero_commande.toUpperCase()}^FS

^FO300,40^BQN,2,5^FDQA,${commande.numero_commande}^FS

^XZ
`;
    return zplCode.trim();
  };

  const handleDownloadZPL = () => {
    const zpl = generateZPL();
    const blob = new Blob([zpl], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etiquette-${commande.numero_commande}.zpl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => generatePDF('print')}
        variant="default"
        size="sm"
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Imprimer Client
      </Button>

      <Button
        onClick={generateProductsPDF}
        variant="secondary"
        size="sm"
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Imprimer Produits
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Aide Zebra
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imprimer sur une imprimante Zebra</DialogTitle>
            <DialogDescription>
              Les imprimantes thermiques comme les Zebra utilisent un langage
              spécifique (ZPL) et n&apos;impriment pas toujours les PDF
              correctement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Pour une impression parfaite, le mieux est d&apos;utiliser le
              fichier ZPL.
            </p>
            <Button onClick={handleDownloadZPL}>
              Télécharger le fichier .zpl
            </Button>
            <div className="text-sm text-muted-foreground">
              <strong>Comment l&apos;utiliser ?</strong>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Téléchargez le fichier.</li>
                <li>
                  Utilisez un logiciel comme{' '}
                  <a
                    href="https://www.zebra.com/us/en/support-downloads/printer-software/zebra-setup-utilities.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Zebra Setup Utilities
                  </a>{' '}
                  pour envoyer le fichier directement à l&apos;imprimante.
                </li>
                <li>
                  Alternative : copiez le contenu du fichier et collez-le dans
                  l&apos;outil &quot;Send File&quot; de Zebra Setup Utilities.
                </li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrintLabel;
