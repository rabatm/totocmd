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
import { CommandeWithDetails } from '@/src/types';
import { jsPDF } from 'jspdf';
import { Printer, Zap } from 'lucide-react';
import QRCode from 'qrcode';

interface PrintLabelProps {
  commande: CommandeWithDetails;
}

const PrintLabel: React.FC<PrintLabelProps> = ({ commande }) => {
  const LABEL_WIDTH_MM = 57;
  const LABEL_HEIGHT_MM = 27;

  const generatePDF = async (action: 'print' | 'preview') => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [LABEL_HEIGHT_MM, LABEL_WIDTH_MM],
    });

    const clientName =
      commande.clients?.name || commande.clients?.[0]?.name || 'Client inconnu';
    // --- QR Code ---
    const qrCodeSizeMM = 10;
    const qrCodeDataURL = await QRCode.toDataURL(commande.numero_commande, {
      width: 64, // pixels
      margin: 1,
      errorCorrectionLevel: 'H',
    });

    pdf.addImage(
      qrCodeDataURL,
      'PNG',
      LABEL_WIDTH_MM - qrCodeSizeMM - 3, // x position
      (LABEL_HEIGHT_MM - qrCodeSizeMM) / 2 - 3, // y position
      qrCodeSizeMM, // width
      qrCodeSizeMM, // height
    );

    // --- Text ---
    pdf.setTextColor(0, 0, 0);

    // Client name (en haut, en gras) - gestion multi-lignes
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);

    // Largeur maximale disponible pour le texte (en laissant de la place pour le QR code)
    const maxTextWidth = LABEL_WIDTH_MM - qrCodeSizeMM - 6;

    // Découper le nom du client en plusieurs lignes si nécessaire
    const clientLines = pdf.splitTextToSize(
      clientName.toUpperCase(),
      maxTextWidth,
    );

    // Limiter à 3 lignes maximum
    const maxLines = 3;
    const displayLines = clientLines.slice(0, maxLines);

    // Afficher chaque ligne
    displayLines.forEach((line: string, index: number) => {
      pdf.text(line, 3, 7 + index * 3); // Espacement de 3mm entre les lignes (descendu de 1mm)
    });

    // Command number (positionné après les lignes du client)
    const commandY = 7 + displayLines.length * 3 + 2; // 2mm d'espacement supplémentaire (descendu de 1mm)
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
    const clientName =
      commande.client?.name || commande.clients?.[0]?.name || 'Client inconnu';

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
        Imprimer (PDF)
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
