import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
) : (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

function PasswordInput({ id, name, value, onChange, placeholder, show, onToggle }) {
  return (
    <div className="relative">
      <input id={id} type={show ? 'text' : 'password'} name={name} value={value}
        onChange={onChange} required placeholder={placeholder} className="input-field pr-12" />
      <button type="button" onClick={onToggle}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-muted flex items-center p-1 transition-colors hover:text-accent">
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) { toast.error('Las contraseñas no coinciden'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('¡Cuenta creada! Bienvenido a SNEAK-OUT 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Error al crear la cuenta');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, var(--accent-glow2) 0%, transparent 70%)' }} />

      {/* Card */}
      <div className="card w-full max-w-md relative z-10 p-8 shadow-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-[1.6rem] font-black tracking-tight text-primary">
            SNEAK-<span className="text-accent">OUT</span>
          </span>
        </div>
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary mb-1.5">Crear Cuenta</h1>
          <p className="text-sm text-muted">Únete a la comunidad SNEAK-OUT</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Nombre</label>
            <input id="reg-name" type="text" name="name" value={form.name} onChange={handleChange}
              required placeholder="Tu nombre completo" className="input-field" />
          </div>
          <div className="mb-4">
            <label className="form-label">Email</label>
            <input id="reg-email" type="email" name="email" value={form.email} onChange={handleChange}
              required placeholder="tu@email.com" className="input-field" />
          </div>
          <div className="mb-4">
            <label className="form-label">Contraseña</label>
            <PasswordInput id="reg-password" name="password" value={form.password} onChange={handleChange}
              placeholder="Mínimo 8 caracteres" show={showPass} onToggle={() => setShowPass(!showPass)} />
          </div>
          <div className="mb-4">
            <label className="form-label">Confirmar Contraseña</label>
            <PasswordInput id="reg-password-confirm" name="password_confirmation" value={form.password_confirmation}
              onChange={handleChange} placeholder="Repite tu contraseña" show={showConf} onToggle={() => setShowConf(!showConf)} />
          </div>

          <button type="submit" disabled={loading}
            className={`btn-accent w-full py-3.5 text-base mb-6 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta ⚡'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted text-[0.8rem] whitespace-nowrap">O regístrate con</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            {[
              { label: 'Google', onClick: () => toast('Google OAuth no disponible en demo', { icon: 'ℹ️' }),
                icon: <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
              { label: 'Facebook', onClick: () => toast('Facebook OAuth no disponible en demo', { icon: 'ℹ️' }),
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
            ].map(({ label, onClick, icon }) => (
              <button key={label} type="button" onClick={onClick}
                className="flex items-center justify-center gap-2 py-2.5 bg-raised border border-border rounded-xl text-secondary text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-accent hover:text-primary">
                {icon}{label}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-muted mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-accent font-bold no-underline hover:text-accent-hover transition-colors">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
