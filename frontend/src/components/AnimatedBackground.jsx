export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Ambient light source — top-right, sky blue */}
      <div className="ambient-light ambient-light--tr" />
      {/* Ambient light source — bottom-left, cyan */}
      <div className="ambient-light ambient-light--bl" />
    </div>
  );
}


