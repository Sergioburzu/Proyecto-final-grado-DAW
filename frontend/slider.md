En el archivo src/components/ProductSlider/ProductSlider.jsx
modificar únicamente el "Bottom row" para que en móvil 
el layout sea diferente al de desktop.

## LAYOUT DESKTOP (md en adelante)
- flex-row, precio a la izquierda, BUY NOW a la derecha
- El bloque izquierdo: max-w-[45%]

## LAYOUT MÓVIL (por defecto, menos de md)
- El bloque completo: flex-col en lugar de flex-row
- El bloque de precio/stars/descripción: w-full, sin max-w limitado
- El botón BUY NOW: w-full, text-center, al final del bloque

## Código exacto a reemplazar en el Bottom row:

<div className="flex justify-between items-center pointer-events-auto 
  flex-wrap gap-4 w-full">

  <div className="flex flex-col gap-1.5 max-w-[40%] md:max-w-[35%]">

Sustituir por:

<div className="flex flex-col md:flex-row md:justify-between 
  md:items-end pointer-events-auto gap-3 w-full">

  <div className="flex flex-col gap-1.5 w-full md:max-w-[45%]">

Y el botón BUY NOW añadirle:
  className="ps-buy-btn w-full md:w-auto text-center"

## RESTRICCIONES
- NO tocar nada más del componente
- NO tocar ProductSlider.css
- NO cambiar lógica ni Supabase