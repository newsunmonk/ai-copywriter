export default function FrameworkButton({ framework, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(framework.key)}
      className={[
        "group relative overflow-hidden rounded-[1.4rem] border p-4 text-left transition-all duration-200",
        "bg-white/[0.035] hover:-translate-y-0.5 hover:border-accentSoft/40 hover:bg-white/[0.05]",
        selected
          ? "border-accent bg-gradient-to-br from-accent/25 via-accentDeep/10 to-cyan-400/10 shadow-glow"
          : "border-white/10",
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="text-lg font-semibold tracking-wide text-white">
          {framework.title}
        </div>
        <div
          className={[
            "mt-1 h-2.5 w-2.5 rounded-full transition",
            selected ? "bg-fuchsia-300 shadow-[0_0_18px_rgba(232,121,249,0.9)]" : "bg-white/20",
          ].join(" ")}
        />
      </div>
      <div
        className={[
          "mt-2 text-sm leading-relaxed",
          selected ? "text-purple-100" : "text-slate-400 group-hover:text-slate-300",
        ].join(" ")}
      >
        {framework.description}
      </div>
    </button>
  );
}
