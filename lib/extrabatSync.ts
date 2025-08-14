import { supabase } from '@/lib/supabaseClient';
import { ExtrabatProduit, Produit } from '@/src/types';

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
}

// Instance par défaut du service
export const extrabatSync = new ExtrabatSyncService();
