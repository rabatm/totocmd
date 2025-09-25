// Utilitaires pour les calculs de dates

/**
 * Calcule la date d'expédition prévisionnelle (2 semaines avant la migration)
 * @param dateMigration - Date de migration au format ISO string
 * @returns Date d'expédition prévisionnelle au format ISO string
 */
export const calculateDateExpeditionPrevisionnelle = (dateMigration: string): string => {
  const migration = new Date(dateMigration);
  const expedition = new Date(migration);
  expedition.setDate(expedition.getDate() - 14); // 2 semaines avant
  return expedition.toISOString().split('T')[0]; // Format YYYY-MM-DD
};

/**
 * Formate une date pour affichage français
 * @param dateString - Date au format ISO string
 * @returns Date formatée en français (JJ/MM/AAAA)
 */
export const formatDateFrench = (dateString?: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

/**
 * Vérifie si une commande est une migration/ouverture
 */
export const isMigrationCommande = (typeCommande: string): boolean => {
  return typeCommande === 'migration_ouverture';
};