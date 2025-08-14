'use client';

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
import { useClients } from '@/hooks/useCommandes';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2, User } from 'lucide-react';
import { useState } from 'react';
import AddClientDialog from './AddClientDialog';

interface ClientSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export default function ClientSelect({
  value,
  onValueChange,
}: ClientSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: clients, isLoading } = useClients();

  const selectedClient = clients?.find(
    client => client.id.toString() === value,
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedClient ? (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{selectedClient.name}</span>
                {selectedClient.email && (
                  <span className="text-xs text-gray-500">
                    ({selectedClient.email})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-500">Sélectionner un client...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Rechercher un client..." />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Chargement...</span>
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    <div className="text-center p-4">
                      <User className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-3">
                        Aucun client trouvé
                      </p>
                      <AddClientDialog
                        onClientCreated={clientId => {
                          onValueChange(clientId);
                          setOpen(false);
                        }}
                      />
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {clients?.map(client => (
                      <CommandItem
                        key={client.id}
                        value={`${client.name} ${client.email || ''}`}
                        onSelect={() => {
                          onValueChange(client.id.toString());
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === client.id.toString()
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{client.name}</span>
                          </div>
                          {(client.email || client.phone) && (
                            <div className="text-xs text-gray-500 ml-6">
                              {client.email && <span>{client.email}</span>}
                              {client.email && client.phone && <span> • </span>}
                              {client.phone && <span>{client.phone}</span>}
                            </div>
                          )}
                          {(client.city || client.address) && (
                            <div className="text-xs text-gray-400 ml-6">
                              {client.address && <span>{client.address}</span>}
                              {client.address && client.city && <span>, </span>}
                              {client.city && <span>{client.city}</span>}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  {/* Option pour créer un nouveau client */}
                  <div className="border-t p-2">
                    <AddClientDialog
                      onClientCreated={clientId => {
                        onValueChange(clientId);
                        setOpen(false);
                      }}
                    />
                  </div>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Informations du client sélectionné */}
      {selectedClient && (
        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-blue-900">
                {selectedClient.name}
              </h4>
              {selectedClient.email && (
                <p className="text-sm text-blue-700">{selectedClient.email}</p>
              )}
              {selectedClient.phone && (
                <p className="text-sm text-blue-700">{selectedClient.phone}</p>
              )}
              {(selectedClient.address || selectedClient.city) && (
                <p className="text-sm text-blue-600">
                  {selectedClient.address}
                  {selectedClient.address && selectedClient.city && ', '}
                  {selectedClient.city}
                  {selectedClient.postal_code &&
                    ` ${selectedClient.postal_code}`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
