import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct, getAllOrders } from '../../services/api';
import toast from 'react-hot-toast';
import { supabase } from '../../supabaseClient';

const STORAGE_BUCKET = 'Images';
const CATALOG_IMAGE = '0.png';

import { CirclePlus, Trash2, Package2, Tag, AlertCircle, Search, FilePenLine, X, ClipboardList, FileDown } from 'lucide-react';

/* Iconos del panel */
const IconPlus = () => <CirclePlus />
const IconEdit = () => <FilePenLine />
const IconTrash = () => <Trash2 />
const IconBox = () => <Package2 />
const IconTag = () => <Tag />
const IconAlert = () => <AlertCircle />
const IconSearch = () => <Search />
const IconClose = () => <X />
const IconClipboard = () => <ClipboardList />
const IconFileDown = () => <FileDown />

/* Datos iniciales del formulario de productos */
const emptyForm = { name: '', brand: '', description: '', price: '', size: '', image_url: '', stock: '' };

/* Tarjeta informativa de métricas */
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

/* Envoltorio estructurado de campos de formulario */
function Field({ label, children }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

/* Modal de confirmación para eliminar un producto */
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

/* Modal para crear o editar un producto */
function ProductModal({ editId, form, onChange, onSubmit, onClose, saving }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="card p-8 w-full max-w-2xl shadow-2xl my-8 animate-[fadeInUp_0.25s_ease-out]">

        {/* Cabecera del modal */}
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

          {/* Previsualización de imagen si existe la ruta */}
          {form.image_url && (
            <div className="mt-4 p-3 rounded-xl bg-raised border border-border flex items-center gap-3">
              <img src={supabase.storage.from(STORAGE_BUCKET).getPublicUrl(`${form.image_url}/${CATALOG_IMAGE}`).data.publicUrl} alt="Preview" className="w-16 h-16 rounded-lg object-contain bg-card border border-border" onError={(e) => { e.target.style.display = 'none'; }} />
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

/* Panel de administración principal */
export default function AdminDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPDF = () => {
    if (!orders.length) return;

    const totalSales = orders.reduce((sum, o) => sum + Number(o.total || 0), 0).toFixed(2);
    const totalItems = orders.reduce((sum, o) => sum + (o.order_items?.reduce((s, item) => s + item.quantity, 0) || 0), 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión. Habilita las ventanas emergentes.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Reporte de Pedidos y Ventas - SNEAK-OUT</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1c1917;
            margin: 40px;
            line-height: 1.5;
          }
          .header {
            border-bottom: 2px solid #721c24;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .title {
            font-size: 28px;
            font-weight: 900;
            color: #721c24;
            letter-spacing: 0.05em;
            margin: 0;
          }
          .meta-info {
            font-size: 12px;
            color: #78716c;
            text-align: right;
          }
          .summary-cards {
            display: flex;
            gap: 20px;
            margin-bottom: 35px;
          }
          .card {
            flex: 1;
            border: 1px solid #e7e5e4;
            border-radius: 12px;
            padding: 15px 20px;
            background-color: #fafaf9;
          }
          .card-label {
            font-size: 11px;
            text-transform: uppercase;
            color: #a8a29e;
            font-weight: bold;
            letter-spacing: 0.05em;
          }
          .card-value {
            font-size: 22px;
            font-weight: 800;
            color: #1c1917;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #e7e5e4;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #721c24;
            color: white;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
            font-weight: 700;
          }
          tr:nth-child(even) {
            background-color: #fafaf9;
          }
          .product-list {
            margin: 0;
            padding-left: 15px;
          }
          .badge-paid {
            display: inline-block;
            background-color: #d1e7dd;
            color: #0f5132;
            padding: 4px 10px;
            border-radius: 20px;
            font-weight: 800;
            font-size: 10px;
            text-transform: uppercase;
          }
          @media print {
            body { margin: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">SNEAK-OUT</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold; color: #78716c;">Reporte Oficial de Pedidos y Movimientos</p>
          </div>
          <div class="meta-info">
            <p style="margin: 0;"><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            <p style="margin: 5px 0 0 0;"><strong>Generado por:</strong> ${user?.user_metadata?.name || user?.email || 'Administrador'}</p>
          </div>
        </div>

        <div class="summary-cards">
          <div class="card">
            <div class="card-label">Facturación Total</div>
            <div class="card-value" style="color: #721c24;">${totalSales}€</div>
          </div>
          <div class="card">
            <div class="card-label">Total Pedidos</div>
            <div class="card-value">${orders.length}</div>
          </div>
          <div class="card">
            <div class="card-label">Artículos Vendidos</div>
            <div class="card-value">${totalItems} uds</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Dirección de Envío</th>
              <th>Artículos</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>${new Date(o.created_at).toLocaleDateString('es-ES')}</td>
                <td><strong>${o.shipping_name}</strong></td>
                <td>${o.shipping_phone}</td>
                <td>${o.shipping_address}, ${o.shipping_city} (C.P. ${o.shipping_zip})</td>
                <td>
                  <ul class="product-list">
                    ${o.order_items?.map(item => `
                      <li>${item.products?.name || 'Producto'} (${item.quantity} ud${item.quantity > 1 ? 's' : ''}) - ${(item.unit_price * item.quantity).toFixed(2)}€</li>
                    `).join('') || '<li>Sin artículos</li>'}
                  </ul>
                </td>
                <td><span class="badge-paid">Pagado</span></td>
                <td><strong style="color: #721c24; font-size: 13px;">${Number(o.total || 0).toFixed(2)}€</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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


  //Creacion y actualizacion de productos
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

  // Cálculo de estadísticas globales
  const totalProducts = products.length;
  const lowStock = products.filter(p => p.stock <= 5).length;
  const avgPrice = totalProducts > 0
    ? (products.reduce((s, p) => s + Number(p.price), 0) / totalProducts).toFixed(2)
    : '0.00';

  // Filtrado dinámico según la barra de búsqueda
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-base py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-black px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
              Panel de Administración
            </div>
            <h1 className="text-4xl font-black text-primary leading-tight">Gestión del Catálogo</h1>
            <p className="text-secondary mt-1 text-sm">
              Bienvenido, <span className="text-accent font-semibold">{user?.user_metadata?.name || user?.email}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0 sm:items-end">
            <button id="admin-new-product-btn" onClick={openCreate} className="btn-accent px-5 py-2.5 text-sm shrink-0 flex items-center gap-2">
              <IconPlus /> Nuevo Producto
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={orders.length === 0}
              className="px-5 py-2 rounded-lg border border-border bg-raised text-secondary text-xs font-semibold cursor-pointer hover:border-accent hover:text-accent transition-all duration-200 flex items-center gap-2 self-stretch sm:self-auto justify-center"
            >
              <IconFileDown /> Descargar PDF (Ventas)
            </button>
          </div>
        </div>

        {/* Panel de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard icon={<IconBox />} label="Productos en catálogo" value={totalProducts} sub="Total registrados" />
          <StatCard icon={<IconTag />} label="Precio medio" value={`${avgPrice}€`} sub="Media del catálogo" />
          <StatCard icon={<IconAlert />} label="Stock bajo" value={lowStock} sub="5 unidades o menos" />
        </div>

        {/* Barra de búsqueda */}
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

        {/* Listado en tabla de los artículos */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card h-16 animate-pulse bg-raised" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <Package2 className="mx-auto w-16 h-16 text-muted/60 mb-4" />
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
                      {/* Información de producto */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-raised border border-border overflow-hidden shrink-0 flex items-center justify-center">
                            {product.image_url ? (
                              <img src={supabase.storage.from(STORAGE_BUCKET).getPublicUrl(`${product.image_url}/${CATALOG_IMAGE}`).data.publicUrl} alt={product.name}
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

                      {/* Marca */}
                      <td className="px-6 py-4 text-sm text-secondary hidden md:table-cell">{product.brand}</td>

                      {/* Precio */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-accent">{Number(product.price).toFixed(2)}€</span>
                      </td>

                      {/* Nivel de stock */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : product.stock <= 5
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                        }`}>
                          {product.stock === 0 ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" /> Sin stock
                            </>
                          ) : product.stock <= 5 ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" /> {product.stock} uds
                            </>
                          ) : (
                            `${product.stock} uds`
                          )}
                        </span>
                      </td>

                      {/* Botones de edición y borrado */}
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

            {/* Contadores y actualización */}
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

      {/* Ventanas modales */}
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
