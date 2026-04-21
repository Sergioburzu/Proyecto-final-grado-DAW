import { useNavigate } from 'react-router-dom';

export default function MiniProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/producto/${product.id}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '1',
          background: 'var(--bg-raised)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          marginBottom: '0.75rem',
          border: '1px solid var(--color-border)',
          transition: 'border-color 0.25s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
      >
        {product.stock <= 5 && product.stock > 0 && (
          <span style={{
            position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10,
            fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.5rem',
            background: 'var(--accent)', color: '#fff', borderRadius: '0.25rem',
          }}>
            BAJO STOCK
          </span>
        )}
        {product.stock === 0 && (
          <span style={{
            position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10,
            fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.5rem',
            background: 'var(--color-border2)', color: 'var(--text-muted)', borderRadius: '0.25rem',
          }}>
            AGOTADO
          </span>
        )}
        <img
          src={product.image_url || 'https://via.placeholder.com/300'}
          alt={product.name}
          style={{
            width: '100%', height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            padding: '0.75rem',
            transition: 'transform 0.4s',
            boxSizing: 'border-box',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>

      {/* Info */}
      <p style={{
        color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600,
        margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {product.name}
      </p>
      <p style={{
        color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 700, margin: '0.2rem 0 0',
      }}>
        {Number(product.price).toFixed(2)}€
      </p>

    </div>
  );
}
