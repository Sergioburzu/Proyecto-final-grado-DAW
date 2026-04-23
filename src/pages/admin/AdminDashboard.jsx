import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api';
import toast from 'react-hot-toast';

/* ── Icons ─────────────────────────────────────────────────────────────── */
const IconPlus   = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>;
const IconEdit   = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>;
const IconTrash  = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>;
const IconClose  = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>;
const IconBox    = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>;
const IconTag    = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>;
const IconAlert  = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;

/* ── Form default ────────────────────────────────────────────────────── */
const emptyForm = { name: '', brand: '', description: '', price: '', size: '', image_url: '', stock: '' };

/* ── Stat card ───────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub }) {
  return (
    <div className="card p-6 flex items-center gap-5 hover:shadow-lg transition-shadow duration-200">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black text-primary leading-none">{value}</p>
        <p className="text-sm font-semibold text-secondary mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Field wrapper ────────────────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

/* ── Delete confirm modal ─────────────────────────────────────────────── */
function DeleteModal({ product, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="card p-8 max-w-sm w-full shadow-2xl animate-[fadeInUp_0.25s_ease-out]">
        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-4">
          <IconTrash />
        </div>
        <h3 className="text-xl font-black text-primary text-center mb-2">¿Eliminar producto?</h3>
        <p className="text-sm text-secondary text-center mb-6">
          Se eliminará <strong className="text-primary">{product.name}</strong> permanentemente. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-outline py-2.5 text-sm font-semibold">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-black rounded-lg border-none cursor-pointer transition-all duration-200 bg-red-600 text-white hover:bg-red-700 hover:-translate-y-px"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Product modal (create / edit) ────────────────────────────────────── */
function ProductModal({ editId, form, onChange, onSubmit, onClose, saving }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="card p-8 w-full max-w-2xl shadow-2xl my-8 animate-[fadeInUp_0.25s_ease-out]">

        {/* Modal header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-primary">{editId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <p className="text-sm text-secondary mt-0.5">{editId ? 'Modifica los datos del producto' : 'Añade un nuevo producto al catálogo'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-raised border border-border text-secondary hover:text-accent hover:border-accent transition-all duration-200 cursor-pointer">
            <IconClose />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Field label="Nombre del producto">
              <input id="pm-name" type="text" name="name" value={form.name} onChange={onChange}
                required placeholder="Air Max 90" className="input-field" />
            </Field>
            <Field label="Marca">
              <input id="pm-brand" type="text" name="brand" value={form.brand} onChange={onChange}
                required placeholder="Nike" className="input-field" />
            </Field>
            <Field label="Precio (€)">
              <input id="pm-price" type="number" name="price" value={form.price} onChange={onChange}
                required placeholder="129.99" step="0.01" min="0" className="input-field" />
            </Field>
            <Field label="Stock">
              <input id="pm-stock" type="number" name="stock" value={form.stock} onChange={onChange}
                required placeholder="10" min="0" className="input-field" />
            </Field>
            <Field label="Tallas (separadas por comas)">
              <input id="pm-size" type="text" name="size" value={form.size} onChange={onChange}
                placeholder="40, 41, 42, 43, 44" className="input-field" />
            </Field>
            <Field label="URL de imagen">
              <input id="pm-image" type="url" name="image_url" value={form.image_url} onChange={onChange}
                placeholder="https://ejemplo.com/imagen.jpg" className="input-field" />
            </Field>
          </div>

          <Field label="Descripción">
            <textarea id="pm-desc" name="description" value={form.description} onChange={onChange}
              rows={3} placeholder="Describe el producto..."
              className="input-field resize-none" />
          </Field>

          {/* Preview de imagen si hay URL */}
          {form.image_url && (
            <div className="mt-4 p-3 rounded-xl bg-raised border border-border flex items-center gap-3">
              <img src={form.image_url} alt="Preview" className="w-16 h-16 rounded-lg object-contain bg-card border border-border" onError={(e) => { e.target.style.display = 'none'; }} />
              <p className="text-xs text-muted">Vista previa de la imagen</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-outline px-6 py-2.5 text-sm font-semibold flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className={`btn-accent px-6 py-2.5 text-sm flex-1 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main AdminDashboard ─────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useAuth();
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [form, setForm]               = useState(emptyForm);
  const [editId, setEditId]           = useState(null);
  const [saving, setSaving]           = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]           = useState('');

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

  const handleChange  = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name, brand: product.brand,
      description: product.description || '',
      price: product.price, size: product.size || '',
      image_url: product.image_url || '', stock: product.stock,
    });
    setEditId(product.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await updateProduct(editId, form);
        toast.success('Producto actualizado ✓');
      } else {
        await createProduct(form);
        toast.success('Producto creado ✓');
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleteTarget.id);
      toast.success('Producto eliminado');
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast.error('Error al eliminar el producto');
    }
  };

  /* Derived stats */
  const totalProducts = products.length;
  const lowStock      = products.filter(p => p.stock <= 5).length;
  const avgPrice      = totalProducts > 0
    ? (products.reduce((s, p) => s + Number(p.price), 0) / totalProducts).toFixed(2)
    : '0.00';

  /* Filtered list */
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-base py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-black px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
              ⚡ Panel de Administración
            </div>
            <h1 className="text-4xl font-black text-primary leading-tight">Gestión del Catálogo</h1>
            <p className="text-secondary mt-1 text-sm">
              Bienvenido, <span className="text-accent font-semibold">{user?.user_metadata?.name || user?.email}</span>
            </p>
          </div>
          <button id="admin-new-product-btn" onClick={openCreate} className="btn-accent px-5 py-2.5 text-sm shrink-0">
            <IconPlus /> Nuevo Producto
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard icon={<IconBox />}   label="Productos en catálogo" value={totalProducts} sub="Total registrados" />
          <StatCard icon={<IconTag />}   label="Precio medio"          value={`${avgPrice}€`} sub="Media del catálogo" />
          <StatCard icon={<IconAlert />} label="Stock bajo"            value={lowStock}       sub="5 unidades o menos" />
        </div>

        {/* ── Search bar ── */}
        <div className="card p-4 mb-6 flex items-center gap-3">
          <span className="text-muted shrink-0"><IconSearch /></span>
          <input
            id="admin-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o marca..."
            className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-muted"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted hover:text-accent transition-colors cursor-pointer bg-transparent border-none">
              <IconClose />
            </button>
          )}
        </div>

        {/* ── Products table ── */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card h-16 animate-pulse bg-raised" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-5xl mb-4">👟</p>
            <p className="text-xl font-bold text-primary mb-1">
              {search ? 'Sin resultados' : 'Catálogo vacío'}
            </p>
            <p className="text-sm text-muted">
              {search ? `No se encontraron productos para "${search}"` : 'Añade tu primer producto con el botón de arriba'}
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-raised">
                    <th className="text-left px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Producto</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider hidden md:table-cell">Marca</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Precio</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider hidden sm:table-cell">Stock</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product, idx) => (
                    <tr
                      key={product.id}
                      className="border-b border-border last:border-0 hover:bg-raised/60 transition-colors duration-150"
                    >
                      {/* Product info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-raised border border-border overflow-hidden shrink-0 flex items-center justify-center">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name}
                                className="w-full h-full object-contain"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <span className="text-muted text-xs">N/A</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary leading-tight">{product.name}</p>
                            <p className="text-xs text-muted mt-0.5 md:hidden">{product.brand}</p>
                          </div>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="px-6 py-4 text-sm text-secondary hidden md:table-cell">{product.brand}</td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-accent">{Number(product.price).toFixed(2)}€</span>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : product.stock <= 5
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                        }`}>
                          {product.stock === 0 ? '⚠ Sin stock' : `${product.stock} uds`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            id={`admin-edit-${product.id}`}
                            onClick={() => openEdit(product)}
                            title="Editar producto"
                            className="p-2 rounded-lg bg-raised border border-border text-muted hover:border-accent hover:text-accent transition-all duration-200 cursor-pointer"
                          >
                            <IconEdit />
                          </button>
                          <button
                            id={`admin-delete-${product.id}`}
                            onClick={() => setDeleteTarget(product)}
                            title="Eliminar producto"
                            className="p-2 rounded-lg bg-raised border border-border text-muted hover:border-red-500 hover:text-red-500 transition-all duration-200 cursor-pointer"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer count */}
            <div className="px-6 py-3 border-t border-border bg-raised flex items-center justify-between">
              <p className="text-xs text-muted">
                Mostrando <strong className="text-secondary">{filtered.length}</strong> de <strong className="text-secondary">{totalProducts}</strong> productos
              </p>
              <button onClick={fetchProducts} className="text-xs text-accent hover:text-accent-hover font-semibold transition-colors cursor-pointer bg-transparent border-none">
                ↻ Actualizar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showModal && (
        <ProductModal
          editId={editId}
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => { setShowModal(false); setForm(emptyForm); setEditId(null); }}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
