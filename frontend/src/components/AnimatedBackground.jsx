export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Premium Sky-Blue / Cyan / Light-Blue animated background layers */}
      <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-sky-400/10 blur-[120px] animate-blob1" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-cyan-300/8 blur-[150px] animate-blob2" />
      <div className="absolute top-[30%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-blue-400/8 blur-[130px] animate-blob3" />
    </div>
  );
}

