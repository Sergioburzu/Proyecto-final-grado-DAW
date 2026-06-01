import { Link } from 'react-router-dom';

export default function Page404() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-6 relative overflow-hidden">
      {/* Resplandor decorativo de fondo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, var(--accent-glow2) 0%, transparent 70%)' }}
      />

      <div className="text-center relative z-10 max-w-md mx-auto">
        {/* Código de error */}
        <h1 className="text-8xl font-black text-accent tracking-widest mb-4">
          404
        </h1>

        {/* Mensaje principal */}
        <h2 className="text-2xl font-extrabold text-primary mb-3">
          Página no encontrada
        </h2>

        {/* Descripción corta */}
        <p className="text-sm text-secondary mb-8 leading-relaxed">
          Lo sentimos, la página que estás buscando no existe, ha sido eliminada o ha cambiado de dirección.
        </p>

        {/* Botón de retorno al inicio */}
        <Link
          to="/"
          className="btn-accent px-6 py-3.5 text-sm tracking-wide inline-flex no-underline"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
