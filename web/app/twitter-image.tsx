import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'EVPriceHunt - Compare Tesla Accessory Prices';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <span style={{ color: '#ffffff', fontSize: 72, fontWeight: 800 }}>
            EV
          </span>
          <span style={{ color: '#E82127', fontSize: 72, fontWeight: 800 }}>
            PriceHunt
          </span>
        </div>
        <div
          style={{
            color: '#ffffff',
            fontSize: 36,
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          Compare Tesla Accessory Prices
        </div>
        <div
          style={{
            color: '#9ca3af',
            fontSize: 24,
            textAlign: 'center',
          }}
        >
          Find the best deals with exclusive discount codes
        </div>
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 40,
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '12px 24px',
              borderRadius: 8,
              color: '#ffffff',
              fontSize: 20,
            }}
          >
            2700+ Products
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '12px 24px',
              borderRadius: 8,
              color: '#ffffff',
              fontSize: 20,
            }}
          >
            5+ Stores
          </div>
          <div
            style={{
              background: 'rgba(22, 163, 74, 0.2)',
              padding: '12px 24px',
              borderRadius: 8,
              color: '#16a34a',
              fontSize: 20,
            }}
          >
            Up to 20% Off
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
