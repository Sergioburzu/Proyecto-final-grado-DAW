import { supabase } from '../supabaseClient';

// BASE_URL ya no es necesario — las image_url en Supabase deben ser URLs absolutas.
// Se exporta como cadena vacía para compatibilidad mientras se actualizan los componentes.
export const BASE_URL = '';

// ─── Auth (delegado a AuthContext via supabase.auth) ──────────────────────────
// Los métodos de auth se gestionan directamente en AuthContext.jsx

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * Obtiene todos los productos. Si params.search existe, filtra por nombre o marca.
 * Devuelve { data: [] } para mantener compatibilidad con los componentes existentes.
 */
export const getProducts = async (params = {}) => {
  let query = supabase.from('products').select('*').order('id', { ascending: false });

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,brand.ilike.%${params.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return { data };
};

/**
 * Obtiene un producto por ID.
 */
export const getProduct = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return { data };
};

/**
 * Crea un nuevo producto.
 */
export const createProduct = async (formData) => {
  const payload = {
    name:        formData.name,
    brand:       formData.brand,
    description: formData.description || null,
    price:       Number(formData.price),
    size:        formData.size || null,
    image_url:   formData.image_url || null,
    stock:       Number(formData.stock),
  };

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return { data };
};

/**
 * Actualiza un producto existente.
 */
export const updateProduct = async (id, formData) => {
  const payload = {
    name:        formData.name,
    brand:       formData.brand,
    description: formData.description || null,
    price:       Number(formData.price),
    size:        formData.size || null,
    image_url:   formData.image_url || null,
    stock:       Number(formData.stock),
  };

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return { data };
};

/**
 * Elimina un producto por ID.
 */
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return { data: null };
};

// ─── Orders ───────────────────────────────────────────────────────────────────

/**
 * Crea un pedido y sus líneas de producto.
 * data = { shipping_name, shipping_address, shipping_city, shipping_zip, shipping_phone, items: [{product_id, quantity}] }
 */
export const createOrder = async (orderData) => {
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Insertar cabecera del pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      user_id:          user?.id ?? null,
      shipping_name:    orderData.shipping_name,
      shipping_address: orderData.shipping_address,
      shipping_city:    orderData.shipping_city,
      shipping_zip:     orderData.shipping_zip,
      shipping_phone:   orderData.shipping_phone,
      status:           'pending',
    }])
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Insertar líneas del pedido
  const lines = orderData.items.map((item) => ({
    order_id:   order.id,
    product_id: item.product_id,
    quantity:   item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(lines);

  if (itemsError) throw itemsError;

  return { data: order };
};

/**
 * Obtiene todos los pedidos del usuario actual (o todos si es admin).
 */
export const getOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)');
  if (error) throw error;
  return { data };
};

