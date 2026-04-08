export default function CopyCard({ item, onCopy }) {
  const bodyLines = item.body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/15">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 opacity-80" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-purple-300/80">
            Version {item.version}
          </div>
          <div className="mt-2 inline-flex rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-200">
            {item.angle}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onCopy(item)}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-purple-400/50 hover:bg-purple-500/10"
        >
          카피 복사
        </button>
      </div>

      <h3 className="mt-6 text-[1.65rem] font-semibold leading-[1.35] tracking-[-0.03em] text-white">
        {item.headline}
      </h3>
      <div className="mt-5 flex-1 space-y-3 text-[15px] leading-7 text-slate-300">
        {bodyLines.map((line, index) => (
          <p key={`${item.framework}-${item.version}-${index}`} className="text-balance">
            {line}
          </p>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-purple-400/20 bg-black/20 px-4 py-3 backdrop-blur-sm">
        <div className="text-[11px] uppercase tracking-[0.24em] text-purple-200/70">CTA</div>
        <div className="mt-1 text-sm font-medium leading-6 text-purple-50">{item.cta}</div>
      </div>
    </article>
  );
}
