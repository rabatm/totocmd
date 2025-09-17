'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, Download } from 'lucide-react';

interface ImportSourceSelectorProps {
  value: 'manual' | 'extrabat';
  onValueChange: (value: 'manual' | 'extrabat') => void;
}

export default function ImportSourceSelector({
  value,
  onValueChange,
}: ImportSourceSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mode de création de commande</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={value} onValueChange={onValueChange} className="grid gap-4">
          <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="manual" id="manual" />
            <div className="flex items-center space-x-3 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label htmlFor="manual" className="text-base font-medium cursor-pointer">
                  Création manuelle
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Créer une nouvelle commande en saisissant les informations manuellement
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="extrabat" id="extrabat" />
            <div className="flex items-center space-x-3 flex-1">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <Label htmlFor="extrabat" className="text-base font-medium cursor-pointer">
                  Import depuis ExtraBat
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Importer une commande existante depuis ExtraBat avec tous ses articles
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}