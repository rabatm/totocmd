import { supabase } from '@/lib/supabaseClient';
import { ExtrabatProduit, Produit, Commande } from '@/src/types';

// Types pour les commandes ExtraBat
interface ExtrabatCommande {
  id: string;
  code: string; // Le numéro de commande est dans "code", pas "numero"
  date: string;
  titre: string; // Le libellé est dans "titre", pas "libelle"
  totalHT: number; // Les montants ont des noms différents
  totalTTC: number;
  type: number;
  etatLettrage?: number;
  transformationState?: number;
  client?: {
    id: string;
    nom: string;
    email?: string;
  };
  lignes?: ExtrabatLigneCommande[];
}

interface ExtrabatLigneCommande {
  id: number;
  code: string;
  description: string;
  quantite: string | null;
  puht: string;
  totalHt: string;
  article: {
    id: number;
    code: string;
    libelle: string;
    description?: string;
    prix: number;
  } | null;
}

// Types supprimés car l'API ExtraBat retourne directement les données

// Configuration de l'API Extrabat
const EXTRABAT_API_URL = 'https://api.extrabat.com/v1';
const EXTRABAT_API_KEY = process.env.EXTRABAT_API_KEY; // À configurer dans .env.local

export class ExtrabatSyncService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || EXTRABAT_API_KEY || '';
  }

  // Fonction pour récupérer tous les articles depuis Extrabat avec pagination
  async fetchArticlesFromExtrabat(): Promise<ExtrabatProduit[]> {
    if (!this.apiKey) {
      throw new Error('Clé API Extrabat manquante');
    }

    const allArticles: ExtrabatProduit[] = [];
    let currentPage = 1;
    let totalPages = 1;

    try {
      do {
        const response = await fetch(
          `${EXTRABAT_API_URL}/articles?page=${currentPage}&size=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Erreur API Extrabat: ${response.status} ${response.statusText}`,
          );
        }

        // Récupérer les informations de pagination depuis les headers
        const paginationTotalPages = response.headers.get(
          'x-pagination-total-pages',
        );
        const totalCount = response.headers.get('x-total-count');

        if (paginationTotalPages) {
          totalPages = parseInt(paginationTotalPages, 10);
        }

        const data = await response.json();
        const articles = Array.isArray(data) ? data : data.articles || [];

        allArticles.push(...articles);

        console.log(
          `Page ${currentPage}/${totalPages} récupérée: ${
            articles.length
          } produits (Total: ${allArticles.length}/${totalCount || 'inconnu'})`,
        );

        currentPage++;
      } while (currentPage <= totalPages);

      return allArticles;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des articles Extrabat:',
        error,
      );
      throw error;
    }
  }

  // Transformer un produit Extrabat vers le format Supabase
  transformExtrabatProduit(
    extrabatProduit: ExtrabatProduit,
  ): Omit<Produit, 'created_at' | 'updated_at'> {
    return {
      id: extrabatProduit.id,
      code: extrabatProduit.code,
      code_barre: extrabatProduit.codeBarre || undefined,
      libelle: extrabatProduit.libelle,
      description: extrabatProduit.description || undefined,
      prix: extrabatProduit.prix,
      prix_mini: extrabatProduit.prixMini
        ? parseFloat(extrabatProduit.prixMini)
        : undefined,
      prix_conseille: extrabatProduit.prixConseille
        ? parseFloat(extrabatProduit.prixConseille)
        : undefined,
      tenue_stock: extrabatProduit.tenueStock,
      // stock_physique: 0, // Temporairement supprimé car colonne manquante
      // stock_mini: undefined, // Temporairement supprimé car colonne manquante
      // stock_maxi: undefined, // Temporairement supprimé car colonne manquante
      poids: extrabatProduit.poids
        ? parseFloat(extrabatProduit.poids)
        : undefined,
      emplacement: extrabatProduit.emplacement || undefined,
      notes: extrabatProduit.notes || undefined,
      commissionable: extrabatProduit.commissionable,
      taux_tva: parseFloat(extrabatProduit.tauxTva.taux),
      unite_libelle: extrabatProduit.unite?.libelle || undefined,
      sous_famille_id: extrabatProduit.sousFamille?.id || undefined,
      sous_famille_libelle: extrabatProduit.sousFamille?.libelle || undefined,
      famille_id: extrabatProduit.famille?.id || undefined,
      famille_libelle: extrabatProduit.famille?.libelle || undefined,
      article_type_id: extrabatProduit.articleType?.id || undefined,
      article_type_libelle: extrabatProduit.articleType?.libelle || undefined,
      has_image: extrabatProduit.hasImage,
      has_image_gd: extrabatProduit.hasImageGd,
      last_sync: new Date().toISOString(),
      // archived: false, // Temporairement supprimé car colonne manquante
      // is_manuel: false, // Temporairement supprimé car colonne manquante
    };
  }

  // Synchroniser les produits avec Supabase
  async syncProduitsToSupabase(): Promise<{
    success: boolean;
    processed: number;
    inserted: number;
    updated: number;
    errors: number;
    message: string;
  }> {
    const syncStartTime = new Date();
    let processed = 0;
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    try {
      // 1. Enregistrer le début de la synchronisation
      const { data: syncLog } = await supabase
        .from('sync_logs')
        .insert({
          sync_type: 'produits',
          status: 'running',
          started_at: syncStartTime.toISOString(),
        })
        .select()
        .single();

      // 2. Récupérer les produits depuis Extrabat
      console.log('Récupération des produits depuis Extrabat...');
      const extrabatProduits = await this.fetchArticlesFromExtrabat();

      if (!extrabatProduits || extrabatProduits.length === 0) {
        throw new Error('Aucun produit récupéré depuis Extrabat');
      }

      console.log(
        `${extrabatProduits.length} produits récupérés depuis Extrabat`,
      );

      // 3. Traiter les produits par lots pour éviter les timeouts
      const batchSize = 100;
      for (let i = 0; i < extrabatProduits.length; i += batchSize) {
        const batch = extrabatProduits.slice(i, i + batchSize);

        for (const extrabatProduit of batch) {
          try {
            processed++;
            const produitData = this.transformExtrabatProduit(extrabatProduit);

            // Vérifier si le produit existe déjà
            const { data: existingProduit } = await supabase
              .from('produits')
              .select('id, last_sync')
              .eq('id', produitData.id)
              .single();

            if (existingProduit) {
              // Mettre à jour le produit existant
              const { error } = await supabase
                .from('produits')
                .update(produitData)
                .eq('id', produitData.id);

              if (error) {
                console.error(
                  `Erreur mise à jour produit ${produitData.id}:`,
                  error,
                );
                errors++;
              } else {
                updated++;
              }
            } else {
              // Insérer un nouveau produit
              const { error } = await supabase
                .from('produits')
                .insert(produitData);

              if (error) {
                console.error(
                  `Erreur insertion produit ${produitData.id}:`,
                  error,
                );
                errors++;
              } else {
                inserted++;
              }
            }
          } catch (error) {
            console.error(
              `Erreur traitement produit ${extrabatProduit.id}:`,
              error,
            );
            errors++;
          }
        }

        // Petite pause entre les lots
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 4. Mettre à jour le log de synchronisation
      const syncEndTime = new Date();
      const durationSeconds = Math.round(
        (syncEndTime.getTime() - syncStartTime.getTime()) / 1000,
      );

      if (syncLog) {
        await supabase
          .from('sync_logs')
          .update({
            status: errors === 0 ? 'success' : 'partial_error',
            records_processed: processed,
            records_inserted: inserted,
            records_updated: updated,
            records_errors: errors,
            completed_at: syncEndTime.toISOString(),
            duration_seconds: durationSeconds,
          })
          .eq('id', syncLog.id);
      }

      const message = `Synchronisation terminée: ${processed} traités, ${inserted} ajoutés, ${updated} mis à jour, ${errors} erreurs en ${durationSeconds}s`;
      console.log(message);

      return {
        success: errors === 0,
        processed,
        inserted,
        updated,
        errors,
        message,
      };
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);

      // Mettre à jour le log avec l'erreur
      const syncEndTime = new Date();
      const durationSeconds = Math.round(
        (syncEndTime.getTime() - syncStartTime.getTime()) / 1000,
      );

      await supabase.from('sync_logs').update({
        status: 'error',
        records_processed: processed,
        records_inserted: inserted,
        records_updated: updated,
        records_errors: errors + 1,
        error_message:
          error instanceof Error ? error.message : 'Erreur inconnue',
        completed_at: syncEndTime.toISOString(),
        duration_seconds: durationSeconds,
      });

      return {
        success: false,
        processed,
        inserted,
        updated,
        errors: errors + 1,
        message: `Erreur de synchronisation: ${
          error instanceof Error ? error.message : 'Erreur inconnue'
        }`,
      };
    }
  }

  // Récupérer les logs de synchronisation
  async getSyncLogs(limit: number = 10) {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('sync_type', 'produits')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erreur récupération logs:', error);
      return [];
    }

    return data || [];
  }

  // Méthodes pour les commandes ExtraBat
  async fetchCommandesByClient(clientExtrabatId: string): Promise<ExtrabatCommande[]> {
    if (!this.apiKey) {
      throw new Error('Clé API Extrabat manquante');
    }

    try {
      const response = await fetch(
        `${EXTRABAT_API_URL}/pieces?types=commande&clients=${clientExtrabatId}&include=client&order=piece.date:desc&nbitem=50`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Erreur API Extrabat: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      // L'API ExtraBat retourne directement un tableau de commandes
      return Array.isArray(data) ? data : data.pieces || [];
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des commandes Extrabat:',
        error,
      );
      throw error;
    }
  }

  async fetchCommandeDetails(pieceId: string): Promise<ExtrabatCommande> {
    if (!this.apiKey) {
      throw new Error('Clé API Extrabat manquante');
    }

    try {
      const response = await fetch(
        `${EXTRABAT_API_URL}/piece/${pieceId}?include=client,lignes,ligne.article`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Erreur API Extrabat: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      // L'API ExtraBat retourne directement la commande, pas dans un objet "piece"
      return data;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des détails de commande Extrabat:',
        error,
      );
      throw error;
    }
  }

  // Transformer une commande Extrabat vers le format Supabase
transformExtrabatCommande(
  extrabatCommande: ExtrabatCommande,
  localClientId: string,
): Omit<Commande, 'created_at' | 'updated_at'> {
    return {
      id: crypto.randomUUID(), // Génère un nouvel ID local
      client_id: parseInt(localClientId),
      numero_commande: extrabatCommande.code,
      date_commande: extrabatCommande.date,
      acompte_verse: 0, // Pas d'acompte versé par défaut
      total_ht: extrabatCommande.totalHT,
      total_ttc: extrabatCommande.totalTTC,
      total_tva: extrabatCommande.totalTTC - extrabatCommande.totalHT,
      etat: 'en_attente',
      progression: 0,
      remarque: extrabatCommande.titre,
      extrabat_id: extrabatCommande.id,
    };
  }

  // Créer ou récupérer un produit depuis un article ExtraBat
  async ensureProduitExists(articleExtrabat: ExtrabatLigneCommande['article']): Promise<string> {
    if (!articleExtrabat) {
      throw new Error('Article ExtraBat manquant');
    }

    console.log(`🔍 Recherche produit existant: ${articleExtrabat.code}`);

    // Vérifier si le produit existe déjà (par code)
    const { data: existingProduit, error: searchError } = await supabase
      .from('produits')
      .select('id')
      .eq('code', articleExtrabat.code)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('Erreur recherche produit:', searchError);
      throw new Error(`Erreur recherche produit: ${searchError.message}`);
    }

    if (existingProduit) {
      console.log(`✅ Produit existant trouvé: ${existingProduit.id}`);
      return existingProduit.id;
    }

    console.log(`🆕 Création nouveau produit: ${articleExtrabat.code}`);

    // Créer le produit s'il n'existe pas
    const produitData = {
      id: crypto.randomUUID(), // Génère un ID UUID local
      code: articleExtrabat.code,
      libelle: articleExtrabat.libelle,
      description: articleExtrabat.description || null,
      prix: articleExtrabat.prix,
      tenue_stock: false,
      taux_tva: 20, // TVA par défaut
      extrabat_id: articleExtrabat.id.toString(), // Garder l'ID ExtraBat pour référence
      last_sync: new Date().toISOString(),
    };

    console.log(`📝 Données produit à créer:`, JSON.stringify(produitData, null, 2));

    const { data: newProduit, error } = await supabase
      .from('produits')
      .insert(produitData)
      .select('id')
      .single();

    if (error) {
      console.error('❌ Erreur création produit:', {
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message
      });
      throw new Error(`Erreur lors de la création du produit ${articleExtrabat.code}: ${error.message}`);
    }

    if (!newProduit || !newProduit.id) {
      throw new Error('Produit créé mais ID manquant');
    }

    console.log(`✅ Nouveau produit créé: ${newProduit.id}`);
    return newProduit.id;
  }

  // Importer une commande complète depuis ExtraBat
  async importCommandeFromExtrabat(
    pieceId: string,
    localClientId: string,
  ): Promise<{ success: boolean; commandeId?: string; error?: string }> {
    try {
      // 1. Vérifier si la commande n'est pas déjà importée
      const { data: existingCommande } = await supabase
        .from('commandes')
        .select('id')
        .eq('extrabat_id', pieceId)
        .single();

      if (existingCommande) {
        return {
          success: false,
          error: 'Cette commande a déjà été importée',
        };
      }

      // 2. Récupérer les détails de la commande ExtraBat
      const extrabatCommande = await this.fetchCommandeDetails(pieceId);

      // 3. Transformer et créer la commande locale
      const commandeData = this.transformExtrabatCommande(
        extrabatCommande,
        localClientId,
      );

      const { data: newCommande, error: commandeError } = await supabase
        .from('commandes')
        .insert(commandeData)
        .select('id')
        .single();

      if (commandeError) {
        console.error('Erreur création commande:', commandeError);
        throw new Error(`Erreur création commande: ${commandeError.message || commandeError.details || commandeError.hint || JSON.stringify(commandeError)}`);
      }

      if (!newCommande || !newCommande.id) {
        throw new Error('Erreur: commande créée mais ID manquant');
      }

      // 4. Importer les lignes de commande
      console.log(`🔄 Import de ${extrabatCommande.lignes?.length || 0} lignes de commande...`);

      if (extrabatCommande.lignes && extrabatCommande.lignes.length > 0) {
        let lignesImportees = 0;
        let lignesEchouees = 0;

        for (const ligne of extrabatCommande.lignes) {
          // Ignorer les lignes sans article ou sans quantité (comme les descriptions)
          if (!ligne.article || !ligne.quantite || ligne.quantite === null) {
            console.log(`⏭️ Ligne ${ligne.id} ignorée (pas d'article ou quantité nulle)`);
            continue;
          }

          try {
            console.log(`📦 Import ligne ${ligne.id}: ${ligne.article.libelle} (${ligne.quantite})`);

            // Créer ou récupérer le produit
            const produitId = await this.ensureProduitExists(ligne.article);
            console.log(`✅ Produit créé/trouvé: ${produitId}`);

            // Récupérer un personnel_id valide (prendre le premier disponible)
            const { data: personnel } = await supabase
              .from('personnel')
              .select('id')
              .limit(1)
              .single();

            const personnelId = personnel?.id || 1; // Fallback sur 1 si pas de personnel trouvé

            // Créer la ligne de commande
            const ligneData = {
              id: crypto.randomUUID(),
              commande_id: newCommande.id,
              personnel_id: personnelId, // ✅ Utilisation d'un vrai personnel_id
              nom_produit: ligne.article.libelle,
              code_produit: ligne.article.code,
              quantite: parseFloat(ligne.quantite),
              statut: 'scanne',
              date_scan: new Date().toISOString(),
            };

            console.log(`📝 Données ligne à insérer:`, JSON.stringify(ligneData, null, 2));

            const { data: insertedLigne, error: ligneError } = await supabase
              .from('commande_produits')
              .insert(ligneData)
              .select('id')
              .single();

            if (ligneError) {
              console.error(`❌ Erreur création ligne commande ${ligne.id}:`, {
                code: ligneError.code,
                details: ligneError.details,
                hint: ligneError.hint,
                message: ligneError.message
              });
              lignesEchouees++;
            } else {
              console.log(`✅ Ligne ${ligne.id} importée avec succès (ID: ${insertedLigne?.id})`);
              lignesImportees++;
            }
          } catch (error) {
            console.error(`❌ Erreur traitement ligne ${ligne.id}:`, error);
            lignesEchouees++;
          }
        }

        console.log(`📊 Résumé import: ${lignesImportees} lignes réussies, ${lignesEchouees} échouées`);

        if (lignesEchouees > 0) {
          console.warn(`⚠️ ${lignesEchouees} lignes ont échoué lors de l'import`);
        }
      } else {
        console.log(`ℹ️ Aucune ligne de commande à importer`);
      }

      return {
        success: true,
        commandeId: newCommande.id,
      };
    } catch (error) {
      console.error('Erreur import commande ExtraBat:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
}

// Instance par défaut du service
export const extrabatSync = new ExtrabatSyncService();
