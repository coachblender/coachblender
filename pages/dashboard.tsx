// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'
);

export default function Dashboard() {
  const router = useRouter();
  const { role } = router.query;
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      // Prüfen, ob der Nutzer überhaupt eingeloggt ist
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Sales-Daten laden (PostgreSQL filtert dank RLS automatisch nach der User-ID!)
      const { data: salesData, error } = await supabase
        .from('sales')
        .select('transaction_id, total_amount, system_fee_amount, payout_status, processed_at')
        .order('processed_at', { ascending: false });

      if (!error && salesData) {
        setSales(salesData);
      }
      setLoading(false);
    }

    if (role) fetchDashboardData();
  }, [role]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Lade Auszahlungsdaten...</p>;

  // Berechnungen für die Übersicht
  const totalVolume = sales.reduce((sum, item) => sum + Number(item.total_amount), 0);
  const totalMaut = sales.reduce((sum, item) => sum + Number(item.system_fee_amount), 0);

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Finanz- & Auszahlungsübersicht ({role === 'coach' ? 'Coach' : 'Dienstleister'})</h2>
        <button onClick={handleLogout} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>Logout</button>
      </div>

      {/* KPI-Karten */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, padding: '20px', background: '#f8f9fa', border: '1px solid #ddd' }}>
          <h3>Umsatzvolumen</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{totalVolume.toFixed(2)} €</p>
        </div>
        <div style={{ flex: 1, padding: '20px', background: '#e9ecef', border: '1px solid #ddd' }}>
          <h3>{role === 'coach' ? 'Verbuchte 5%-Maut' : 'Deine Provision'}</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', margin: 0 }}>{totalMaut.toFixed(2)} €</p>
        </div>
      </div>

      {/* Transaktions-Tabelle */}
      <h3>Letzte Buchungen</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#343a40', color: '#fff', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Transaktions-ID</th>
            <th style={{ padding: '10px' }}>Betrag</th>
            <th style={{ padding: '10px' }}>Maut (5%)</th>
            <th style={{ padding: '10px' }}>Status</th>
            <th style={{ padding: '10px' }}>Datum</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.transaction_id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{sale.transaction_id}</td>
              <td style={{ padding: '10px' }}>{Number(sale.total_amount).toFixed(2)} €</td>
              <td style={{ padding: '10px', color: '#28a745', fontWeight: 'bold' }}>{Number(sale.system_fee_amount).toFixed(2)} €</td>
              <td style={{ padding: '10px' }}>
                <span style={{ padding: '3px 8px', background: sale.payout_status === 'paid' ? '#d4edda' : '#fff3cd', color: sale.payout_status === 'paid' ? '#155724' : '#856404', borderRadius: '3px', fontSize: '12px' }}>
                  {sale.payout_status}
                </span>
              </td>
              <td style={{ padding: '10px' }}>{new Date(sale.processed_at).toLocaleDateString('de-DE')}</td>
            </tr>
          ))}
          {sales.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>Noch keine Transaktionen erfasst.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
