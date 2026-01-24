'use client';

interface ProductSkeletonProps {
  count?: number;
  showFilters?: boolean;
}

export default function ProductSkeleton({ count = 12, showFilters = true }: ProductSkeletonProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: showFilters
          ? 'repeat(auto-fill, minmax(220px, 1fr))'
          : 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16,
      }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          style={{
            background: '#fff',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Image skeleton */}
          <div
            style={{
              aspectRatio: '4/3',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />

          {/* Content skeleton */}
          <div style={{ padding: 14 }}>
            {/* Source/Model line */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 12,
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
              <div
                style={{
                  width: 45,
                  height: 12,
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            </div>

            {/* Title lines */}
            <div
              style={{
                width: '100%',
                height: 14,
                borderRadius: 4,
                marginBottom: 6,
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <div
              style={{
                width: '75%',
                height: 14,
                borderRadius: 4,
                marginBottom: 12,
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />

            {/* Price */}
            <div
              style={{
                width: 60,
                height: 20,
                borderRadius: 4,
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>

          {/* Button skeleton */}
          <div style={{ padding: '0 14px 14px' }}>
            <div
              style={{
                width: '100%',
                height: 38,
                borderRadius: 8,
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
        </div>
      ))}

      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
    </div>
  );
}
