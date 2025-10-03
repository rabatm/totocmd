import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppSetting, UpdateSettingInput, CreateSettingInput, SettingCategory } from '@/src/types';

// Hook pour récupérer tous les paramètres
export const useSettings = (category?: SettingCategory) => {
  return useQuery({
    queryKey: category ? ['settings', category] : ['settings'],
    queryFn: async (): Promise<{ data: AppSetting[] }> => {
      const url = category ? `/api/settings?category=${category}` : '/api/settings';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des paramètres');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - les paramètres changent rarement
  });
};

// Hook pour récupérer un paramètre spécifique par sa clé
export const useSettingByKey = (key: string | null) => {
  return useQuery({
    queryKey: ['setting', key],
    queryFn: async (): Promise<{ data: AppSetting }> => {
      if (!key) throw new Error('Clé requise');

      const response = await fetch(`/api/settings/${key}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Paramètre non trouvé');
        }
        throw new Error('Erreur lors de la récupération du paramètre');
      }

      return response.json();
    },
    enabled: !!key,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour récupérer la valeur d'un paramètre spécifique
export const useSettingValue = (key: string) => {
  const { data, ...rest } = useSettingByKey(key);
  return {
    value: data?.data?.value || null,
    setting: data?.data,
    ...rest,
  };
};

// Hook pour les mutations de paramètres
export const useSettingsMutations = () => {
  const queryClient = useQueryClient();

  // Mutation pour mettre à jour un paramètre
  const updateSetting = useMutation({
    mutationFn: async (input: UpdateSettingInput) => {
      const response = await fetch(`/api/settings/${input.key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: input.value }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour du paramètre');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['setting', variables.key] });
    },
  });

  // Mutation pour créer un nouveau paramètre
  const createSetting = useMutation({
    mutationFn: async (input: CreateSettingInput) => {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création du paramètre');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider toutes les requêtes de paramètres
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  // Mutation pour supprimer un paramètre
  const deleteSetting = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch(`/api/settings/${key}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression du paramètre');
      }

      return response.json();
    },
    onSuccess: (_, key) => {
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['setting', key] });
    },
  });

  return {
    updateSetting,
    createSetting,
    deleteSetting,
  };
};

// Hook pour récupérer les paramètres d'intégration ExtraBat
export const useExtrabatSettings = () => {
  const { data: settingsData, ...rest } = useSettings('integrations');
  const settings = settingsData?.data || [];

  const extrabatApiKey = settings.find(s => s.key === 'EXTRABAT_API_KEY')?.value || '';
  const extrabatApiUrl = settings.find(s => s.key === 'EXTRABAT_API_URL')?.value || '';

  return {
    extrabatApiKey,
    extrabatApiUrl,
    settings,
    ...rest,
  };
};

// Hook pour récupérer les paramètres généraux de la boutique
export const useShopSettings = () => {
  const { data: settingsData, ...rest } = useSettings('general');
  const settings = settingsData?.data || [];

  return {
    shopName: settings.find(s => s.key === 'SHOP_NAME')?.value || '',
    shopAddress: settings.find(s => s.key === 'SHOP_ADDRESS')?.value || '',
    shopPhone: settings.find(s => s.key === 'SHOP_PHONE')?.value || '',
    shopEmail: settings.find(s => s.key === 'SHOP_EMAIL')?.value || '',
    settings,
    ...rest,
  };
};
