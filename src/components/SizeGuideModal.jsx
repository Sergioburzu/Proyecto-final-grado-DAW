import { X, Check } from 'lucide-react';
import { useState, useMemo } from 'react';

// Conversiones predefinidas para tallas estándar
const SIZE_CONVERSIONS = {
  '39': { uk: '6', us: '6', cm: '25', in: '9.8' },
  '40': { uk: '6.5', us: '7', cm: '25.7', in: '10.1' },
  '41': { uk: '7.5', us: '8', cm: '26.3', in: '10.4' },
  '42': { uk: '8', us: '9', cm: '27', in: '10.6' },
  '43': { uk: '9', us: '10', cm: '27.7', in: '10.9' },
  '44': { uk: '10', us: '11', cm: '28.3', in: '11.1' },
  '45': { uk: '11', us: '12', cm: '29', in: '11.4' },
  '46': { uk: '12', us: '13', cm: '29.7', in: '11.7' },
  '47': { uk: '13', us: '14', cm: '30.3', in: '11.9' },
  '48': { uk: '14', us: '15', cm: '31', in: '12.2' },
  '49': { uk: '15', us: '16', cm: '31.7', in: '12.3' },
  '50': { uk: '16', us: '17', cm: '32.3', in: '12.7' }
};

// Calcula aproximaciones métricas para tallas especiales
function getConversion(euroSize) {
  const normalized = String(euroSize).trim().replace(',', '.');
  if (SIZE_CONVERSIONS[normalized]) {
    return { euro: normalized, ...SIZE_CONVERSIONS[normalized] };
  }

  const euroNum = parseFloat(normalized);
  if (!isNaN(euroNum) && euroNum > 0) {
    // Fórmulas de aproximación lineal para calzado
    const uk = ((euroNum - 39) * 0.9 + 6).toFixed(1).replace('.0', '');
    const us = ((euroNum - 39) * 1.0 + 6).toFixed(1).replace('.0', '');
    const cm = ((euroNum - 39) * 0.66 + 25).toFixed(1).replace('.', ',');
    const inch = (((euroNum - 39) * 0.66 + 25) / 2.54).toFixed(1);
    return { euro: normalized, uk, us, cm, in: inch };
  }

  // Retorno por defecto para tallas no numéricas
  return { euro: normalized, uk: '—', us: '—', cm: '—', in: '—' };
}

export default function SizeGuideModal({ isOpen, onClose, productSizes = [] }) {
  // Normaliza las tallas de entrada
  const normalizedProductSizes = useMemo(() => {
    return productSizes.map(s => String(s).trim().replace(',', '.'));
  }, [productSizes]);

  // Genera el listado completo de tallas con equivalencias
  const sizesTableData = useMemo(() => {
    const defaultRange = Array.from({ length: 12 }, (_, i) => String(39 + i));
    
    // Combina el rango por defecto y las del producto sin duplicados
    const allSizes = Array.from(new Set([...defaultRange, ...normalizedProductSizes]))
      .sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (isNaN(numA) || isNaN(numB)) return a.localeCompare(b);
        return numA - numB;
      });

    return allSizes.map(size => {
      const conv = getConversion(size);
      const isAvailable = normalizedProductSizes.includes(size);
      return { ...conv, isAvailable };
    });
  }, [normalizedProductSizes]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col transform transition-transform duration-300 animate-[fadeInUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="flex items-start justify-between p-6 border-b border-border bg-raised/30 shrink-0">
          <div>
            <h3 className="text-xl font-black text-primary m-0">Guía de Tallas</h3>
            <p className="text-sm text-secondary mt-1">Comparativa de tallas y equivalencias métricas.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full border border-border bg-surface text-secondary hover:text-accent hover:border-accent transition-all duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Tabla de tallas */}
          <div className="border border-border rounded-2xl overflow-hidden bg-surface">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-raised border-b border-border text-secondary">
                  <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">EURO</th>
                  <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">UK</th>
                  <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">US</th>
                  <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">CM</th>
                  <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">IN</th>
                  <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sizesTableData.map((row) => (
                  <tr 
                    key={row.euro} 
                    className={`transition-colors duration-150 ${
                      row.isAvailable 
                        ? 'bg-accent/5 font-semibold text-primary' 
                        : 'text-secondary hover:bg-raised/20'
                    }`}
                  >
                    <td className="px-5 py-3.5 text-sm">{row.euro}</td>
                    <td className="px-5 py-3.5 text-sm">{row.uk}</td>
                    <td className="px-5 py-3.5 text-sm">{row.us}</td>
                    <td className="px-5 py-3.5 text-sm">{row.cm}</td>
                    <td className="px-5 py-3.5 text-sm">{row.in}</td>
                    <td className="px-5 py-3.5 text-xs text-right">
                      {row.isAvailable ? (
                        <span className="inline-flex items-center gap-1 bg-accent/10 text-accent font-bold px-2 py-0.5 rounded-full text-[0.7rem]">
                          <Check className="w-3 h-3" /> En Stock
                        </span>
                      ) : (
                        <span className="text-muted font-normal text-[0.7rem] italic">Agotado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
