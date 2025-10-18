// src/components/Sidebar.jsx (pro, refined user panel)
import { useEffect, useMemo, useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import './Sidebar.css';

/**
 * Migliorie rispetto alla versione precedente:
 * - Pannello utente nascosto se i dati sono placeholder ("Utente" / "user@example.com") o se non c'è un utente loggato
 * - Tema spostato nel header (niente icona singola sotto il nome)
 * - Quando "collapsed" mostra solo l'avatar (se reale), altrimenti nulla
 * - Possibilità di disattivare completamente il pannello utente con prop
 */

const DEFAULT_LINKS = [
  {
    header: 'Generale',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: '🏠', hotkey: 'd' },
      { to: '/statistiche', label: 'Statistiche', icon: '📊', hotkey: 's' },
      { to: '/transazioni', label: 'Transazioni', icon: '💸', hotkey: 't', badgeKey: 'txPending' },
    ],
  },
  {
    header: 'Finanza',
    items: [
      { to: '/conti', label: 'Conti', icon: '🏦', hotkey: 'o' },
      { to: '/obiettivi', label: 'Obiettivi', icon: '🎯', hotkey: 'b' },
      { to: '/giornaliera', label: 'Info Giornaliera', icon: '📅', hotkey: 'i' },
    ],
  },
  {
    header: 'Sistema',
    items: [
      { to: '/categorie', label: 'Categorie', icon: '🧩', hotkey: 'c' },
      { to: '/impostazioni', label: 'Impostazioni', icon: '⚙️', hotkey: 'p' },
    ],
  },
];

const isPlaceholderUser = (name, email) => {
  const n = (name || '').trim();
  const e = (email || '').trim();
  return (
    !n && !e ||
    n.toLowerCase() === 'utente' ||
    e.toLowerCase() === 'user@example.com'
  );
};

const Sidebar = ({
  sections = DEFAULT_LINKS,
  badges = { txPending: 0 },
  brand = { icon: '🌤️', text: 'Aurora 3.0' },
  user: userProp,
  showUserPanel = true,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [userState, setUserState] = useState(null);
  const location = useLocation();

  // Sync utente da Firebase se disponibile
  useEffect(() => {
    if (userProp) { setUserState(userProp); return; }
    try {
      const u = auth?.currentUser;
      if (u) {
        setUserState({ name: u.displayName || '', email: u.email || '' });
      } else {
        setUserState(null);
      }
    } catch {
      setUserState(null);
    }
  }, [userProp]);

  // ripristina preferenza "compatta"
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved != null) setCollapsed(saved === 'true');
  }, []);

  // salva preferenze
  useEffect(() => { localStorage.setItem('sidebarCollapsed', String(collapsed)); }, [collapsed]);
  useEffect(() => { localStorage.setItem('theme', theme); document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  // chiudi il menu mobile quando cambia rotta
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // NavLink class helper
  const navClass = useMemo(() => ({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`, []);

  // Iniziali utente (solo se non placeholder)
  const initials = useMemo(() => {
    const name = userState?.name || '';
    const email = userState?.email || '';
    if (isPlaceholderUser(name, email)) return '';
    const parts = name.split(' ').filter(Boolean);
    const i = (parts[0]?.[0] || email?.[0] || '').toUpperCase() + (parts[1]?.[0] || '');
    return i || '';
  }, [userState]);

  // Scorciatoie da tastiera: "g" poi lettera
  const [awaitingKey, setAwaitingKey] = useState(false);
  const onKeyDown = useCallback((e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (!awaitingKey && (e.key === 'g' || e.key === 'G')) { setAwaitingKey(true); setTimeout(() => setAwaitingKey(false), 1500); return; }
    if (awaitingKey) {
      const key = e.key.toLowerCase();
      for (const sec of sections) {
        const item = sec.items.find((it) => it.hotkey === key);
        if (item) { window.location.assign(item.to); setAwaitingKey(false); break; }
      }
    }
  }, [awaitingKey, sections]);

  useEffect(() => { window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown); }, [onKeyDown]);

  // Mostrare il pannello utente solo se ha senso
  const showUser = useMemo(() => {
    if (!showUserPanel) return false;
    if (!userState) return false;
    const { name, email } = userState;
    return !isPlaceholderUser(name, email);
  }, [showUserPanel, userState]);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`} aria-label="Navigazione principale">
      {/* Header / Brand + toggles */}
      <div className="sidebar-header">
        <button className="sidebar-mobile-toggle" aria-label="Apri/chiudi menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((v) => !v)}>☰</button>
        <div className="sidebar-brand" title={brand?.text}>
          <span className="brand-icon" aria-hidden>{brand?.icon}</span>
          {!collapsed && <span className="brand-text">{brand?.text}</span>}
        </div>
        <div className="sidebar-header-actions">
          <button className="theme-toggle" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} title="Cambia tema" aria-label="Cambia tema">{theme === 'dark' ? '🌙' : '☀️'}</button>
          <button className="sidebar-collapse-toggle" aria-label={collapsed ? 'Espandi barra laterale' : 'Comprimi barra laterale'} aria-pressed={collapsed} onClick={() => setCollapsed((v) => !v)} title={collapsed ? 'Espandi' : 'Comprimi'}>{collapsed ? '➤' : '⟨⟩'}</button>
        </div>
      </div>

      {/* Pannello utente (solo se non placeholder) */}
      {showUser && (
        <div className="sidebar-user">
          {initials && <div className="user-avatar" aria-hidden>{initials}</div>}
          {!collapsed && (
            <div className="user-meta">
              {userState?.name && <div className="user-name" title={userState.name}>{userState.name}</div>}
              {userState?.email && <div className="user-email" title={userState.email}>{userState.email}</div>}
            </div>
          )}
        </div>
      )}

      {/* Navigazione a sezioni */}
      <nav className="sidebar-nav" role="navigation">
        {sections.map((section) => (
          <div className="sidebar-section" key={section.header}>
            {!collapsed && <div className="sidebar-section-title">{section.header}</div>}
            <ul className="sidebar-list">
              {section.items.map(({ to, label, icon, badgeKey }) => (
                <li key={to} className="sidebar-item">
                  <NavLink to={to} className={navClass} end={to === '/dashboard'} title={collapsed ? label : undefined}>
                    <span className="link-icon" aria-hidden>{icon}</span>
                    {!collapsed && <span className="link-text">{label}</span>}
                    {!collapsed && !!badges?.[badgeKey] && (
                      <span className="link-badge" aria-label={`${badges[badgeKey]} elementi`}>{badges[badgeKey]}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer con azioni rapide */}
      <div className="sidebar-footer">
        <button className="quick-btn" title="Aggiungi transazione (g t)">➕ {!collapsed && <span>Nuova transazione</span>}</button>
        <button className="quick-btn danger" title="Logout">⎋ {!collapsed && <span>Logout</span>}</button>
      </div>
    </aside>
  );
};

export default Sidebar;
