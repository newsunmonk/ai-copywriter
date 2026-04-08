import { useMemo, useState } from "react";
import CopyCard from "./components/CopyCard";
import FrameworkButton from "./components/FrameworkButton";
import LoadingSpinner from "./components/LoadingSpinner";
import { frameworks, industries, tones } from "./lib/constants";

const initialForm = {
  brandName: "",
  industry: industries[0],
  strengths: "",
  targetAudience: "",
  tone: tones[0],
  frameworks: ["AIDA"],
};

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const groupedCopies = useMemo(() => {
    return form.frameworks.map((framework) => ({
      framework,
      items: copies.filter((copy) => copy.framework === framework),
    }));
  }, [copies, form.frameworks]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleFramework = (key) => {
    setForm((current) => ({
      ...current,
      frameworks: [key],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setCopiedKey("");

    if (!form.brandName.trim() || !form.strengths.trim() || !form.targetAudience.trim()) {
      setError("브랜드명, 핵심 강점, 타겟 고객을 모두 입력해주세요.");
      return;
    }

    if (form.frameworks.length === 0) {
      setError("최소 1개 이상의 카피라이팅 프레임워크를 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/generate-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "카피 생성에 실패했습니다.");
      }

      setCopies(payload.copies || []);
    } catch (submitError) {
      setCopies([]);
      setError(submitError.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (item) => {
    const copyText = `[${item.framework} / 버전 ${item.version} / ${item.angle}]

헤드라인: ${item.headline}
본문: ${item.body}
CTA: ${item.cta}`;

    try {
      await navigator.clipboard.writeText(copyText);
      const key = `${item.framework}-${item.version}`;
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(""), 1800);
    } catch (copyError) {
      setError("클립보드 복사에 실패했습니다. 브라우저 권한을 확인해주세요.");
    }
  };

  const totalGenerated = copies.length;
  const selectedTone = form.tone;

  return (
    <div className="min-h-screen overflow-hidden bg-surface font-display text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(192,132,252,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_16%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative mx-auto max-w-[1480px] px-5 py-8 lg:px-8 xl:px-10">
        <header className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(10,10,14,0.92),rgba(26,18,44,0.88)_56%,rgba(46,20,72,0.9))] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] lg:p-10 xl:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.18),transparent_24%),linear-gradient(120deg,transparent,rgba(255,255,255,0.03),transparent)]" />
          <div className="absolute -right-12 top-10 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative grid gap-10 xl:grid-cols-[minmax(0,1.3fr)_360px] xl:items-end">
            <div>
              <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-[0.34em] text-purple-100/90 backdrop-blur-sm">
                Performance Copy Studio
              </div>
              <h1 className="mt-6 max-w-[900px] text-[2.9rem] font-semibold leading-[1.02] tracking-[-0.06em] text-white md:text-[4.3rem] xl:text-[5.2rem]">
                <span className="block">마케팅 전문가가 만든</span>
                <span className="mt-2 block bg-gradient-to-r from-white via-fuchsia-100 to-cyan-200 bg-clip-text text-transparent">
                  카피라이팅 워크스테이션
                </span>
              </h1>
              <p className="mt-6 max-w-[720px] text-[15px] leading-8 text-slate-300 md:text-base">
                브랜드 포지션, 고객 인사이트, 톤앤매너를 입력하면 Claude가 프레임워크별로 6개의 다른 앵글을 구성해
                바로 테스트 가능한 헤드라인, 본문, CTA 세트를 정리합니다.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Frameworks</div>
                  <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">6</div>
                  <div className="mt-1 text-sm text-slate-300">AIDA부터 스토리텔링까지 한 번에 비교</div>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Angles</div>
                  <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">6</div>
                  <div className="mt-1 text-sm text-slate-300">감정, 논리, 유머, 긴박감, 호기심, 사회적 증거</div>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Output</div>
                  <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{totalGenerated || 0}</div>
                  <div className="mt-1 text-sm text-slate-300">현재 세션에서 생성된 전체 카피 수</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5 backdrop-blur-sm">
                <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/80">Creative Direction</div>
                <div className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">지금 선택된 전략 조합</div>
                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <span>톤앤매너</span>
                    <span className="font-medium text-white">{selectedTone}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <span>선택 프레임워크</span>
                    <span className="font-medium text-white">{form.frameworks.length}개</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <span>예상 결과 카드</span>
                    <span className="font-medium text-white">{form.frameworks.length * 6}개</span>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.6rem] border border-fuchsia-400/20 bg-fuchsia-500/10 p-5">
                <div className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-200/80">How Teams Use It</div>
                <p className="mt-3 text-sm leading-7 text-fuchsia-50/90">
                  매체별 카피 초안 수집, A/B 테스트 후보 정리, 광고주 제안서용 카피 방향성 도출까지 한 화면에서 처리합니다.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-8 grid gap-8 xl:grid-cols-[430px_minmax(0,1fr)]">
          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(23,24,34,0.96),rgba(18,19,27,0.92))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.3)] backdrop-blur-md xl:sticky xl:top-8 xl:h-fit">
            <div className="mb-6">
              <div className="text-[11px] uppercase tracking-[0.3em] text-purple-300/70">Campaign Brief</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">브랜드 브리프 입력</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                제품의 매력 포인트와 타겟 고객을 정리하면, 캠페인에 맞는 카피 조합을 더 정교하게 뽑아낼 수 있습니다.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">브랜드명 또는 캠페인명</span>
                <input
                  name="brandName"
                  value={form.brandName}
                  onChange={handleChange}
                  placeholder="예: 루미에르 스킨 / 봄 시즌 런칭 캠페인"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-purple-400/60 focus:bg-white/[0.08] focus:ring-4 focus:ring-purple-500/10"
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">업종 카테고리</span>
                  <select
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-400/60 focus:bg-white/[0.08] focus:ring-4 focus:ring-purple-500/10"
                  >
                    {industries.map((industry) => (
                      <option key={industry} value={industry} className="bg-panel text-white">
                        {industry}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">브랜드 톤앤매너</span>
                  <select
                    name="tone"
                    value={form.tone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-400/60 focus:bg-white/[0.08] focus:ring-4 focus:ring-purple-500/10"
                  >
                    {tones.map((tone) => (
                      <option key={tone} value={tone} className="bg-panel text-white">
                        {tone}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">핵심 강점 및 세일즈 포인트</span>
                <textarea
                  name="strengths"
                  value={form.strengths}
                  onChange={handleChange}
                  rows="4"
                  placeholder="예: 7일 사용 후 보습 개선 수치 확보, 민감성 피부 대상 저자극 테스트 완료, 첫 구매 전환율이 높은 대표 상품"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-purple-400/60 focus:bg-white/[0.08] focus:ring-4 focus:ring-purple-500/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">핵심 타겟 고객</span>
                <textarea
                  name="targetAudience"
                  value={form.targetAudience}
                  onChange={handleChange}
                  rows="3"
                  placeholder="예: 빠르게 성과를 보고 싶고 구매 전 명확한 근거를 확인하는 20~30대 직장인 여성"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-purple-400/60 focus:bg-white/[0.08] focus:ring-4 focus:ring-purple-500/10"
                />
              </label>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">카피라이팅 프레임워크</span>
                    <span className="text-xs text-slate-400">
                      {form.frameworks[0] ? `${form.frameworks[0]} 선택됨` : "1개 선택"}
                    </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {frameworks.map((framework) => (
                    <FrameworkButton
                      key={framework.key}
                      framework={framework}
                      selected={form.frameworks.includes(framework.key)}
                      onToggle={toggleFramework}
                    />
                  ))}
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[linear-gradient(90deg,#7c3aed,#a855f7_52%,#22d3ee)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "마케팅 카피 조합 생성 중..." : "카피 초안 생성하기"}
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(21,22,31,0.92),rgba(16,17,24,0.9))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-purple-300/70">Generated Copy</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">실행 가능한 카피 초안</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  프레임워크별로 감정, 논리, 유머, 긴박감, 호기심, 사회적 증거 앵글을 나눠 바로 테스트할 수 있게 구성됩니다.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300">
                  총 {totalGenerated}개 결과
                </div>
                {copiedKey ? (
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-200">
                    {copiedKey} 저장 완료
                  </div>
                ) : null}
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : copies.length === 0 ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                <div className="max-w-md text-lg font-medium tracking-[-0.02em] text-white">
                  아직 생성된 카피 초안이 없습니다
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  왼쪽 브리프를 입력한 뒤 원하는 프레임워크를 선택하면, 실무형 카피 초안이 이 영역에 정리됩니다.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedCopies.map(
                  ({ framework, items }) =>
                    items.length > 0 && (
                      <div key={framework} className="rounded-[1.8rem] border border-white/8 bg-white/[0.025] p-5">
                        <div className="mb-5 flex items-center gap-3">
                          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{framework}</h3>
                          <div className="h-px flex-1 bg-gradient-to-r from-fuchsia-500/60 via-violet-500/40 to-transparent" />
                          <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-200">
                            {items.length}개 버전
                          </span>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                          {items.map((item) => (
                            <CopyCard
                              key={`${item.framework}-${item.version}`}
                              item={item}
                              onCopy={handleCopy}
                            />
                          ))}
                        </div>
                      </div>
                    ),
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
