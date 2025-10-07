// Script de test pour l'API shipments
const testShipmentAPI = async () => {
  console.log('🧪 Test de l\'API shipments...');
  
  const testData = {
    commande_id: "test-uuid-123", // UUID fictif pour test
    client: "Client Test",
    numero_facture: "TEST-001",
    preparateur: "Test User",
    verificateur: "Test User",
    transporteur: "Chronopost",
    produits: [{
      commande_produit_id: "test-produit-uuid-123",
      quantite_expediee: 1,
      prix_unitaire_ht: 100.00,
      prix_unitaire_ttc: 120.00
    }]
  };

  try {
    const response = await fetch('http://localhost:3001/api/shipments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📡 Status:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Response:', responseText);
    
    if (!response.ok) {
      console.log('❌ Erreur HTTP:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error.message);
  }
};

testShipmentAPI();
