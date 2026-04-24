import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getOrders, getFavorites } from '../services/api';
import toast from 'react-hot-toast';

const statusLabels = {
  paid: { label: 'Pagado', color: 'text-green-600  bg-green-100' }
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'datos');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);

  if (!user) return null;

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario';
  const userEmail = user.email;
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = user.user_metadata?.role || 'usuario';
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  useEffect(() => {
    if (activeTab === 'pedidos') {
      setOrdersLoading(true);
      getOrders()
        .then(({ data }) => setOrders(data || []))
        .catch(() => toast.error('Error al cargar los pedidos'))
        .finally(() => setOrdersLoading(false));
    } else if (activeTab === 'favoritos') {
      setFavLoading(true);
      getFavorites()
        .then(({ data }) => setFavorites(data || []))
        .catch(() => toast.error('Error al cargar los favoritos'))
        .finally(() => setFavLoading(false));
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  const navItems = [
    { id: 'datos', label: 'Mis Datos', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
    { id: 'pedidos', label: 'Mis Pedidos', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> },
    { id: 'favoritos', label: 'Mis Favoritos', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /> },
  ];

  return (
    <div className="min-h-screen bg-base py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">

          {/* ── Sidebar ── */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-raised border border-border rounded-2xl p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xl">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-primary truncate">{userName}</h1>
                  <p className="text-xs text-muted truncate" title={userEmail}>{userEmail}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map(({ id, label, icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === id ? 'bg-accent text-white shadow-md' : 'text-secondary hover:bg-surface'}`}>
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
                      {label}
                    </div>
                  </button>
                ))}

                <div className="h-px bg-border my-2" />

                <button onClick={handleLogout}
                  className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="flex-1">

            {/* DATOS */}
            {activeTab === 'datos' && (
              <div className="bg-raised border border-border p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-primary mb-6">Datos Personales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Nombre', value: userName },
                    { label: 'Email', value: userEmail },
                    { label: 'Rol', value: userRole },
                    { label: 'Miembro desde', value: memberSince },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
                      <span className="text-base text-secondary font-medium break-all">{value}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-8 px-5 py-2.5 bg-transparent border border-accent text-accent rounded-xl text-sm font-semibold hover:bg-accent hover:text-white transition-colors duration-200">
                  Editar Datos
                </button>
              </div>
            )}

            {/* PEDIDOS */}
            {activeTab === 'pedidos' && (
              <div className="bg-raised border border-border p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-primary mb-6">Mis Pedidos</h2>

                {ordersLoading ? (
                  <div className="text-center py-10 text-muted">Cargando pedidos...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-10 text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="mb-4">Aún no has realizado ningún pedido.</p>
                    <button onClick={() => navigate('/?section=catalogo')} className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors">
                      Ir al Catálogo
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {orders.map((order) => {
                      const st = statusLabels[order.status] || statusLabels.pending;
                      return (
                        <div key={order.id} className="border border-border rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div>
                              <span className="text-xs text-muted">Pedido #</span>
                              <span className="text-xs font-mono text-secondary">{order.id}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted">
                                {order.created_at ? (
                                  new Date(order.created_at).toLocaleString('es-ES', {
                                    weekday: 'long',
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                  })
                                ) : "Fecha no disponible"}
                              </span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.color}`}>
                                {st.label}
                              </span>
                            </div>
                          </div>

                          {/* Productos del pedido */}
                          <div className="flex flex-col gap-2 mb-3">
                            {(order.order_items || []).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                {item.products?.image_url && (
                                  <img src={item.products.image_url} alt={item.products?.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-border shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-secondary font-medium truncate">{item.products?.name || `Producto #${item.product_id}`}</p>
                                  <p className="text-xs text-muted">x{item.quantity} · {Number(item.unit_price).toFixed(2)}€ ud.</p>
                                </div>
                                <span className="text-sm font-bold text-accent shrink-0">
                                  {(item.quantity * item.unit_price).toFixed(2)}€
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-border">
                            <span className="text-xs text-muted">Envío a: {order.shipping_city}, {order.shipping_zip}</span>
                            <span className="text-base font-black text-primary">{Number(order.total).toFixed(2)}€</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* FAVORITOS */}
            {activeTab === 'favoritos' && (
              <div className="bg-raised border border-border p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-primary mb-4">Mis Favoritos</h2>
                
                {favLoading ? (
                  <div className="text-center py-10 text-muted">Cargando favoritos...</div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-10 text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p className="mb-4">No tienes productos favoritos guardados.</p>
                    <button onClick={() => navigate('/?section=catalogo')} className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors">
                      Descubrir Productos
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {favorites.map((fav) => {
                      const p = fav.products;
                      if (!p) return null;
                      return (
                        <div key={fav.id} onClick={() => navigate(`/producto/${p.id}`)} className="cursor-pointer border border-border rounded-xl p-3 hover:border-accent transition-colors bg-surface group relative">
                          <div className="aspect-square bg-raised rounded-lg mb-3 overflow-hidden">
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <p className="text-accent text-[0.65rem] font-bold tracking-widest uppercase mb-1">{p.brand}</p>
                          <p className="text-sm font-bold text-primary truncate mb-1">{p.name}</p>
                          <p className="text-sm font-black text-secondary">{Number(p.price).toFixed(2)}€</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
