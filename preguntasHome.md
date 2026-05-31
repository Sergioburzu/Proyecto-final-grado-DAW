# 🎓 Defensa del TFG: Preguntas Clave sobre `HomePage.jsx`

Este documento recopila las **preguntas más difíciles, capciosas o de nivel avanzado** que los miembros del tribunal de tu Proyecto Final de Grado (DAW) podrían hacerte sobre la página principal (`HomePage.jsx`). 

Aquí tienes las respuestas técnicas redactadas de forma impecable, profesional y con la justificación exacta para demostrar que dominas React, la optimización y la experiencia de usuario (UX).

---

## 🚀 1. Optimización del Rendimiento y Experiencia de Usuario (UX)

### ❓ Pregunta 1.1: Veo que en `fetchProducts` haces algo muy inusual: creas objetos `new Image()` en paralelo y usas `Promise.all` con un timeout. ¿Por qué haces esto en lugar de simplemente renderizar las URLs que vienen de Supabase directamente en la etiqueta `<img>`?

**💡 Respuesta clave:**
> *"Hacemos esto para evitar la **carga secuencial o parpadeo ('image pop-in')**, logrando que todas las zapatillas de la parrilla se muestren en pantalla **al mismo tiempo** y de forma instantánea una vez que finaliza el estado de carga (`loading`)."*
> 
> *Si renderizáramos las imágenes directamente con la URL, el navegador las descargaría una a una en hilos separados, haciendo que las imágenes 'aparecieran' a diferentes tiempos de forma desordenada, lo cual da una sensación de inestabilidad y baja calidad.*

**⚙️ Explicación técnica (por si insisten):**
1. **Pre-carga en paralelo:** Convertimos el array de productos en un array de promesas de pre-carga (`preloadPromises`). Cada una instancia un objeto `new Image()` de JavaScript nativo, asigna la URL pública de Supabase y resuelve la promesa en el evento `.onload` o `.onerror`.
2. **Evitar bloqueos infinitos (`Promise.race`):** Para que una imagen lenta o rota no bloquee toda la aplicación, usamos `Promise.race`. Competimos la descarga de todas las imágenes contra un temporizador (`setTimeout`) de **3 segundos**. Si pasan 3 segundos y alguna imagen no ha bajado, la promesa de carrera finaliza de todos modos y mostramos lo que tengamos.
3. **Control del parpadeo del Skeleton:** Si el servidor responde extremadamente rápido (por ejemplo, en 50ms), el componente Skeleton se mostraría solo un instante antes de desaparecer, provocando un destello incómodo. Con `Promise.all([..., new Promise(resolve => setTimeout(resolve, 800))])`, garantizamos que la pantalla de carga se mantenga activa **al menos 800 milisegundos**, suavizando la transición visual.

---

### ❓ Pregunta 1.2: En el slider de rango de precio usas `requestAnimationFrame` en combinación con un `useCallback` y un `useRef`. ¿Qué problema de rendimiento soluciona esto y cómo funciona?

**💡 Respuesta clave:**
> *"Evita saturar el hilo principal del navegador (*Main Thread*) con actualizaciones de estado innecesarias cuando el usuario arrastra el slider de precio rápidamente. Esto asegura que la interacción en dispositivos móviles o con pocos recursos sea de **60 FPS constantes** (completamente fluida)."*

**⚙️ Explicación técnica (por si insisten):**
* **El problema:** El evento `onChange` del elemento `<input type="range">` se dispara decenas de veces por segundo. Si actualizamos el estado de React (`setDraftPrice`) en cada micro-movimiento, React se vería obligado a re-renderizar el componente (y sus hijos) de manera síncrona en cada punto del camino, provocando tirones (*lag*).
* **La solución:**
  1. Usamos `useCallback` en `handleSliderChange` para que la referencia de la función sea persistente y no se recree en cada renderizado.
  2. Usamos una referencia mutable `rafRef` (`useRef`) para guardar el identificador del siguiente cuadro de animación del navegador.
  3. En cada disparo del evento, primero cancelamos cualquier actualización que estuviera agendada y pendiente de dibujarse mediante `cancelAnimationFrame(rafRef.current)`.
  4. Agendamos la nueva actualización del estado con `requestAnimationFrame`. Esto le dice al navegador: *'Ejecuta este `setDraftPrice` únicamente cuando estés listo para pintar el próximo frame en la pantalla'*, alineando los renders de React perfectamente con la tasa de refresco del monitor (normalmente cada 16.6ms).

---

## 🎨 2. Gestión de Estados Complejos: El Patrón "Draft" (Borrador)

### ❓ Pregunta 2: ¿Por qué tienes estados duplicados para los filtros, como `selectedBrands` (real) y `draftBrands` (borrador)? ¿No es más fácil aplicar los filtros inmediatamente cuando el usuario hace clic?

**💡 Respuesta clave:**
> *"Es una decisión de diseño UX y optimización llamada **Patrón Borrador (Drafting Pattern)**. Permite al usuario interactuar libremente dentro del modal de filtros, marcando marcas, ordenaciones y precios, **sin alterar la vista de fondo** ni lanzar peticiones o re-cálculos de filtrado pesados mientras decide. La lista real de productos solo cambia cuando el usuario confirma explícitamente pulsando el botón 'Ver X resultados'."*

**⚙️ Explicación técnica (por si insisten):**
* Al hacer clic en el botón de Filtros se ejecuta `openFilter()`, que hace una **copia profunda por valor** (usando el operador spread `[...]`) del estado real hacia el estado de borrador:
  ```javascript
  setDraftBrands([...selectedBrands]);
  setDraftPrice(priceMax ?? catalogMaxPrice);
  setDraftSort(sortBy);
  ```
* El usuario interactúa únicamente con `draftBrands`, `draftPrice` y `draftSort`.
* Si hace clic en la 'X' o fuera del modal (Backdrop), simplemente cerramos el modal. Los cambios del borrador se descartan y los productos del catálogo de fondo permanecen intactos.
* Si hace clic en aplicar, ejecutamos `applyFilters()` para volcar los borradores al estado real:
  ```javascript
  setSelectedBrands(draftBrands);
  setPriceMax(draftPrice);
  setSortBy(draftSort);
  ```
  Esto minimiza los re-renderizados del catálogo a **una sola vez** al final del proceso de configuración.

---

## 🧠 3. Hooks de Rendimiento y Lógica Derivada (`useMemo`, `useCallback`)

### ❓ Pregunta 3.1: ¿Qué ventaja tiene usar `useMemo` en variables como `brands`, `catalogMaxPrice` o `filteredProducts`? ¿No se recalculan de todos modos en cada render?

**💡 Respuesta clave:**
> *"Evitan cálculos costosos o redundantes. `useMemo` le dice a React que guarde en memoria (*caché*) el resultado del cálculo y **solo vuelva a calcularlo si las dependencias específicas especificadas en su array cambian**."*

**⚙️ Explicación técnica (por si insisten):**
* **`brands` (Marcas únicas):** Hace un barrido de todos los productos para extraer marcas únicas mediante `new Set()` y ordenarlas alfabéticamente. Solo se ejecuta de nuevo si la lista original de `products` cambia (por ejemplo, tras una nueva búsqueda), no cuando abrimos/cerramos el modal o arrastramos el slider.
* **`catalogMaxPrice` (Precio máximo del catálogo):** Usa `Math.max` mapeando todos los precios. Si no se memorizara, buscar el precio más alto ocurriría en cada render, lo cual es ineficiente si la base de datos de productos crece.
* **`filteredProducts` (Filtrado y ordenación dinámica):** Es el cálculo más pesado, ya que aplica filtros de array (`.filter`) y ordenaciones algorítmicas (`.sort` con `localeCompare`). Al memorizarlo con dependencias `[products, selectedBrands, priceMax, sortBy]`, garantizamos que no se ejecute este algoritmo cuando cambien estados puramente visuales (como `filterOpen` o los estados `draft`).

---

## 🌐 4. Sincronización con la URL (`useSearchParams`)

### ❓ Pregunta 4: Veo que usas `useSearchParams` de React Router para controlar cuándo mostrar el catálogo completo o los resultados de búsqueda. ¿Por qué preferiste la URL sobre una variable de estado normal (`useState`)?

**💡 Respuesta clave:**
> *"Porque usar la URL como **única fuente de verdad (Single Source of Truth)** para la búsqueda y la sección activa ofrece tres ventajas fundamentales en aplicaciones web reales:*
> 1. *Permite **compartir enlaces directos** (por ejemplo, enviar a un amigo por WhatsApp la URL `/?search=Jordan` o `/?section=catalogo` y que vea exactamente lo mismo).*
> 2. *Permite que el **botón de "Atrás" y "Adelante" del navegador** funcione correctamente (historial de navegación nativo).*
> 3. *Facilita la comunicación entre componentes distantes (como la barra de búsqueda en la Navbar y el contenedor en HomePage) sin necesidad de recurrir a prop-drilling complejo o a Redux/Contexto para este fin específico."*

---

## 🛠️ 5. Resumen de Tecnologías Empleadas en esta Página
Si te preguntan qué librerías o APIs nativas utilizas en `HomePage.jsx` para resolver problemas concretos:

* **React Router Dom (`useSearchParams`, `useNavigate`):** Sincronización de la barra de direcciones con el estado visual y la navegación sin recargar.
* **Supabase Storage API:** Generación dinámica de URLs de imágenes públicas hospedadas en los buckets de la base de datos de Supabase.
* **HTML5 Canvas/Image API:** Pre-carga nativa mediante instanciación de `new Image()` y eventos asíncronos (`onload`/`onerror`).
* **RequestAnimationFrame (Web API nativa):** Sincronización de tareas visuales con la tasa de refresco del navegador (optimizando el slider).
* **Lucide React / React Icons:** Conjunto de iconos vectoriales interactivos de alto rendimiento.
