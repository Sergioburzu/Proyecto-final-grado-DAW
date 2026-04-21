import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.png';

export default function Navbar({ onCartOpen }) {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal]   = useState('');

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchVal)}`);
    setSearchOpen(false);
    setSearchVal('');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(249,246,240,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-border)',
      boxShadow: '0 1px 0 rgba(185,28,28,0.05)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: '4.5rem', gap: '1.5rem' }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <img
            src={logoImg}
            alt="SNEAK-OUT"
            style={{ height: '3.2rem', width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.875rem', fontWeight: 500, flex: 1, justifyContent: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => { e.target.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.target.style.color = 'var(--text-primary)'; }}>
            Inicio
          </Link>
          <Link to="/?section=catalogo" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => { e.target.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.target.style.color = 'var(--text-secondary)'; }}>
            Catálogo
          </Link>
          <Link to="/contacto" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => { e.target.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.target.style.color = 'var(--text-secondary)'; }}>
            Contacto
          </Link>
          {isAdmin && (
            <Link to="/admin" style={{
              color: 'var(--accent)', textDecoration: 'none', fontWeight: 700,
            }}>
              Admin ⚡
            </Link>
          )}
        </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>

          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                autoFocus
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Buscar..."
                style={{
                  width: '11rem', padding: '0.375rem 0.75rem',
                  fontSize: '0.875rem', borderRadius: '0.5rem',
                  background: 'var(--bg-surface)', border: '1px solid var(--accent)',
                  color: 'var(--text-primary)', outline: 'none',
                  boxShadow: '0 0 10px var(--accent-glow2)',
                }}
              />
              <button type="button" onClick={() => setSearchOpen(false)}
                style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} aria-label="Buscar"
              style={{ padding: '0.5rem', borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {/* Cart */}
          <button onClick={onCartOpen} aria-label="Abrir carrito"
            style={{ position: 'relative', padding: '0.5rem', borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {itemCount > 0 && (
              <span style={{
                position: 'absolute', top: '0', right: '0',
                background: 'var(--accent)', color: '#fff',
                fontSize: '0.6rem', fontWeight: 900,
                borderRadius: '50%', width: '1rem', height: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {itemCount}
              </span>
            )}
          </button>


          {/* Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Hola, <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{user.name}</span>
              </span>
              <button onClick={handleLogout}
                style={{
                  fontSize: '0.75rem', padding: '0.375rem 0.75rem',
                  borderRadius: '0.5rem', background: 'var(--bg-raised)',
                  border: '1px solid var(--color-border)', color: 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                Salir
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.25rem' }}>
              <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                Entrar
              </Link>
              <Link to="/register" style={{
                fontSize: '0.875rem', padding: '0.375rem 1rem',
                borderRadius: '0.5rem', background: 'var(--accent)',
                color: '#fff', fontWeight: 700, textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.target.style.background = 'var(--accent-hover)'; }}
                onMouseLeave={e => { e.target.style.background = 'var(--accent)'; }}>
                Registro
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
