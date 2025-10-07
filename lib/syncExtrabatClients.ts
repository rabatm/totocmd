import { createClient } from '@supabase/supabase-js';

interface ExtrabatClient {
  // IDs
  id?: string | number;
  extrabat_id?: string;
  cli_id?: string;

  // Noms - ancien format (cli_*) et nouveau format API v3
  name?: string;
  nom?: string;
  cli_nom?: string;
  prenom?: string;
  cli_prenom?: string;

  // Email
  email?: string;
  cli_email?: string;

  // Téléphone
  phone?: string;
  cli_tel?: string;
  cli_mobile?: string;

  // Adresse - ancien format
  address?: string;
  cli_adresse?: string;
  city?: string;
  cli_ville?: string;
  postal_code?: string;
  cli_cp?: string;
  country?: string;
  cli_pays?: string;

  // Propriétés API v3 (optionnelles)
  civilite?: {
    libelle?: string;
  };
  siret?: string;
  codeCompta?: string;
  dateCreation?: string;
  dateModif?: string;
}

interface SupabaseClientData {
  extrabat_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

// Fonction pour récupérer un paramètre depuis la base de données ou l'environnement (fallback)
import type { SupabaseClient } from '@supabase/supabase-js';

async function getSettingValue(supabase: SupabaseClient, key: string): Promise<string> {
  try {
    // Essayer de récupérer depuis app_settings
    const { data: setting, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (!error && setting?.value) {
      return setting.value;
    }

    // Fallback vers les variables d'environnement
    const envValue = process.env[key];
    if (envValue) {
      console.log(`⚠️ Utilisation de la variable d'environnement pour ${key} (fallback)`);
      return envValue;
    }

    throw new Error(`Paramètre ${key} non trouvé dans la base de données ni dans les variables d'environnement`);
  } catch (error) {
    throw new Error(`Erreur lors de la récupération du paramètre ${key}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Fonction pour récupérer les variables d'environnement (legacy)
async function getEnvVar(key: string): Promise<string> {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable d'environnement ${key} manquante`);
  }
  return value;
}

// Normalisation des données client ExtraBat vers format Supabase
function normalizeClientData(client: ExtrabatClient): SupabaseClientData {
  // Gérer les deux formats : ancien (cli_*) et nouveau (API v3)
  const extrabatId = String(client.id || client.cli_id || client.extrabat_id || '');
  const nom = client.nom || client.cli_nom || client.name || '';
  const prenom = client.prenom || client.cli_prenom || '';
  const fullName = prenom ? `${prenom} ${nom}`.trim() : nom;

  // Email
  const email = client.email || client.cli_email || null;

  // Téléphone - gérer le tableau telephone[] de l'API v3
  let phone = client.cli_mobile || client.cli_tel || client.phone || null;
  const clientWithPhone = client as ExtrabatClient & { telephone?: Array<{ numero?: string }> };
  if (clientWithPhone.telephone && Array.isArray(clientWithPhone.telephone) && clientWithPhone.telephone.length > 0) {
    phone = clientWithPhone.telephone[0].numero || phone;
  }

  // Adresse - gérer le tableau adresse[] de l'API v3
  let address = client.cli_adresse || client.address || null;
  let city = client.cli_ville || client.city || null;
  let postal_code = client.cli_cp || client.postal_code || null;

  const clientWithAddr = client as ExtrabatClient & { adresse?: Array<{ adresse?: string; ville?: string; codePostal?: string }> };
  if (clientWithAddr.adresse && Array.isArray(clientWithAddr.adresse) && clientWithAddr.adresse.length > 0) {
    const firstAddr = clientWithAddr.adresse[0];
    address = firstAddr.adresse || address;
    city = firstAddr.ville || city;
    postal_code = firstAddr.codePostal || postal_code;
  }

  return {
    extrabat_id: extrabatId,
    name: fullName || 'Client sans nom',
    email: email,
    phone: phone,
    address: address,
    city: city,
    postal_code: postal_code,
    country: client.cli_pays || client.country || 'France',
  };
}

// Récupération de tous les clients depuis ExtraBat
async function fetchAllExtrabatClients(supabase: SupabaseClient): Promise<SupabaseClientData[]> {
  const apiUrl = await getSettingValue(supabase, 'EXTRABAT_API_URL');
  const apiKey = await getSettingValue(supabase, 'EXTRABAT_API_KEY');

  console.log("Variables Extrabat:", {
    hasApiUrl: !!apiUrl,
    hasApiKey: !!apiKey,
    apiUrl: apiUrl ? `${apiUrl.substring(0, 20)}...` : "manquant",
  });

  if (!apiUrl || !apiKey) {
    throw new Error('Configuration Extrabat manquante: Veuillez configurer EXTRABAT_API_URL et EXTRABAT_API_KEY dans les paramètres.');
  }

  const nbitem = 50;
  let page = 1;
  let allClients: ExtrabatClient[] = [];
  let hasMore = true;
  let retryCount = 0;
  const maxRetries = 3;

  while (hasMore) {
    const url = `${apiUrl}/clients?nbitem=${nbitem}&page=${page}`;
    console.log(`Récupération page ${page} depuis ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      // Log de la structure de la réponse
      console.log(`📦 Structure de la réponse (page ${page}):`, {
        isArray: Array.isArray(data),
        hasClientsKey: 'clients' in data,
        hasDataKey: 'data' in data,
        keys: Object.keys(data),
        dataType: typeof data
      });

      const clients: ExtrabatClient[] = Array.isArray(data) ? data : data.clients || data.data || [];
      console.log(`✅ Page ${page}: ${clients.length} clients récupérés`);

      // Log du premier client pour voir la structure des données
      if (clients.length > 0 && page === 1) {
        console.log(`📋 Exemple de client brut (premier client):`, JSON.stringify(clients[0], null, 2));
      }

      allClients = allClients.concat(clients);

      if (clients.length < nbitem) {
        hasMore = false;
      } else {
        page++;
      }

      retryCount = 0;

      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

    } catch (error) {
      console.error(`Erreur page ${page}:`, error);

      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Tentative ${retryCount}/${maxRetries} pour la page ${page}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      } else {
        throw new Error(`Échec après ${maxRetries} tentatives pour la page ${page}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  }

  // Log final des clients récupérés
  console.log(`📊 Récapitulatif final:`, {
    totalClients: allClients.length,
    totalPages: page
  });

  // Normaliser et logger les résultats
  const normalizedClients: SupabaseClientData[] = allClients.map(normalizeClientData);

  // Log de quelques clients normalisés pour vérification
  if (normalizedClients.length > 0) {
    console.log(`🔄 Exemple de client normalisé (premier):`, JSON.stringify(normalizedClients[0], null, 2));
    if (normalizedClients.length > 1) {
      console.log(`🔄 Exemple de client normalisé (dernier):`, JSON.stringify(normalizedClients[normalizedClients.length - 1], null, 2));
    }
  }

  return normalizedClients;
}

// Synchronisation des clients dans Supabase
export async function syncExtrabatClientsToSupabase(): Promise<{
  success: boolean;
  total: number;
  inserted: number;
  updated: number;
  errors: number;
  message: string;
}> {
  try {
    console.log('🔄 Début de la synchronisation des clients ExtraBat...');

    // Initialisation du client Supabase (nécessaire pour récupérer les settings)
    const supabaseUrl = await getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseKey = await getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupération des clients depuis ExtraBat (avec accès à Supabase pour les settings)
    const extrabatClients = await fetchAllExtrabatClients(supabase);
    console.log(`📥 ${extrabatClients.length} clients récupérés depuis ExtraBat`);

    if (extrabatClients.length === 0) {
      return {
        success: true,
        total: 0,
        inserted: 0,
        updated: 0,
        errors: 0,
        message: 'Aucun client trouvé dans ExtraBat'
      };
    }

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    // Traitement par lots de 50 clients
    const batchSize = 50;
    for (let i = 0; i < extrabatClients.length; i += batchSize) {
      const batch = extrabatClients.slice(i, i + batchSize);
      console.log(`📦 Traitement du lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(extrabatClients.length / batchSize)}`);

      for (const client of batch) {
        try {
          // Vérifier si le client existe déjà
          const { data: existing } = await supabase
            .from('clients')
            .select('id, extrabat_id')
            .eq('extrabat_id', client.extrabat_id)
            .single();

          if (existing) {
            // Mise à jour du client existant
            console.log(`🔄 Mise à jour du client existant: ${client.name} (${client.extrabat_id})`);
            const { error: updateError } = await supabase
              .from('clients')
              .update({
                name: client.name,
                email: client.email,
                phone: client.phone,
                address: client.address,
                city: client.city,
                postal_code: client.postal_code,
                country: client.country,
                updated_at: new Date().toISOString()
              })
              .eq('extrabat_id', client.extrabat_id);

            if (updateError) {
              console.error(`❌ Erreur mise à jour client ${client.extrabat_id} (${client.name}):`, updateError);
              errors++;
            } else {
              console.log(`✅ Client mis à jour: ${client.name}`);
              updated++;
            }
          } else {
            // Insertion d'un nouveau client
            console.log(`➕ Insertion nouveau client: ${client.name} (${client.extrabat_id})`);
            const { error: insertError } = await supabase
              .from('clients')
              .insert({
                extrabat_id: client.extrabat_id,
                name: client.name,
                email: client.email,
                phone: client.phone,
                address: client.address,
                city: client.city,
                postal_code: client.postal_code,
                country: client.country
              });

            if (insertError) {
              console.error(`❌ Erreur insertion client ${client.extrabat_id} (${client.name}):`, insertError);
              errors++;
            } else {
              console.log(`✅ Client inséré: ${client.name}`);
              inserted++;
            }
          }
        } catch (error) {
          console.error(`❌ Erreur traitement client ${client.extrabat_id}:`, error);
          errors++;
        }
      }

      // Petite pause entre les lots
      if (i + batchSize < extrabatClients.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const message = `✅ Synchronisation terminée: ${inserted} ajoutés, ${updated} mis à jour, ${errors} erreurs`;
    console.log(message);

    return {
      success: true,
      total: extrabatClients.length,
      inserted,
      updated,
      errors,
      message
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('❌ Erreur lors de la synchronisation:', errorMessage);

    return {
      success: false,
      total: 0,
      inserted: 0,
      updated: 0,
      errors: 1,
      message: `Erreur: ${errorMessage}`
    };
  }
}

// Fonction pour une synchronisation incrémentale (seulement les nouveaux/modifiés)
export async function syncExtrabatClientsIncremental(): Promise<{
  success: boolean;
  total: number;
  inserted: number;
  updated: number;
  errors: number;
  message: string;
}> {
  // Pour l'instant, on fait une synchro complète
  // TODO: Implémenter la synchro incrémentale si ExtraBat supporte un filtre par date
  return syncExtrabatClientsToSupabase();
}
