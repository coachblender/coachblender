// pages/index.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>CoachBlender Mautstelle</h1>
      <p>Das geschlossene Tracking-Netzwerk für Instagram-Dienstleister.</p>
      
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <Link href="/login" style={{ padding: '10px 20px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
          Portal Login
        </Link>
        <Link href="/register" style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
          Registrierung
        </Link>
      </div>
    </div>
  );
}
