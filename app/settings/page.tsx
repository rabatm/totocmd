'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings, useSettingsMutations } from '@/hooks/useSettings';
import { Settings, Loader2, Save, RefreshCw, Key, Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { AppSetting } from '@/src/types';

export default function SettingsPage() {
  const { data: settingsData, isLoading, refetch } = useSettings();
  const { updateSetting } = useSettingsMutations();

  const settings = settingsData?.data || [];

  // État local pour les valeurs modifiées
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Initialiser les valeurs lors du chargement
  useEffect(() => {
    if (settings.length > 0) {
      const initialValues: Record<string, string> = {};
      settings.forEach(setting => {
        initialValues[setting.key] = setting.value || '';
      });
      setValues(initialValues);
    }
  }, [settings]);

  const handleSave = async (setting: AppSetting) => {
    setSaving({ ...saving, [setting.key]: true });
    try {
      await updateSetting.mutateAsync({
        key: setting.key,
        value: values[setting.key],
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving({ ...saving, [setting.key]: false });
    }
  };

  const handleChange = (key: string, value: string) => {
    setValues({ ...values, [key]: value });
  };

  // Grouper les paramètres par catégorie
  const integrationSettings = settings.filter(s => s.category === 'integrations');
  const generalSettings = settings.filter(s => s.category === 'general');

  console.log('Settings data:', { settings, integrationSettings, generalSettings });

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                <Settings className="h-8 w-8" />
                Paramètres de l'application
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez les paramètres généraux et les intégrations
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Message si pas de paramètres */}
        {settings.length === 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Key className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-900">Table app_settings non trouvée</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Vous devez d'abord exécuter la migration SQL. Ouvrez le fichier{' '}
                    <code className="bg-orange-100 px-2 py-0.5 rounded">migrations/create_app_settings.sql</code>{' '}
                    dans votre dashboard Supabase (SQL Editor) et exécutez-le.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Intégrations */}
          {integrationSettings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Intégrations
              </CardTitle>
              <CardDescription>
                Clés API et paramètres pour les services externes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {integrationSettings.map(setting => (
                <div key={setting.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={setting.key} className="font-semibold">
                      {setting.key}
                    </Label>
                    <Button
                      onClick={() => handleSave(setting)}
                      disabled={saving[setting.key] || values[setting.key] === setting.value}
                      size="sm"
                      variant={values[setting.key] !== setting.value ? 'default' : 'outline'}
                    >
                      {saving[setting.key] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Enregistrer
                        </>
                      )}
                    </Button>
                  </div>
                  {setting.description && (
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  )}
                  <Input
                    id={setting.key}
                    type={setting.is_encrypted ? 'password' : 'text'}
                    value={values[setting.key] || ''}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    placeholder={`Entrez ${setting.key}`}
                    className="font-mono text-sm"
                  />
                  {values[setting.key] !== setting.value && (
                    <p className="text-xs text-orange-600">
                      Modifications non enregistrées
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          )}

          {/* Paramètres généraux */}
          {generalSettings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Informations de la boutique
              </CardTitle>
              <CardDescription>
                Informations générales sur votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {generalSettings.map(setting => (
                <div key={setting.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={setting.key} className="font-semibold">
                      {setting.key.replace('SHOP_', '').replace(/_/g, ' ')}
                    </Label>
                    <Button
                      onClick={() => handleSave(setting)}
                      disabled={saving[setting.key] || values[setting.key] === setting.value}
                      size="sm"
                      variant={values[setting.key] !== setting.value ? 'default' : 'outline'}
                    >
                      {saving[setting.key] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Enregistrer
                        </>
                      )}
                    </Button>
                  </div>
                  {setting.description && (
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  )}
                  <Input
                    id={setting.key}
                    type="text"
                    value={values[setting.key] || ''}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    placeholder={`Entrez ${setting.key.replace('SHOP_', '').toLowerCase()}`}
                  />
                  {values[setting.key] !== setting.value && (
                    <p className="text-xs text-orange-600">
                      Modifications non enregistrées
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
