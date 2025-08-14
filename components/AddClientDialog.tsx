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
import { Textarea } from '@/components/ui/textarea';
import { useCreateClient } from '@/hooks/useClientMutations';
import { Loader2, Plus, User } from 'lucide-react';
import { useState } from 'react';

interface AddClientDialogProps {
  onClientCreated?: (clientId: string) => void;
}

export default function AddClientDialog({
  onClientCreated,
}: AddClientDialogProps) {
  const [open, setOpen] = useState(false);
  const createClient = useCreateClient();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Le nom du client est obligatoire');
      return;
    }

    try {
      const newClient = await createClient.mutateAsync({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        postal_code: formData.postal_code || undefined,
        country: formData.country || undefined,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        country: 'France',
      });

      setOpen(false);

      // Notifier le parent
      if (onClientCreated && newClient?.id) {
        onClientCreated(newClient.id.toString());
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création du client');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Nouveau client
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations principales */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nom du client"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData(prev => ({ ...prev, email: e.target.value }))
                }
                placeholder="email@exemple.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={e =>
                setFormData(prev => ({ ...prev, phone: e.target.value }))
              }
              placeholder="01 23 45 67 89"
            />
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={e =>
                setFormData(prev => ({ ...prev, address: e.target.value }))
              }
              placeholder="Adresse complète"
              rows={2}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={e =>
                  setFormData(prev => ({ ...prev, city: e.target.value }))
                }
                placeholder="Ville"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    postal_code: e.target.value,
                  }))
                }
                placeholder="75000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={e =>
                  setFormData(prev => ({ ...prev, country: e.target.value }))
                }
                placeholder="France"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={createClient.isPending}>
              {createClient.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
