# Workflow API Extrabat - Récupération des commandes

## 🎯 Objectif
Récupérer les commandes d'un client et afficher les détails d'une commande spécifique de manière optimisée.

## 📋 Workflow en 3 étapes

### Étape 1 : Lister les commandes du client
**Objectif :** Avoir une vue d'ensemble légère des commandes avec libellés

```http
GET /v1/pieces?types=commande&clients={client_id}&include=client&order=piece.date:desc&nbitem=50
```

**Paramètres :**
- `types=commande` : Filtre sur les commandes uniquement
- `clients={client_id}` : ID du client spécifique
- `include=client` : Infos basiques du client (optionnel)
- `order=piece.date:desc` : Tri par date décroissante (plus récentes en premier)
- `nbitem=50` : Limite à 50 résultats pour la première vue

**Réponse attendue (avec libellé) :**
```json
{
  "pieces": [
    {
      "id": "CMD001",
      "date": "2024-09-15",
      "numero": "C2024-0891",
      "libelle": "Réparation pompe à chaleur + maintenance",
      "montant_ttc": 1250.00,
      "statut": "validée"
    },
    {
      "id": "CMD002", 
      "date": "2024-08-22",
      "numero": "C2024-0756",
      "libelle": "Installation système ventilation bureau",
      "montant_ttc": 890.50,
      "statut": "livrée"
    },
    {
      "id": "CMD003",
      "date": "2024-07-10", 
      "numero": "C2024-0623",
      "libelle": "Pièces détachées chaudière",
      "montant_ttc": 456.75,
      "statut": "facturée"
    }
  ]
}
```

### Étape 2 : Sélection de la commande
**Action utilisateur :** Choisir la commande désirée dans la liste

**Interface suggérée (avec libellés) :**
```
📋 Commandes de [Nom du client] :
1. C2024-0891 | 15/09/2024 | Réparation pompe à chaleur + maintenance | 1 250,00 € | Validée
2. C2024-0756 | 22/08/2024 | Installation système ventilation bureau | 890,50 € | Livrée  
3. C2024-0623 | 10/07/2024 | Pièces détachées chaudière | 456,75 € | Facturée

➤ Quelle commande voulez-vous détailler ? (1-3)
```

### Étape 3 : Récupérer les détails avec lignes
**Objectif :** Obtenir tous les détails de la commande sélectionnée

```http
GET /v1/piece/{piece_id}?include=client,lignes,ligne.article
```

**OU (selon la structure de l'API) :**

```http
GET /v1/pieces?types=commande&clients={client_id}&piece_id={piece_id}&include=client,lignes,ligne.article
```

**Paramètres :**
- `include=client,lignes,ligne.article` : Toutes les infos détaillées
- Utilise l'ID de la pièce sélectionnée à l'étape 2

**Réponse détaillée :**
```json
{
  "piece": {
    "id": "CMD001",
    "numero": "C2024-0891",
    "date": "2024-09-15",
    "montant_ht": 1041.67,
    "montant_ttc": 1250.00,
    "client": {
      "id": "123456",
      "nom": "Entreprise Dupont",
      "email": "contact@dupont.fr"
    },
    "lignes": [
      {
        "id": "L1",
        "quantite": 2,
        "prix_unitaire": 125.00,
        "montant_ht": 250.00,
        "article": {
          "id": "ART001",
          "code": "REF-ABC-001",
          "nom": "Produit Premium A",
          "description": "Description détaillée..."
        }
      },
      {
        "id": "L2", 
        "quantite": 5,
        "prix_unitaire": 89.90,
        "montant_ht": 449.50,
        "article": {
          "id": "ART002",
          "code": "REF-XYZ-002", 
          "nom": "Accessoire Standard B",
          "description": "Description détaillée..."
        }
      }
    ]
  }
}
```

## ⚡ Avantages de cette approche

✅ **Performance optimisée**
- Premier appel léger (pas de lignes)
- Deuxième appel détaillé uniquement sur la commande choisie

✅ **Expérience utilisateur**
- Vue d'ensemble rapide
- Choix éclairé avant le détail
- Chargement progressif

✅ **Respect des limites API**
- Moins de données transférées
- Appels ciblés et efficaces
- Pagination naturelle sur la liste

## 🔄 Gestion de la pagination (si nécessaire)

Si le client a plus de 50-100 commandes :

```http
# Page 1
GET /v1/pieces?types=commande&clients={client_id}&page=1&nbitem=50

# Pages suivantes si nécessaire  
GET /v1/pieces?types=commande&clients={client_id}&page=2&nbitem=50
```

## 📝 Pseudo-code d'implémentation

```javascript
// Étape 1 : Lister les commandes
async function listerCommandes(clientId) {
    const response = await fetch(
        `/v1/pieces?types=commande&clients=${clientId}&include=client&order=piece.date:desc&nbitem=50`
    );
    return await response.json();
}

// Étape 2 : Sélection utilisateur (interface avec libellé)
function afficherListeCommandes(commandes) {
    commandes.pieces.forEach((cmd, index) => {
        console.log(`${index + 1}. ${cmd.numero} | ${cmd.date} | ${cmd.libelle} | ${cmd.montant_ttc}€ | ${cmd.statut}`);
    });
}

// Étape 3 : Récupérer détails
async function recupererDetailsCommande(pieceId) {
    const response = await fetch(
        `/v1/piece/${pieceId}?include=client,lignes,ligne.article`
    );
    return await response.json();
}
```

## 🎯 Optimisations supplémentaires

**Filtres utiles pour l'étape 1 :**
```http
# Commandes récentes (3 derniers mois)
&date_debut=2024-06-01&date_fin=2024-09-16

# Tri personnalisé
&order=piece.montant_ttc:desc  # Plus cher en premier
&order=piece.numero:asc        # Par numéro croissant
```

**Includes minimaux par étape :**
- Étape 1 : `client` (optionnel)
- Étape 3 : `client,lignes,ligne.article` (complet)