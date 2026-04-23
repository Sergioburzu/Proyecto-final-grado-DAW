Necesito que revises y corrijas el layout, centrado y márgenes de 
las siguientes páginas de mi proyecto React. 

## REGLAS GENERALES (aplicar en TODAS las páginas)
- Todos los componentes deben estar centrados horizontalmente
- Usar max-width apropiado (max-w-7xl o similar) con mx-auto
- Padding horizontal mínimo: px-4 en móvil, px-8 en tablet, px-16 en desktop
- Padding vertical entre secciones: py-12 mínimo
- Ningún texto debe estar pegado al borde de la pantalla ni a otro elemento
- Espaciado entre título y contenido: mb-4 mínimo
- Espaciado entre componentes/secciones: gap-8 o mt-12 mínimo
- Mantener coherencia visual en toda la web

## PÁGINA DE INICIO (HomePage.jsx)
- Centrar todos los componentes horizontalmente
- Revisar cada sección y añadir los márgenes/paddings necesarios
- Asegurarse de que ningún texto queda pegado a otro elemento o al borde
- Mantener el ProductSlider tal cual está, no tocarlo

## PÁGINA DE CATÁLOGO
- Centrar el contenido principal con max-width y mx-auto
- La grid de productos debe tener gap entre tarjetas (gap-6 mínimo)
- Títulos y filtros con padding suficiente
- Las tarjetas de producto deben tener padding interno (p-4 mínimo)
- Centrar la paginación si la hay

## PÁGINA DE CONTACTO
- Centrar el formulario en la página (máximo ancho: max-w-2xl)
- Espaciado entre campos del formulario: mb-4 entre cada campo
- Labels con mb-1 respecto a su input
- Padding interno del formulario: p-8
- Título de la página centrado con margen inferior generoso (mb-8)
- Botón de envío centrado o a full width

## PÁGINA DE REGISTRO
- Centrar el formulario vertical y horizontalmente en la pantalla
- Usar min-h-screen con flex items-center justify-center
- Contenedor del formulario: max-w-md, con padding p-8
- Añadir sombra suave al card del formulario (shadow-lg)
- Espaciado entre campos: mb-4
- Logo o título centrado encima del formulario con mb-6
- Link a login centrado debajo del botón con mt-4

## PÁGINA DE LOGIN (Entrar)
- Mismas reglas que Registro
- Centrar vertical y horizontalmente con min-h-screen
- Contenedor: max-w-md, padding p-8, shadow-lg
- Espaciado entre campos: mb-4
- Link a registro centrado debajo con mt-4

## RESTRICCIONES
- NO cambiar lógica, funciones ni conexiones a Supabase
- NO modificar supabaseClient.js ni .env
- NO cambiar colores ni tipografía existente, solo espaciados y centrado
- NO tocar ProductSlider ni sus archivos CSS/JSX
- Usar clases Tailwind existentes, no añadir CSS externo nuevo
- Si un componente ya está bien centrado, no tocarlo
- Antes de modificar cada página, mostrarme qué cambios vas a hacer