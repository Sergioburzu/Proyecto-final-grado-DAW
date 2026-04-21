import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', brand: '', description: '', price: '', size: '', image_url: '', stock: '',
};

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      brand: product.brand,
      description: product.description || '',
      price: product.price,
      size: product.size,
      image_url: product.image_url || '',
      stock: product.stock,
    });
    setEditId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await deleteProduct(id);
      toast.success('Producto eliminado');
      fetchProducts();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await updateProduct(editId, form);
        toast.success('Producto actualizado');
      } else {
        await createProduct(form);
        toast.success('Producto creado');
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>Panel Admin</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Gestión del catálogo de productos</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              background: 'var(--accent)', color: '#000',
              fontWeight: 700, fontSize: '0.875rem',
              borderRadius: '0.75rem', border: 'none',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.1rem', height: '1.1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nuevo Producto
          </button>
        </div>

        {/* Product Form */}
        {showForm && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid #1f1f1f',
            borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '2rem',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>{editId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {[
                  { id: 'p-name', label: 'Nombre', name: 'name', placeholder: 'Air Max 90', type: 'text' },
                  { id: 'p-brand', label: 'Marca', name: 'brand', placeholder: 'Nike', type: 'text' },
                  { id: 'p-price', label: 'Precio (€)', name: 'price', placeholder: '129.99', type: 'number' },
                  { id: 'p-size', label: 'Tallas', name: 'size', placeholder: '40,41,42,43', type: 'text' },
                  { id: 'p-image', label: 'URL Imagen', name: 'image_url', placeholder: 'https://...', type: 'url' },
                  { id: 'p-stock', label: 'Stock', name: 'stock', placeholder: '10', type: 'number' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm text-gray-400 mb-1.5">{field.label}</label>
                    <input
                      id={field.id}
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.name !== 'image_url' && field.name !== 'description'}
                      style={{
                        width: '100%', padding: '0.625rem 1rem',
                        borderRadius: '0.75rem',
                        background: 'var(--bg-raised)', border: '1.5px solid #2a2a2a',
                        color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
                        boxSizing: 'border-box', transition: 'border-color 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                      onBlur={e => { e.target.style.borderColor = '#2a2a2a'; }}
                    />
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1.5">Descripción</label>
                <textarea
                  id="p-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Descripción del producto..."
                  rows={3}
                  style={{
                    width: '100%', padding: '0.625rem 1rem',
                    borderRadius: '0.75rem',
                    background: 'var(--bg-raised)', border: '1.5px solid #2a2a2a',
                    color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
                    boxSizing: 'border-box', resize: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                  onBlur={e => { e.target.style.borderColor = '#2a2a2a'; }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={saving} style={{
                  padding: '0.625rem 1.5rem',
                  background: saving ? '#cc5500' : '#FF6A00', color: '#000',
                  fontWeight: 700, borderRadius: '0.75rem', border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  opacity: saving ? 0.8 : 1,
                }}
                  onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = 'var(--accent-hover)'; } }}
                  onMouseLeave={e => { if (!saving) { e.currentTarget.style.background = 'var(--accent)'; } }}
                >
                  {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Producto'}
                </button>
                <button type="button" onClick={handleCancel} style={{
                  padding: '0.625rem 1.5rem',
                  background: 'var(--bg-raised)', color: '#a0a0a0',
                  border: '1px solid #2a2a2a', borderRadius: '0.75rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#a0a0a0'; }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="bg-surface-custom border border-color-border-custom rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--color-border)' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderBottomColor: 'var(--color-border)' }}>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-custom uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Producto</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Marca</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-custom uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Precio</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-muted-custom uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image_url || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded-lg" style={{ objectFit: 'contain', background: 'var(--bg-raised)', padding: '2px' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>{product.brand}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)', textShadow: '0 0 6px rgba(255,106,0,0.3)' }}>{Number(product.price).toFixed(2)}€</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.stock <= 5 ? 'bg-red-900/40 text-red-300' : 'bg-green-900/40 text-green-300'}`}>
                        {product.stock} uds
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(product)} style={{
                            padding: '0.5rem', borderRadius: '0.5rem',
                            background: 'var(--bg-raised)', border: '1px solid #2a2a2a',
                            color: '#555', cursor: 'pointer', transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#555'; }}
                          title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(product.id)} style={{
                            padding: '0.5rem', borderRadius: '0.5rem',
                            background: 'var(--bg-raised)', border: '1px solid #2a2a2a',
                            color: '#555', cursor: 'pointer', transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#555'; }}
                          title="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
