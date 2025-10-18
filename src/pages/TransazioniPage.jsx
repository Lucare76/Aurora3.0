import { useEffect, useState, useMemo } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query as fsQuery,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  doc,
} from 'firebase/firestore';

/**
 * TransazioniPage – completa
 * - Categorie/sottocategorie di default
 * - Filtri mese/testo/categoria/sottocategoria + ordinamento
 * - Vista compatta/dettaglio
 * - Modifica in modale, eliminazione con conferma
 * - ➕ Creazione nuova transazione (modale) con campo Importo e Salva
 */

// ✅ Chiavi con caratteri speciali tra virgolette
const CATEGORIE_DEFAULT = {
  Entrate: ['Stipendio', 'Rimborso', 'Vendita', 'Bonus', 'Interessi'],
  Casa: ['Affitto/Mutuo', 'Bollette', 'Manutenzione', 'Arredo'],
  Trasporti: ['Carburante', 'Assicurazione', 'Treno/Bus', 'Pedaggi', 'Parcheggio'],
  Spesa: ['Supermercato', 'Ortofrutta', 'Alimentari'],
  Ristorazione: ['Pranzo', 'Cena', 'Bar/Caffè', 'Delivery'],
  Intrattenimento: ['Cinema', 'Concerti/Eventi', 'Abbonamenti Streaming', 'Libri/Giochi'],
  Salute: ['Farmacia', 'Visite', 'Palestra', 'Integratori'],
  Personale: ['Abbigliamento', 'Cura Persona', 'Parrucchiere/Barbiere'],
  Viaggi: ['Hotel', 'Volo/Treno', 'Ristoranti', 'Attività'],
  'Utenze/Servizi': ['Telefonia/Internet', 'Assicurazioni', 'Software/SaaS'],
  Tasse: ['Imposte', 'Bolli'],
  Altro: ['Varie'],
};

const Select = ({ label, value, onChange, children, id, style }) => (
  <div style={{ minWidth: 200 }}>
    {label && (
      <label htmlFor={id} style={{ display: 'block', marginBottom: '0.25rem' }}>
        {label}
      </label>
    )}
    <select
      id={id}
      value={value}
      onChange={onChange}
      style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', width: '100%', ...(style || {}) }}
    >
      {children}
    </select>
  </div>
);

const Input = ({ label, type = 'text', value, onChange, id, placeholder, style, step }) => (
  <div>
    {label && (
      <label htmlFor={id} style={{ display: 'block', marginBottom: '0.25rem' }}>
        {label}
      </label>
    )}
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', width: '100%', ...(style || {}) }}
    />
  </div>
);

const Badge = ({ children, color = '#eef2ff', textColor = '#1f3a93' }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '0.2rem 0.5rem',
      borderRadius: 999,
      backgroundColor: color,
      color: textColor,
      fontSize: '0.8rem',
      fontWeight: 600,
    }}
  >
    {children}
  </span>
);

const Modal = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', width: 'min(760px, 92vw)', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
      >
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} aria-label="Chiudi" style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '1rem 1.25rem' }}>{children}</div>
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #eee', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {footer}
        </div>
      </div>
    </div>
  );
};

const TransazioniPage = () => {
  const [transazioni, setTransazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroMese, setFiltroMese] = useState('');
  const [queryTesto, setQueryTesto] = useState('');
  const [ordinaPer, setOrdinaPer] = useState('data');
  const [vistaCompatta, setVistaCompatta] = useState(false);

  // Filtri aggiuntivi
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroSottocategoria, setFiltroSottocategoria] = useState('');

  // Modali
  const [editing, setEditing] = useState(null); // { id, ...fields }
  const [creating, setCreating] = useState(false);
  const [nuova, setNuova] = useState(() => ({
    data: new Date().toISOString().slice(0,10),
    categoria: 'Altro',
    sottocategoria: '',
    descrizione: '',
    importo: ''
  }));
  const [saving, setSaving] = useState(false);

  // Caricamento dati
  useEffect(() => {
    const caricaTransazioni = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Utente non autenticato');
          setLoading(false);
          return;
        }

        const q = fsQuery(collection(db, 'transazioni'), where('utente', '==', user.uid));
        const snapshot = await getDocs(q);

        const lista = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            data: data.data || '', // atteso formato YYYY-MM-DD
            categoria: data.categoria || 'Altro',
            sottocategoria: data.sottocategoria || '',
            descrizione: data.descrizione || '',
            importo: typeof data.importo === 'number' ? data.importo : Number(data.importo || 0),
          };
        });

        setTransazioni(lista);
        setError(null);
      } catch (err) {
        console.error('Errore nel caricamento delle transazioni:', err);
        setError('Impossibile caricare le transazioni. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    caricaTransazioni();
  }, []);

  // Filtri e ordinamento
  const filtrate = useMemo(() => {
    let risultato = transazioni;

    if (filtroMese) risultato = risultato.filter((t) => t.data?.startsWith(filtroMese));
    if (filtroCategoria) risultato = risultato.filter((t) => (t.categoria || 'Altro') === filtroCategoria);
    if (filtroSottocategoria) risultato = risultato.filter((t) => (t.sottocategoria || '') === filtroSottocategoria);

    if (queryTesto) {
      const termine = queryTesto.toLowerCase();
      risultato = risultato.filter((t) =>
        t.descrizione?.toLowerCase().includes(termine) ||
        (t.categoria || '').toLowerCase().includes(termine) ||
        (t.sottocategoria || '').toLowerCase().includes(termine)
      );
    }

    return [...risultato].sort((a, b) => {
      if (ordinaPer === 'data') return new Date(b.data) - new Date(a.data);
      if (ordinaPer === 'importo') return Math.abs(b.importo) - Math.abs(a.importo);
      if (ordinaPer === 'categoria') return (a.categoria || '').localeCompare(b.categoria || '');
      return 0;
    });
  }, [transazioni, filtroMese, filtroCategoria, filtroSottocategoria, queryTesto, ordinaPer]);

  // Totali
  const { totaleEntrate, totaleUscite } = useMemo(() => {
    let entrate = 0; let uscite = 0;
    filtrate.forEach((t) => { if (t.importo > 0) entrate += t.importo; else uscite += Math.abs(t.importo); });
    return { totaleEntrate: entrate, totaleUscite: uscite };
  }, [filtrate]);

  const formattaData = (dataString) => {
    if (!dataString) return 'Data non disponibile';
    const [anno, mese, giorno] = dataString.split('-');
    const dt = new Date(anno, (mese || 1) - 1, giorno || 1);
    return isNaN(dt.getTime()) ? dataString : dt.toLocaleDateString('it-IT');
  };

  const resetFiltri = () => {
    setFiltroMese('');
    setFiltroCategoria('');
    setFiltroSottocategoria('');
    setQueryTesto('');
    setOrdinaPer('data');
  };

  // Azioni: modifica / elimina / crea
  const apriModifica = (t) => setEditing({ ...t });
  const chiudiModifica = () => setEditing(null);

  const salvaModifica = async () => {
    if (!editing?.id) return;
    setSaving(true);
    try {
      const ref = doc(db, 'transazioni', editing.id);
      const sottocategoriaPulita = editing.sottocategoria === '__ALTRO__' ? (editing.__sottoLibera || '') : (editing.sottocategoria || '');
      const payload = {
        data: editing.data || '',
        categoria: editing.categoria || 'Altro',
        sottocategoria: sottocategoriaPulita,
        descrizione: editing.descrizione || '',
        importo: Number(parseFloat(editing.importo) || 0),
      };
      await updateDoc(ref, payload);
      setTransazioni((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...payload } : x)));
      chiudiModifica();
    } catch (e) {
      console.error('Errore salvataggio:', e);
      alert('Impossibile salvare le modifiche.');
    } finally { setSaving(false); }
  };

  const eliminaTransazione = async (t) => {
    const conferma = window.confirm(`Eliminare definitivamente la transazione "${t.descrizione || t.categoria}" del ${formattaData(t.data)}?`);
    if (!conferma) return;
    try {
      await deleteDoc(doc(db, 'transazioni', t.id));
      setTransazioni((prev) => prev.filter((x) => x.id !== t.id));
    } catch (e) {
      console.error('Errore eliminazione:', e);
      alert('Impossibile eliminare la transazione.');
    }
  };

  const apriNuova = () => {
    setNuova({ data: new Date().toISOString().slice(0,10), categoria: 'Altro', sottocategoria: '', descrizione: '', importo: '' });
    setCreating(true);
  };
  const chiudiNuova = () => setCreating(false);

  const salvaNuova = async () => {
    const user = auth.currentUser;
    if (!user) return alert('Utente non autenticato');
    const imp = Number(parseFloat(nuova.importo));
    if (!isFinite(imp) || imp === 0) return alert('Inserisci un importo valido (positivo o negativo).');
    setSaving(true);
    try {
      const payload = {
        utente: user.uid,
        data: nuova.data || new Date().toISOString().slice(0,10),
        categoria: nuova.categoria || 'Altro',
        sottocategoria: nuova.sottocategoria === '__ALTRO__' ? (nuova.__sottoLibera || '') : (nuova.sottocategoria || ''),
        descrizione: nuova.descrizione || '',
        importo: imp,
        createdAt: new Date().toISOString(),
      };
      const ref = await addDoc(collection(db, 'transazioni'), payload);
      setTransazioni((prev) => [{ id: ref.id, ...payload }, ...prev]);
      setCreating(false);
    } catch (e) {
      console.error('Errore creazione:', e);
      alert('Impossibile salvare la transazione.');
    } finally { setSaving(false); }
  };

  // Opzioni select
  const categorieOptions = Object.keys(CATEGORIE_DEFAULT);
  const sottocategorieFor = (cat) => CATEGORIE_DEFAULT[cat] || [];

  if (loading) return (<div style={{ padding: '2rem', textAlign: 'center' }}><p>Caricamento transazioni...</p></div>);
  if (error) return (
    <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>
      <p>⚠️ {error}</p>
      <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Riprova</button>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.25rem' }}>💸 Le Tue Transazioni</h2>

      {/* Filtri */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <div>
          <label htmlFor="filtro-mese" style={{ display: 'block', marginBottom: '0.25rem' }}>Mese:</label>
          <input id="filtro-mese" type="month" value={filtroMese} onChange={(e) => setFiltroMese(e.target.value)} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }} />
        </div>

        <div style={{ flex: '1 1 260px' }}>
          <label htmlFor="cerca-transazioni" style={{ display: 'block', marginBottom: '0.25rem' }}>🔍 Cerca (categoria, descrizione, sottocategoria):</label>
          <input id="cerca-transazioni" type="text" placeholder="Es. Supermercato, Stipendio..." value={queryTesto} onChange={(e) => setQueryTesto(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }} />
        </div>

        <Select label="Categoria" id="filtro-categoria" value={filtroCategoria} onChange={(e) => { setFiltroCategoria(e.target.value); setFiltroSottocategoria(''); }}>
          <option value="">Tutte</option>
          {categorieOptions.map((c) => (<option key={c} value={c}>{c}</option>))}
        </Select>

        <Select label="Sottocategoria" id="filtro-sottocategoria" value={filtroSottocategoria} onChange={(e) => setFiltroSottocategoria(e.target.value)}>
          <option value="">Tutte</option>
          {(filtroCategoria ? sottocategorieFor(filtroCategoria) : categorieOptions.flatMap((c) => sottocategorieFor(c))).map((s) => (<option key={s} value={s}>{s}</option>))}
        </Select>

        <Select label="Ordina per:" id="ordina-per" value={ordinaPer} onChange={(e) => setOrdinaPer(e.target.value)}>
          <option value="data">Data (più recente)</option>
          <option value="importo">Importo (decrescente)</option>
          <option value="categoria">Categoria (A-Z)</option>
        </Select>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setVistaCompatta((v) => !v)} style={{ padding: '0.6rem 1rem', backgroundColor: vistaCompatta ? '#4CAF50' : '#2196F3', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{vistaCompatta ? 'Dettagli' : 'Compatto'}</button>
          <button onClick={resetFiltri} style={{ padding: '0.6rem 0.9rem', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Reset</button>
          <button onClick={() => apriNuova()} style={{ padding: '0.6rem 0.9rem', backgroundColor: '#155eef', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>➕ Nuova</button>
        </div>
      </div>

      {/* Totali */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#eef7ee', borderRadius: 8 }}>
        <div>
          <p style={{ margin: 0, color: '#2e7d32' }}>Entrate</p>
          <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>€{totaleEntrate.toFixed(2)}</p>
        </div>
        <div>
          <p style={{ margin: 0, color: '#c62828' }}>Uscite</p>
          <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>€{totaleUscite.toFixed(2)}</p>
        </div>
        <div>
          <p style={{ margin: 0 }}>Saldo</p>
          <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: totaleEntrate - totaleUscite >= 0 ? '#2e7d32' : '#c62828' }}>€{(totaleEntrate - totaleUscite).toFixed(2)}</p>
        </div>
      </div>

      {/* Lista transazioni */}
      {filtrate.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Nessuna transazione trovata con i filtri selezionati.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtrate.map((t) => (
            <li key={t.id} style={{ padding: '0.9rem 1rem', backgroundColor: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${t.importo > 0 ? '#4CAF50' : '#F44336'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ color: '#333' }}>{t.categoria || 'Altro'}</strong>
                    {t.sottocategoria && <Badge>{t.sottocategoria}</Badge>}
                    {!vistaCompatta && (<Badge color="#f1f1f1" textColor="#666">{formattaData(t.data)}</Badge>)}
                  </div>
                  {!vistaCompatta && t.descrizione && (
                    <div style={{ color: '#666', fontSize: '0.92rem', marginTop: '0.25rem', wordBreak: 'break-word' }}>{t.descrizione}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontWeight: 800, color: t.importo > 0 ? '#2e7d32' : '#c62828', whiteSpace: 'nowrap' }}>€{Math.abs(t.importo).toFixed(2)} {t.importo > 0 ? '(+)' : '(-)'}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => apriModifica(t)} style={{ padding: '0.45rem 0.75rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Modifica</button>
                    <button onClick={() => eliminaTransazione(t)} style={{ padding: '0.45rem 0.75rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Elimina</button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal Modifica */}
      <Modal open={!!editing} title="Modifica transazione" onClose={saving ? undefined : chiudiModifica} footer={<>
        <button onClick={chiudiModifica} disabled={saving} style={{ padding: '0.6rem 0.9rem', borderRadius: 8, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Annulla</button>
        <button onClick={salvaModifica} disabled={saving} style={{ padding: '0.6rem 0.9rem', borderRadius: 8, border: 'none', background: '#2e7d32', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>{saving ? 'Salvataggio…' : 'Salva'}</button>
      </>}>
        {editing && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            <Input label="Data" id="edit-data" type="date" value={editing.data || ''} onChange={(e) => setEditing((prev) => ({ ...prev, data: e.target.value }))} />
            <Select label="Categoria" id="edit-categoria" value={editing.categoria || 'Altro'} onChange={(e) => {
              const nuovaCat = e.target.value; const sottos = sottocategorieFor(nuovaCat);
              setEditing((prev) => ({ ...prev, categoria: nuovaCat, sottocategoria: sottos.includes(prev?.sottocategoria) ? prev.sottocategoria : '' }));
            }}>
              {categorieOptions.map((c) => (<option key={c} value={c}>{c}</option>))}
            </Select>
            <Select label="Sottocategoria" id="edit-sottocategoria" value={editing.sottocategoria || ''} onChange={(e) => setEditing((prev) => ({ ...prev, sottocategoria: e.target.value }))}>
              <option value="">— Nessuna —</option>
              {sottocategorieFor(editing.categoria || 'Altro').map((s) => (<option key={s} value={s}>{s}</option>))}
              <option value="__ALTRO__">Altro… (campo libero)</option>
            </Select>
            {editing.sottocategoria === '__ALTRO__' && (
              <Input label="Sottocategoria personalizzata" id="edit-sottocategoria-libera" value={editing.__sottoLibera || ''} onChange={(e) => setEditing((prev) => ({ ...prev, __sottoLibera: e.target.value }))} placeholder="Es. Abbonamento palestra" />
            )}
            <Input label="Descrizione" id="edit-descrizione" value={editing.descrizione || ''} onChange={(e) => setEditing((prev) => ({ ...prev, descrizione: e.target.value }))} placeholder="Dettaglio opzionale" />
            <Input label="Importo (€)" id="edit-importo" type="number" step="0.01" value={editing.importo} onChange={(e) => setEditing((prev) => ({ ...prev, importo: e.target.value }))} placeholder="Positivo = entrata, Negativo = uscita" />
          </div>
        )}
      </Modal>

      {/* Modal Nuova */}
      <Modal open={creating} title="Nuova transazione" onClose={saving ? undefined : chiudiNuova} footer={<>
        <button onClick={chiudiNuova} disabled={saving} style={{ padding: '0.6rem 0.9rem', borderRadius: 8, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Annulla</button>
        <button onClick={salvaNuova} disabled={saving} style={{ padding: '0.6rem 0.9rem', borderRadius: 8, border: 'none', background: '#2e7d32', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>{saving ? 'Salvataggio…' : 'Salva'}</button>
      </>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          <Input label="Data" id="new-data" type="date" value={nuova.data} onChange={(e) => setNuova((prev) => ({ ...prev, data: e.target.value }))} />
          <Select label="Categoria" id="new-categoria" value={nuova.categoria} onChange={(e) => {
            const cat = e.target.value; const sottos = sottocategorieFor(cat);
            setNuova((prev) => ({ ...prev, categoria: cat, sottocategoria: sottos.includes(prev?.sottocategoria) ? prev.sottocategoria : '' }));
          }}>
            {categorieOptions.map((c) => (<option key={c} value={c}>{c}</option>))}
          </Select>
          <Select label="Sottocategoria" id="new-sottocategoria" value={nuova.sottocategoria || ''} onChange={(e) => setNuova((prev) => ({ ...prev, sottocategoria: e.target.value }))}>
            <option value="">— Nessuna —</option>
            {sottocategorieFor(nuova.categoria || 'Altro').map((s) => (<option key={s} value={s}>{s}</option>))}
            <option value="__ALTRO__">Altro… (campo libero)</option>
          </Select>
          {nuova.sottocategoria === '__ALTRO__' && (
            <Input label="Sottocategoria personalizzata" id="new-sottocategoria-libera" value={nuova.__sottoLibera || ''} onChange={(e) => setNuova((prev) => ({ ...prev, __sottoLibera: e.target.value }))} placeholder="Es. Abbonamento palestra" />
          )}
          <Input label="Descrizione" id="new-descrizione" value={nuova.descrizione} onChange={(e) => setNuova((prev) => ({ ...prev, descrizione: e.target.value }))} placeholder="Dettaglio opzionale" />
          <Input label="Importo (€)" id="new-importo" type="number" step="0.01" value={nuova.importo} onChange={(e) => setNuova((prev) => ({ ...prev, importo: e.target.value }))} placeholder="Positivo = entrata, Negativo = uscita" />
        </div>
      </Modal>
    </div>
  );
};

export default TransazioniPage;
