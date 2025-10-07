import { NextRequest, NextResponse } from 'next/server';

interface ExtrabatClient {
  cli_id?: string;
  extrabat_id?: string;
  id?: string | number;
  cli_nom?: string;
  name?: string;
  nom?: string;
  cli_prenom?: string;
  prenom?: string;
  cli_email?: string;
  email?: string;
  cli_mobile?: string;
  cli_tel?: string;
  phone?: string;
  cli_adresse?: string;
  address?: string;
  cli_ville?: string;
  city?: string;
  cli_cp?: string;
  postal_code?: string;
  siret?: string;
  codeCompta?: string;
  dateCreation?: string;
  dateModif?: string;
  telephone?: Array<{ numero?: string }>;
  adresse?: Array<{
    adresse?: string;
    ville?: string;
    codePostal?: string;
  }>;
  civilite?: { libelle?: string };
  [key: string]: unknown;
}

async function getEnvVar(key: string): Promise<string> {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable d'environnement ${key} manquante`);
  }
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const { searchTerm } = await request.json();

    if (!searchTerm) {
      return NextResponse.json({ error: 'Terme de recherche requis' }, { status: 400 });
    }

    const apiUrl = await getEnvVar('EXTRABAT_API_URL');
    const apiKey = await getEnvVar('EXTRABAT_API_KEY');

    // Rechercher dans toutes les pages (max 5 pages)
    let allClients: ExtrabatClient[] = [];
    let page = 1;
    const maxPages = 5;

    while (page <= maxPages) {
      const url = `${apiUrl}/clients?nbitem=50&page=${page}`;
      console.log(`🔍 Recherche ExtraBat page ${page}: ${url}`);

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
      const clients = Array.isArray(data) ? data : data.clients || data.data || [];

      allClients = allClients.concat(clients);

      if (clients.length < 50) {
        break;
      }
      page++;
    }

    console.log(`📊 Total clients ExtraBat récupérés: ${allClients.length}`);

    // Filtrer les clients correspondant au terme de recherche
    const searchLower = searchTerm.toLowerCase();
    const matchingClients = allClients.filter((client: ExtrabatClient) => {
      const name = (client.cli_nom || client.name || '').toLowerCase();
      const prenom = (client.cli_prenom || '').toLowerCase();
      const email = (client.cli_email || client.email || '').toLowerCase();
      const id = (client.cli_id || client.extrabat_id || client.id || '').toString().toLowerCase();

      return name.includes(searchLower) ||
             prenom.includes(searchLower) ||
             email.includes(searchLower) ||
             id.includes(searchLower) ||
             `${prenom} ${name}`.toLowerCase().includes(searchLower);
    });

    console.log(`✅ Clients trouvés: ${matchingClients.length}`);

    // Pour chaque client trouvé, récupérer les détails complets via /v3/client/{id}
    const detailedClients = await Promise.all(
      matchingClients.slice(0, 10).map(async (client: ExtrabatClient) => {
        try {
          const clientId = client.cli_id || client.extrabat_id || client.id;
          const detailUrl = `${apiUrl}/client/${clientId}?include=telephone,adresse`;

          console.log(`📋 Récupération détails client ${clientId}...`);

          const detailResponse = await fetch(detailUrl, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000),
          });

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            console.log(`✅ Détails récupérés pour ${clientId}`);
            return detailData;
          } else {
            console.log(`⚠️ Impossible de récupérer les détails pour ${clientId}`);
            return client;
          }
        } catch (error) {
          console.error(`❌ Erreur détails client:`, error);
          return client;
        }
      })
    );

    // Normaliser les données
    const normalizedClients = detailedClients.map((client: ExtrabatClient) => {
      // Utiliser les nouvelles propriétés de l'API v3
      const nom = client.nom || client.cli_nom || client.name || '';
      const prenom = client.prenom || client.cli_prenom || '';
      const fullName = prenom ? `${prenom} ${nom}`.trim() : nom;

      // Extraire le premier téléphone si disponible
      let phone = client.cli_mobile || client.cli_tel || client.phone;
      if (client.telephone && Array.isArray(client.telephone) && client.telephone.length > 0) {
        phone = client.telephone[0].numero || phone;
      }

      // Extraire la première adresse si disponible
      let address = client.cli_adresse || client.address;
      let city = client.cli_ville || client.city;
      let postal_code = client.cli_cp || client.postal_code;

      if (client.adresse && Array.isArray(client.adresse) && client.adresse.length > 0) {
        const firstAddr = client.adresse[0];
        address = firstAddr.adresse || address;
        city = firstAddr.ville || city;
        postal_code = firstAddr.codePostal || postal_code;
      }

      return {
        extrabat_id: client.id || client.cli_id || client.extrabat_id,
        name: fullName,
        email: client.email || client.cli_email,
        phone: phone,
        city: city,
        address: address,
        postal_code: postal_code,
        siret: client.siret,
        code_compta: client.codeCompta,
        date_creation: client.dateCreation,
        date_modif: client.dateModif,
        civilite: client.civilite?.libelle,
        raw: client // Données brutes pour debug
      };
    });

    return NextResponse.json({
      success: true,
      count: normalizedClients.length,
      clients: normalizedClients
    });

  } catch (error) {
    console.error('❌ Erreur recherche ExtraBat:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        success: false
      },
      { status: 500 }
    );
  }
}
