'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

type CodeItem = {
  code: string;
  business: string;
  link: string;
  status: string;
  scanCount: number;
};

export default function AdminPage() {
  const [domain, setDomain] = useState('');
  const [items, setItems] = useState<CodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState('');
  const [creating, setCreating] = useState(false);
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});
  const [savingCode, setSavingCode] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [settingsRes, codesRes] = await Promise.all([
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/codes').then((r) => r.json()),
      ]);
      setDomain(settingsRes.domain || '');
      const codes: CodeItem[] = codesRes.codes || [];
      setItems(codes);
      const drafts: Record<string, string> = {};
      codes.forEach((c) => (drafts[c.code] = c.link || ''));
      setLinkDrafts(drafts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function createCode() {
    setCreating(true);
    try {
      const res = await fetch('/api/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business }),
      });
      if (!res.ok) throw new Error('No se pudo crear el código');
      setBusiness('');
      await loadAll();
    } catch (e) {
      alert('Error al generar el código. Probá de nuevo.');
    } finally {
      setCreating(false);
    }
  }

  async function saveLink(code: string) {
    setSavingCode(code);
    try {
      const res = await fetch(`/api/codes/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: linkDrafts[code] || '' }),
      });
      if (!res.ok) throw new Error('No se pudo guardar');
      await loadAll();
    } catch (e) {
      alert('No se pudo guardar el link. Probá de nuevo.');
    } finally {
      setSavingCode(null);
    }
  }

  async function deleteCode(code: string) {
    if (!confirm(`¿Eliminar el cartel ${code}? No se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/codes/${code}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar');
      await loadAll();
    } catch (e) {
      alert('No se pudo eliminar el cartel.');
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 60px' }}>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Tus carteles</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 28, maxWidth: 560, lineHeight: 1.5 }}>
        Generá un código, imprimí el cartel, y cuando el cliente lo reciba cargale el link de reseña de Google.
      </p>

      {!domain && (
        <div style={{ background: '#FBEAE3', border: '1px solid var(--red)', borderRadius: 4, padding: '10px 14px', marginBottom: 20, fontSize: 13.5 }}>
          Todavía no configuraste <code>NEXT_PUBLIC_SITE_DOMAIN</code> en las variables de entorno. Los QR van a
          apuntar a una URL vacía hasta que lo configures.
        </div>
      )}

      <div style={card}>
        <h2 style={cardTitle}>Nuevo cartel</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={label}>Nombre del comercio (opcional)</label>
            <input
              type="text"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="Ej: Panadería San Martín"
            />
          </div>
          <button
            onClick={createCode}
            disabled={creating}
            style={{ background: 'var(--yellow)', color: '#3D2E00' }}
          >
            {creating ? 'Generando…' : 'Generar código QR'}
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: 15, margin: '24px 0 14px' }}>
        Códigos generados {items.length > 0 && <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({items.length})</span>}
      </h2>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Cargando…</p>
      ) : items.length === 0 ? (
        <div style={emptyBox}>Todavía no generaste ningún cartel. Creá el primero arriba.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 18 }}>
          {items.map((item) => (
            <LabelCard
              key={item.code}
              item={item}
              domain={domain}
              draft={linkDrafts[item.code] ?? ''}
              onDraftChange={(v) => setLinkDrafts((d) => ({ ...d, [item.code]: v }))}
              onSave={() => saveLink(item.code)}
              onDelete={() => deleteCode(item.code)}
              saving={savingCode === item.code}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LabelCard({
  item,
  domain,
  draft,
  onDraftChange,
  onSave,
  onDelete,
  saving,
}: {
  item: CodeItem;
  domain: string;
  draft: string;
  onDraftChange: (v: string) => void;
  onSave: () => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetUrl = `${domain}/r/${item.code}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, targetUrl, { width: 160, margin: 1, color: { dark: '#14181C' } });
    }
  }, [targetUrl]);

  function downloadQr() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `qr-${item.code}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  }

  return (
    <div style={{ position: 'relative', background: '#fff', border: '1.5px dashed #B9BEC4', borderRadius: 4, padding: '18px 16px 16px' }}>
      <span
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          fontSize: 10,
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 3,
          border: '1.5px solid currentColor',
          color: item.status === 'active' ? 'var(--green)' : 'var(--red)',
          background: item.status === 'active' ? 'var(--green-dim)' : 'var(--red-dim)',
        }}
      >
        {item.status === 'active' ? 'ACTIVO' : 'PENDIENTE'}
      </span>

      <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 88, height: 88, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <canvas ref={canvasRef} style={{ width: 80, height: 80 }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700 }}>{item.code}</div>
          <div style={{ fontSize: 13.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.business}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 10.5, color: 'var(--muted)', marginTop: 6, wordBreak: 'break-all' }}>
            {targetUrl}
          </div>
        </div>
      </div>

      <label style={label}>Link de reseña de Google</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="https://g.page/r/..."
          style={{ fontSize: 12.5, padding: '8px 10px' }}
        />
        <button onClick={onSave} disabled={saving} style={{ background: 'transparent', border: '1px solid var(--line)', fontSize: 12.5, padding: '7px 12px' }}>
          {saving ? '…' : 'Guardar'}
        </button>
      </div>

      <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
        {item.scanCount} escaneo{item.scanCount === 1 ? '' : 's'} registrado{item.scanCount === 1 ? '' : 's'}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={downloadQr} style={smallBtn}>Descargar QR</button>
        <button
          onClick={() => navigator.clipboard.writeText(targetUrl)}
          style={smallBtn}
        >
          Copiar link
        </button>
        <button onClick={onDelete} style={{ ...smallBtn, color: 'var(--red)' }}>Eliminar</button>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 4, padding: '22px 24px', marginBottom: 22 };
const cardTitle: React.CSSProperties = { fontSize: 14, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 14 };
const label: React.CSSProperties = { display: 'block', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 6 };
const emptyBox: React.CSSProperties = { padding: '36px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14, border: '1.5px dashed var(--line)', borderRadius: 4 };
const smallBtn: React.CSSProperties = { background: 'transparent', border: '1px solid var(--line)', fontSize: 12.5, padding: '7px 12px' };
