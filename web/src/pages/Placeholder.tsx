interface PlaceholderProps {
  title: string;
  description?: string;
}

export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <main style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      <p style={{ color: '#9C9A93', fontSize: '0.9rem', marginTop: '1rem' }}>
        Page placeholder — migration en cours.
      </p>
    </main>
  );
}
