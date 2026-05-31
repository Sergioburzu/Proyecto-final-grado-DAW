import { supabase } from '../supabaseClient';

// URL base vacía por retrocompatibilidad con componentes antiguos
export const BASE_URL = '';

/* Gestión de Productos en Supabase */

/* Obtiene productos con filtro opcional por nombre o marca */
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

/* Obtiene un único producto por su ID */
export const getProduct = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return { data };
};

/* Crea un nuevo producto en la base de datos */
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

/* Actualiza los datos de un producto existente */
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

/* Elimina un producto por su ID */
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return { data: null };
};

/* Gestión de Pedidos */

/* Crea un pedido y asocia sus respectivos artículos (order_items) */
export const createOrder = async (orderData) => {
  const { data: { user } } = await supabase.auth.getUser();

  // Inserta el registro principal del pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      user_id:          user?.id ?? null,
      shipping_name:    orderData.shipping_name,
      shipping_address: orderData.shipping_address,
      shipping_city:    orderData.shipping_city,
      shipping_zip:     orderData.shipping_zip,
      shipping_phone:   orderData.shipping_phone,
      total:            orderData.total ?? null,
      status:           'paid',
    }])
    .select()
    .single();

  if (orderError) throw orderError;

  // Relaciona cada artículo del carrito con el pedido creado
  const lines = orderData.items.map((item) => ({
    order_id:   order.id,
    product_id: item.product_id,
    quantity:   item.quantity,
    unit_price: item.unit_price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(lines);

  if (itemsError) throw itemsError;

  return { data: order };
};

/* Obtiene los pedidos del usuario actual ordenados por fecha */
export const getOrders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, image_url))')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return { data };
};

/* Obtiene todos los pedidos registrados en el sistema para el panel de administración */
export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, brand))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return { data };
};

/* Gestión de Favoritos */

/* Obtiene los productos favoritos del usuario actual */
export const getFavorites = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] };

  const { data, error } = await supabase
    .from('favorites')
    .select('*, products(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { data };
};

/* Verifica si un producto específico ya está marcado como favorito */
export const checkIsFavorite = async (productId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignora el error si no hay registros coincidentes
  return !!data;
};

/* Agrega un producto a la lista de favoritos del usuario */
export const addFavorite = async (productId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('favorites')
    .insert([{ user_id: user.id, product_id: productId }])
    .select()
    .single();

  if (error) throw error;
  return { data };
};

/* Elimina un producto de la lista de favoritos del usuario */
export const removeFavorite = async (productId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) throw error;
  return { data: null };
};
