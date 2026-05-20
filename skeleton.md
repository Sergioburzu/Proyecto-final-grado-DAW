# Plan de Implementación: Skeleton Loader Cohesivo con `react-loading-skeleton` y Carga Simultánea

Este plan detalla los cambios para incorporar una animación de carga tipo **Skeleton** premium en las tarjetas de zapatillas utilizando el paquete oficial `react-loading-skeleton` y garantizando que todas las imágenes/modelos se muestren en pantalla **al mismo tiempo**, eliminando el efecto de carga progresiva ("pop-in") asíncrona.

---

## 🔍 Análisis de la Solución

### 1. Instalación de la Dependencia
Instalaremos la biblioteca oficial `react-loading-skeleton` en el proyecto. Esta biblioteca proporciona componentes reactivos nativos muy parametrizables:
- Permite configurar fácilmente alturas, anchos, radios de borde y colores de fondo.
- Ofrece soporte de accesibilidad completo (ARIA).

### 2. Integración de Temas Estilizados
Usaremos el componente `<SkeletonTheme>` de la biblioteca para inyectar las variables de color CSS de nuestro propio sistema de diseño a los esqueletos:
- **Base Color:** `var(--color-raised)` (color arena/crema de fondo secundario `#F0EDE4`).
- **Highlight Color:** `var(--color-base)` (color blanco roto principal `#F9F6F0`).

### 3. Pre-carga de Imágenes en Segundo Plano (Promise.all)
Antes de cambiar el estado global `loading` de `true` a `false`, generaremos las URLs públicas de las imágenes de todas las zapatillas e iniciaremos su descarga en memoria mediante el objeto nativo del navegador `new Image()`.
Esto garantiza que, tras los skeletons, **todas las zapatillas e imágenes aparezcan instantáneamente y a la vez**.

---

## 🛠️ Cambios Propuestos

### 1. Dependencias ([package.json](file:///home/sergio/Escritorio/Proyecto-final-grado-DAW/package.json))
- Instalar `react-loading-skeleton` mediante npm.

### 2. Nuevo Componente Skeleton ([src/components/MiniProductCardSkeleton.jsx](file:///home/sergio/Escritorio/Proyecto-final-grado-DAW/src/components/MiniProductCardSkeleton.jsx)) [NEW]
Crearemos un nuevo componente que replique de forma fiel la estructura y las dimensiones de `MiniProductCard`, construyendo el esqueleto a través del paquete importado.

```jsx
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function MiniProductCardSkeleton() {
  return (
    <SkeletonTheme baseColor="var(--color-raised)" highlightColor="var(--color-base)">
      <div className="w-full flex flex-col gap-3">
        {/* Contenedor de la Imagen (aspect-square) */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-border/50">
          <Skeleton height="100%" containerClassName="w-full h-full block leading-none" />
        </div>

        {/* Nombre de la Zapatilla */}
        <Skeleton height={16} width="75%" borderRadius="0.375rem" />

        {/* Precio */}
        <Skeleton height={16} width="25%" borderRadius="0.375rem" />
      </div>
    </SkeletonTheme>
  );
}
```

### 3. Página de Inicio ([src/pages/HomePage.jsx](file:///home/sergio/Escritorio/Proyecto-final-grado-DAW/src/pages/HomePage.jsx))
Modificaremos la función `fetchProducts` para pre-cargar las imágenes de catálogo de todas las zapatillas antes de desactivar el esqueleto. Importaremos y utilizaremos el nuevo componente `<MiniProductCardSkeleton />` en la pantalla cuando `loading` sea activo.

**Lógica de pre-carga en `fetchProducts`:**
```javascript
const fetchProducts = async () => {
  setLoading(true);
  try {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    const res = await getProducts(params);
    const productsData = res.data || [];

    // Pre-cargar imágenes
    const preloadPromises = productsData.map(product => {
      const { data: imgData } = supabase.storage
        .from('Images')
        .getPublicUrl(`${product.image_url}/0.png`);
      const imageUrl = imgData?.publicUrl;

      if (!imageUrl) return Promise.resolve();
      return new Promise((resolve) => {
        const img = new Image();
        img.src = imageUrl;
        img.onload = resolve;
        img.onerror = resolve; // continuar aunque falle
      });
    });

    // Esperar a que se descarguen todas o timeout de seguridad de 3s
    await Promise.race([
      Promise.all(preloadPromises),
      new Promise(resolve => setTimeout(resolve, 3000))
    ]);

    setProducts(productsData);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

### 4. Página de Detalle ([src/pages/ProductDetailPage.jsx](file:///home/sergio/Escritorio/Proyecto-final-grado-DAW/src/pages/ProductDetailPage.jsx))
Adaptaremos el `useEffect` para pre-cargar tanto las 3 imágenes del producto principal como las imágenes de catálogo de los recomendados de forma sincrónica, asegurando el mismo efecto visual uniforme en la navegación de detalles.

---

## 📈 Plan de Verificación

### Instalación y Verificación de Dependencias
- Ejecutar `npm install react-loading-skeleton`
- Asegurar que la librería compile correctamente en el servidor de desarrollo Vite (`npm run dev`).

### Pruebas Manuales
1. **Network Throttling:**
   - Activar "Fast 3G" en Chrome DevTools.
   - Recargar y verificar que los skeletons de la librería `react-loading-skeleton` se dibujan perfectamente usando los colores `--color-raised` y `--color-base`.
   - Constatar que las imágenes aparecen al mismo tiempo en el instante en que finaliza la pre-carga.
2. **Navegación Fluida:**
   - Cambiar entre Inicio, Catálogo y Detalles. Las transiciones deben lucir limpias y libres de saltos de maquetación gracias a la altura fija e idéntica de los esqueletos importados.
