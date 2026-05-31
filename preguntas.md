# Guía de Preparación: Preguntas y Respuestas para la Defensa del Proyecto 🚀

¡Mucho éxito en tu presentación este lunes! No te preocupes, el tribunal suele preguntar conceptos prácticos y arquitectónicos para comprobar que realmente has programado tú la aplicación y entiendes cómo funciona el flujo de datos.

Aquí tienes una recopilación muy completa de las **preguntas que más te pueden hacer**, organizadas por temas, explicadas de forma clara y con los fragmentos de tu código real para que vayas 100% preparado.

---

## 📁 1. Arquitectura y "Backend-as-a-Service" (BaaS)

### **P1: Veo que no usas llamadas clásicas a `fetch` con URLs como `/api/productos`. ¿Cómo se comunica tu Frontend con la base de datos?**
* **Respuesta clave:** "Mi proyecto utiliza **Supabase**, que es una plataforma de **Backend-as-a-Service (BaaS)** basada en PostgreSQL. En lugar de crear una API propia en Laravel/Node.js desde cero y hacer peticiones HTTP manuales con `fetch` o `axios`, utilizo la librería oficial de Supabase (`@supabase/supabase-js`). Esta librería expone un cliente que me permite hacer consultas estructuradas directamente desde el código frontend de forma segura y declarativa."

### **P2: Si el frontend se conecta directamente a Supabase, ¿dónde queda la seguridad? ¿Cualquier usuario podría borrar la base de datos?**
* **Respuesta clave:** "No, la seguridad está totalmente controlada. Supabase utiliza **Políticas de Seguridad a Nivel de Fila (RLS - Row Level Security)** dentro de la propia base de datos PostgreSQL. Aunque las credenciales públicas del cliente estén en el frontend (en el `.env`), las políticas RLS de la base de datos impiden que un usuario modifique o lea datos que no le pertenecen. Por ejemplo, un usuario común solo puede modificar sus propios favoritos o pedidos, pero no los de los demás ni la lista de productos (que está restringida a administradores)."

---

## 🔐 2. Autenticación y Contexto (`AuthContext.jsx`)

Tu archivo [AuthContext.jsx](file:///c:/Users/Sergio/Desktop/Proyecto-final-grado-DAW/src/context/AuthContext.jsx) es el corazón de la sesión de tu app.

### **P3: ¿Qué es `createContext` y por qué lo utilizas para la autenticación?**
* **Respuesta clave:** "`createContext` es una funcionalidad nativa de React para evitar el **Prop Drilling** (pasar datos de padres a hijos a través de múltiples niveles). Con `AuthContext`, creo un estado global para la sesión del usuario. Así, cualquier componente de la aplicación (como el carrito, el header o el checkout) puede saber si hay un usuario logueado simplemente llamando al hook `useAuth()`, sin necesidad de pasarle la información a mano desde `App.jsx`."

### **P4: Explica qué hace este efecto al iniciar la aplicación en `AuthContext.jsx`:**
```javascript
useEffect(() => {
  // Carga la sesión activa al montar el componente
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    setLoading(false);
  });

  // Escucha cambios de sesión (login, logout, refresh de token)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```
* **Respuesta clave:** "Este efecto realiza dos acciones fundamentales al arrancar la app:
  1. Con `supabase.auth.getSession()`, comprueba de forma asíncrona si el usuario ya tenía una sesión activa (por ejemplo, guardada en el `localStorage` del navegador) para que no tenga que volver a iniciar sesión al recargar la página.
  2. Con `supabase.auth.onAuthStateChange()`, configuro un **oyente (listener)** en tiempo real. Si el usuario inicia sesión, la cierra, o el token de acceso expira y se refresca automáticamente, este oyente se activa inmediatamente, actualiza el estado `user` y la interfaz reacciona al instante.
  3. Al final, devolvemos `subscription.unsubscribe()` en el retorno de limpieza para evitar fugas de memoria al desmontar el componente."

### **P5: ¿Cómo gestionas los roles? ¿Cómo sabes si un usuario es administrador?**
* **Respuesta clave:** "Los roles se almacenan dentro de los metadatos del usuario en Supabase (`user_metadata`). En el contexto, calculamos si es administrador de forma muy sencilla con una constante booleana:
  ```javascript
  const isAdmin = user?.user_metadata?.role === 'admin';
  ```
  Si se cumple esa condición, habilitamos la navegación y las vistas de administración (como añadir o modificar productos)."

---

## 📦 3. Operaciones de Base de Datos y CRUD (`api.js`)

Tu archivo [api.js](file:///c:/Users/Sergio/Desktop/Proyecto-final-grado-DAW/src/services/api.js) centraliza las consultas a Supabase.

### **P6: Explica cómo funciona la función `getProducts` y cómo aplicas la búsqueda:**
```javascript
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
```
* **Respuesta clave:** 
  * "`supabase.from('products').select('*')` equivale a una sentencia SQL del tipo `SELECT * FROM products ORDER BY id DESC`."
  * "Si el usuario escribe algo en el buscador (`params.search`), aplicamos un filtro dinámico con `.or()`. La expresión `ilike` significa que hace una búsqueda **case-insensitive** (sin importar mayúsculas o minúsculas) y los caracteres `%` actúan como comodines para buscar coincidencias parciales tanto en el nombre (`name`) como en la marca (`brand`)."

### **P7: En `createOrder` (Crear Pedido), haces dos inserciones. ¿Por qué y cómo se relacionan?**
```javascript
// 1. Insertar cabecera del pedido en 'orders'
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert([{ ... }])
  .select()
  .single();

// 2. Insertar líneas del pedido en 'order_items'
const lines = orderData.items.map((item) => ({
  order_id:   order.id, // Relación clave foránea
  product_id: item.product_id,
  quantity:   item.quantity,
  unit_price: item.unit_price,
}));

await supabase.from('order_items').insert(lines);
```
* **Respuesta clave:** "Es un diseño de base de datos relacional clásico (relación uno a muchos, $1:N$). 
  1. Primero insertamos la **cabecera del pedido** en la tabla `orders` (datos de envío, el total y a qué usuario pertenece). Usamos `.select().single()` para que Supabase nos devuelva el registro recién creado junto con su **ID generado automáticamente**.
  2. Con ese `order.id`, recorremos el carrito del usuario para mapear las **líneas del pedido** en la tabla `order_items`. Cada artículo se guarda en una fila con su precio unitario, cantidad y la clave foránea `order_id` que lo vincula al pedido principal."

### **P8: En `getFavorites` usas la sintaxis `select('*, products(*)')`. ¿Qué significa ese asterisco entre paréntesis?**
```javascript
const { data, error } = await supabase
  .from('favorites')
  .select('*, products(*)')
  .eq('user_id', user.id);
```
* **Respuesta clave:** "Esto es el equivalente de Supabase a un **INNER JOIN** o **LEFT JOIN** de SQL. Le estamos pidiendo a Supabase que nos devuelva todas las columnas de la tabla `favorites` y que además, usando la clave foránea, traiga todos los campos del producto asociado (`products(*)`). Gracias a esto, en el frontend podemos mostrar cómodamente la imagen, el nombre y el precio del producto favorito sin tener que hacer una segunda consulta."

---

## ⚙️ 4. Variables de Entorno (`.env`)

### **P9: ¿Qué son las variables de entorno y por qué empiezan por `VITE_`?**
* **Respuesta clave:** "Las variables de entorno sirven para almacenar credenciales, claves de API o configuraciones del servidor de forma externa al código fuente. Esto evita subirlas a repositorios públicos como GitHub y facilita cambiar de entorno (por ejemplo, pasar de base de datos de desarrollo a la de producción sin tocar el código).
  En proyectos construidos con **Vite**, es obligatorio que las variables empiecen por el prefijo `VITE_` (como `VITE_SUPABASE_URL`). De esta forma, Vite sabe que son variables públicas seguras para ser inyectadas en el código que se ejecutará en el navegador del usuario a través de `import.meta.env`."

---

---

## 🧭 6. Enrutamiento y Renderizado (React Router)

### **P11: ¿Cómo funciona la navegación en tu aplicación? ¿Por qué la página no se recarga cuando cambias de sección?**
* **Respuesta clave:** "Mi aplicación es una **SPA (Single Page Application)** y utiliza **React Router (`react-router-dom`)** para gestionar la navegación. En lugar de pedirle un archivo HTML nuevo al servidor cada vez que el usuario hace clic en un enlace (lo que recargaría toda la web), React Router intercepta el clic, actualiza la barra de direcciones del navegador mediante la API de History del navegador y renderiza únicamente el componente correspondiente a la nueva ruta sin recargar la página. Esto hace que la navegación sea instantánea y súper fluida."

### **P12: ¿Qué diferencia hay entre `useState` y `useEffect`? (Pregunta estrella de React)**
* **Respuesta clave:**
  * **`useState`**: Es un hook que sirve para crear y gestionar **estados** internos en un componente (variables cuyos cambios hacen que el componente se vuelva a renderizar para actualizar la interfaz visual). Por ejemplo: el estado de si el menú está abierto, los productos del carrito o la lista de favoritos cargada.
  * **`useEffect`**: Es un hook que sirve para ejecutar **efectos secundarios** (código que interactúa con el mundo exterior al componente). Se usa principalmente para hacer peticiones de datos cuando el componente se muestra en pantalla, suscribirse a eventos, o sincronizar datos. 
  * **El array de dependencias (`[]`)**: Si está vacío `[]`, le indica a React que el efecto solo debe ejecutarse **una sola vez**, justo al montarse el componente en pantalla.

---

## 🎨 7. Estilos y Experiencia Visual (Tailwind CSS y GSAP)

### **P13: ¿Qué tecnología has usado para el diseño visual y por qué?**
* **Respuesta clave:** "He utilizado **Tailwind CSS**. Es un framework CSS de tipo **utility-first** (basado en clases de utilidad). En lugar de escribir archivos `.css` gigantescos aparte, aplico clases predefinidas directamente sobre el HTML/JSX (como `flex`, `grid`, `bg-blue-500`, `p-4`, `hover:scale-105`). Esto hace que el desarrollo sea extremadamente rápido, el diseño sea consistente en toda la web y la aplicación final cargue más rápido porque Tailwind genera un archivo CSS compilado muy optimizado y pequeño."

### **P14: Veo que tienes GSAP en tus dependencias. ¿Para qué se utiliza en este proyecto?**
* **Respuesta clave:** "**GSAP (GreenSock Animation Platform)** es la librería líder en la industria para realizar animaciones web de alto rendimiento. La utilizo para crear transiciones suaves, micro-animaciones en los menús, efectos al deslizar elementos o entradas de componentes que hacen que la experiencia de usuario (UX) se sienta premium, interactiva y muy moderna, manteniendo una tasa de frames muy estable sin sobrecargar el navegador."

---

### 💡 Un consejo final para la defensa:
Si te preguntan algo que no recuerdas exactamente o dudas, siempre puedes responder con aplomo:
> *"Para este proyecto he priorizado una arquitectura limpia y desacoplada, separando la interfaz en React (organizada en componentes reutilizables y páginas) de las operaciones de datos, las cuales encapsulé en servicios asíncronos (`api.js`) aprovechando las ventajas de un BaaS como Supabase. Esto me permite escalar el frontend fácilmente y delegar la persistencia de forma segura."*

¡Vas súper bien preparado, Sergio! Tienes un proyecto con tecnologías modernas (React, Vite, Supabase, Tailwind, Context API) muy bien estructurado. ¡A por todas! 🚀

