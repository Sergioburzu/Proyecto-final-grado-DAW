import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.png';

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconClose = ({ size = 5 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-${size} h-${size}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconCart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const IconMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const IconFavorites = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);


export default function Navbar({ onCartOpen }) {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/');
    closeMobile();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchVal)}`);
    setSearchOpen(false);
    setSearchVal('');
    closeMobile();
  };

  return (
    /* position:relative needed so the absolute mobile menu is relative to the nav */
    <nav className="sticky top-0 z-50 bg-base/85 backdrop-blur-xl border-b border-border shadow-[0_1px_0_rgba(185,28,28,0.05)] relative">

      {/* ── Desktop bar ── */}
      <div className="max-w-7xl mx-auto px-6 flex items-center h-[4.5rem] gap-6">

        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center no-underline" onClick={closeMobile}>
          <img src={logoImg} alt="SNEAK-OUT" className="h-[3.2rem] w-auto object-contain" />
        </Link>

        {/* Nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium flex-1 justify-center">
          <Link to="/" className="nav-link text-primary">Inicio</Link>
          <Link to="/?section=catalogo" className="nav-link">Catálogo</Link>
          <Link to="/contacto" className="nav-link">Contacto</Link>
          {isAdmin && (
            <Link to="/admin" className="text-accent font-bold no-underline hover:text-accent-hover transition-colors">
              Admin ⚡
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 ml-auto">

          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Buscar..."
                className="w-44 px-3 py-1.5 text-sm rounded-lg bg-surface border border-accent text-primary outline-none"
              />
              <button type="button" onClick={() => setSearchOpen(false)}
                className="bg-transparent border-none cursor-pointer text-secondary hover:text-accent transition-colors p-1">
                <IconClose size={4} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} aria-label="Buscar"
              className="p-2 rounded-full bg-transparent border-none cursor-pointer text-secondary hover:text-accent transition-colors">
              <IconSearch />
            </button>
          )}
        
          {/* Favorites — solo si hay sesión */}
          {user && (
            <Link to="/perfil?tab=favoritos" aria-label="Mis favoritos"
              className="p-2 rounded-full bg-transparent text-secondary hover:text-accent transition-colors">
              <IconFavorites />
            </Link>
          )}

          {/* Cart */}
          <button onClick={onCartOpen} aria-label="Abrir carrito"
            className="relative p-2 rounded-full bg-transparent border-none cursor-pointer text-secondary hover:text-accent transition-colors">
            <IconCart />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-white text-[0.6rem] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {itemCount}
              </span>
            )}
          </button>

          {/* Auth — desktop */}
          <div className="hidden md:flex items-center gap-3 ml-1">
            {user ? (
              <>
                <Link
                  to="/perfil"
                  title={`Mi perfil (${user.user_metadata?.name || user.email})`}
                  className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm no-underline hover:bg-accent hover:text-white transition-all duration-200"
                >
                  {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                </Link>
                <button onClick={handleLogout}
                  className="text-xs px-3 py-1.5 rounded-lg bg-raised border border-border text-secondary cursor-pointer transition-all duration-200 hover:border-accent hover:text-accent">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-secondary no-underline hover:text-accent transition-colors">
                  Entrar
                </Link>
                <Link to="/register"
                  className="text-sm px-4 py-1.5 rounded-lg bg-accent text-white font-bold no-underline hover:bg-accent-hover transition-all duration-200">
                  Registro
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Abrir menú"
            className="md:hidden p-2 rounded-lg bg-transparent border-none cursor-pointer text-secondary hover:text-accent transition-colors ml-1">
            {mobileOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu — position:absolute so it overlays, never pushes content ── */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-base/95 backdrop-blur-xl border-b border-border z-50 shadow-xl">
          <div className="px-6 py-5 flex flex-col gap-1">
            <Link to="/" className="nav-link text-primary font-medium text-sm py-3 border-b border-border" onClick={closeMobile}>
              Inicio
            </Link>
            <Link to="/?section=catalogo" className="nav-link text-sm py-3 border-b border-border" onClick={closeMobile}>
              Catálogo
            </Link>
            <Link to="/contacto" className="nav-link text-sm py-3 border-b border-border" onClick={closeMobile}>
              Contacto
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-accent font-bold no-underline text-sm py-3 border-b border-border" onClick={closeMobile}>
                Admin ⚡
              </Link>
            )}

            {/* Auth — mobile */}
            <div className="pt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <Link to="/perfil" onClick={closeMobile} className="flex items-center gap-2 no-underline group">
                    <span className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm group-hover:bg-accent group-hover:text-white transition-all duration-200">
                      {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span className="text-xs text-secondary group-hover:text-accent transition-colors">
                      {user.user_metadata?.name || user.email?.split('@')[0]}
                    </span>
                  </Link>
                  <button onClick={handleLogout}
                    className="text-xs px-3 py-1.5 rounded-lg bg-raised border border-border text-secondary cursor-pointer hover:border-accent hover:text-accent transition-all duration-200">
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" onClick={closeMobile}
                    className="flex-1 text-center text-sm py-2 rounded-lg border border-border text-secondary no-underline hover:border-accent hover:text-accent transition-all duration-200">
                    Entrar
                  </Link>
                  <Link to="/register" onClick={closeMobile}
                    className="flex-1 text-center text-sm py-2 rounded-lg bg-accent text-white font-bold no-underline hover:bg-accent-hover transition-all duration-200">
                    Registro
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
