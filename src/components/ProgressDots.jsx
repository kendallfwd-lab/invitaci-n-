export default function ProgressDots({ current }) {
  return (
    <div className="progress-dots" aria-label={`Paso ${current} de 4`}>
      {[1, 2, 3, 4].map((step) => (
        <span key={step} className={step <= current ? 'dot active' : 'dot'} />
      ))}
    </div>
  );
}
