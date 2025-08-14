const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wsrcjuknxapuxifhdrfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcmNqdWtueGFwdXhpZmhkcmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTA4MDIsImV4cCI6MjA2ODIyNjgwMn0.pPZ7r7cA5nlOXeUlPAHih89zIUJE8nJc42P-qydtmaU'
);

async function checkProduitStatuses() {
  console.log('=== Vérification des statuts de produits ===');

  const { data, error } = await supabase
    .from('commande_produits')
    .select('statut')
    .limit(20);

  if (error) {
    console.error('Erreur:', error);
  } else {
    console.log('Statuts existants dans commande_produits:');
    const uniqueStatuts = [...new Set(data.map(item => item.statut))];
    uniqueStatuts.forEach(statut => console.log('-', statut));
  }
}

checkProduitStatuses().then(() => process.exit(0));
