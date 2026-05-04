import { useMemo, useRef, useState, type RefObject } from "react";

type Weights = {
  s: number;
  l: number;
  m: number;
};

type Question = {
  category: string;
  prompt: string;
  weights: Weights;
};

type QuestionWithId = Question & { id: number };

type Result = {
  sN: number;
  lN: number;
  mN: number;
  composition: PrototypeScore[];
  point: { x: number; y: number };
  categorySignals: CategorySignal[];
};

type PrototypeScore = {
  key: "para" | "indiv" | "abs" | "plur";
  label: string;
  shortLabel: string;
  color: string;
  description: string;
  score: number;
  proportion: number;
};

type CategorySignal = {
  category: string;
  sN: number;
  lN: number;
  mN: number;
  strongest: string;
  strength: number;
};

const SCALE = [
  { label: "Strongly disagree", short: "SD", value: -2 },
  { label: "Disagree", short: "D", value: -1 },
  { label: "Neutral", short: "N", value: 0 },
  { label: "Agree", short: "A", value: 1 },
  { label: "Strongly agree", short: "SA", value: 2 },
] as const;

// All questions in one place - just edit/add/remove here
// IDs are auto-generated based on array position (starting at 1)
const QUESTIONS: Question[] = [
 //Bio-pyschological level
  //Conscientiousness spectrum
 {
    category: "Bio-pyschological",
    prompt:
      "I find deep personal satisfaction in fulfilling non-mandatory, inhertied duties and obligations",
    weights: { s: -2, l: 0, m: 0 },
  },
   {
    category: "Bio-pyschological",
    prompt:
      "I enjoy organising myself for the sake of being organised.",
    weights: { s: -2, l: 0, m: 0 },
  },
   {
    category: "Bio-pyschological",
    prompt:
      "I dislike non-mandatory hardwork and prefer to pass responsibility onto someone else for the sake of avoiding difficult tasks.",
    weights: { s: 2, l: 0, m: 0 },
  },
     {
    category: "Bio-pyschological",
    prompt:
      "I make no attempt to organise myself beyond the bare minimum because I see no point in doing so.",
    weights: { s: 2, l: 0, m: 0 },
  },
  //Novelty seeking <-> Routine spectrum
     {
    category: "Bio-pyschological",
    prompt:
      "I prefer novel environments over stable, consistent ones.",
    weights: { s: 2, l: 0, m: 0 },
  },
     {
    category: "Bio-pyschological",
    prompt:
      "I enjoy seeking new experiences.",
    weights: { s: 2, l: 0, m: 0 },
  },
    {
    category: "Bio-pyschological",
    prompt:
      "I prefer environments I'm used to.",
    weights: { s: -2, l: 0, m: 0 },
  },
    {
    category: "Bio-pyschological",
    prompt:
      "I would rather go to a restaurant I know I enjoy rather than one I may enjoy.",
    weights: { s: -2, l: 0, m: 0 },
  },
  //Abstractism spectrum
    {
    category: "Bio-pyschological",
    prompt:
      "I enjoy highly theoretical topics of conversation.",
    weights: { s: 2, l: 0, m: 0 },
  },
    {
    category: "Bio-pyschological",
    prompt:
      "I'd rather discuss concrete matters than abstract notions.",
    weights: { s: -2, l: 0, m: 0 },
  },
    {
    category: "Bio-pyschological",
    prompt:
      "I am okay working in abmiguity.",
    weights: { s: 2, l: 0, m: 0 },
  },
    {
    category: "Bio-pyschological",
    prompt:
      "I am okay not knowing how things work, it makes no difference to me.",
    weights: { s: 2, l: 0, m: 0 },
  },
    //Openness
    {
    category: "Bio-pyschological",
    prompt:
      "I am generally open to new ideas.",
    weights: { s: 2, l: 0, m: 0 },
  },
    {
    category: "Bio-pyschological",
    prompt:
      "At work, I'd rather do things my way than listen to others speculate on how we could do it better.",
    weights: { s: -2, l: 0, m: 0 },
  },
    {
    category: "Bio-pyschological",
    prompt:
      "I think being close-minded is archaic.",
    weights: { s: 2, l: 0, m: 0 },
  },
  {
    category: "Bio-pyschological",
    prompt:
      "I make the effort of putting myself in other's shoes.",
    weights: { s: 2, l: 0, m: 0 },
  },
//Moral Ideological level
{
    category: "Moral-Ideological",
    prompt:
      "What makes us the same is more important than what makes us different.",
    weights: { s: 0, l: 2, m: 0 },
  },
  {
    category: "Moral-Ideological",
    prompt:
      "Humans are a blank slate with no discernable biological differences.",
    weights: { s: 0, l: 2, m: 0 },
  },
{
    category: "Moral-Ideological",
    prompt:
      "The outcome for the individual is more important than the outcome for the group.",
    weights: { s: 0, l: 2, m: 0 },
  },
{
    category: "Moral-Ideological",
    prompt:
      "A man's groupish instincts should be respected and implemented in society.",
    weights: { s: 0, l: -2, m: 0 },
  },
{
    category: "Moral-Ideological",
    prompt:
      "A wise reformer can redesign a society more aptly than a traditionalist ever could.",
    weights: { s: 0, l: 2, m: 0 },
  },
{
    category: "Moral-Ideological",
    prompt:
      "Tradition has a value in and of itself.",
    weights: { s: 0, l: -2, m: 0 },
  },
  {
    category: "Moral-Ideological",
    prompt:
      "Something's age more accurately predicts it's lifespan than other metrics.",
    weights: { s: 0, l: -2, m: 0 },
  },
  {
    category: "Moral-Ideological",
    prompt:
      "The future has to become more progressive and equitable for it to be a good future.",
    weights: { s: 0, l: 2, m: 0 },
  },
  {
    category: "Moral-Ideological",
    prompt:
      "Civil law must align with natural law.",
    weights: { s: 0, l: -2, m: 0 },
  },
  {
    category: "Moral-Ideological",
    prompt:
      "There are real biological differences between gender and race that no policy can remove.",
    weights: { s: 0, l: -2, m: 0 },
  },
//Monism vs GES
{
    category: "Politco-Structural",
    prompt:
      "Having an administrative entity is a general positive at a civilisational level, even if it costs the local culture.",
    weights: { s: 0, l: 0, m: 2 },
  },
  {
    category: "Politco-Structural",
    prompt:
      "Hierarchical authority is better than heterarchical authority.",
    weights: { s: 0, l: 0, m: 2 },
  },
    {
    category: "Politco-Structural",
    prompt:
      "There is some merit in a single governing entity",
    weights: { s: 0, l: 0, m: 1 },
  },
    {
    category: "Politco-Structural",
    prompt:
      "There is merit in a benevolent dictator.",
    weights: { s: 0, l: 0, m: 2 },
  },
    {
    category: "Politco-Structural",
    prompt:
      "I would rather live under a single authority than a collection of equally responsible authorities.",
    weights: { s: 0, l: 0, m: 2 },
  },
    {
    category: "Politco-Structural",
    prompt:
      "I don't believe any form of governance.",
    weights: { s: 0, l: 0, m: 2 },
  },
    ///Real world policy
{
    category: "Policy",
    prompt:
      "I agree with opening our borders to countries of different race.",
    weights: { s: 0, l: 2, m: 0 },
  },
{
    category: "Policy",
    prompt:
      "I think the government should impose hate laws to protect minorities.",
    weights: { s: 0, l: 2, m: 2 },
  },
{
    category: "Policy",
    prompt:
      "I think multiculturalism is good.",
    weights: { s: 0, l: 2, m: 0 },
  },
   {
    category: "Policy",
    prompt:
      "If a free-market was to exist, it should exist for the purpose of advancing humanity rather than share-holders.",
    weights: { s: 0, l: -2, m: 0 },
  },
];

const PROTOTYPES = {
  para: {
    label: "Parasitic Left",
    shortLabel: "Redistributive monist",
    color: "#b84a6a",
    description:
      "Spatial, liberal, and monist. This corner emphasizes universal equality, centralized redistribution, and the use of moral pressure or state capacity to dissolve inherited distinctions.",
  },
  indiv: {
    label: "Individualist",
    shortLabel: "Autonomy and market",
    color: "#d8b34a",
    description:
      "Spatial and liberal with an anti-corporate or anti-state reflex. This corner prioritizes exit, contract, price signals, and personal autonomy over inherited duties or thick intermediary bodies.",
  },
  abs: {
    label: "Absolutist Right",
    shortLabel: "Centralized temporal order",
    color: "#4a7bb8",
    description:
      "Temporal, illiberal, and monist. This corner favors hierarchy, loyalty, duty, and a strong center able to impose unity, especially during consolidation or crisis.",
  },
  plur: {
    label: "Pluralist Right",
    shortLabel: "The deep center",
    color: "#6fbf73",
    description:
      "Temporal, illiberal, and pluralist. This corner favors layered sovereignty, corporate bodies, local law, rooted authority, and multiple centers of power able to check each other.",
  },

} as const;

const TRIANGLE_POINTS = {
  para: { x: 82, y: 92 },
  indiv: { x: 418, y: 92 },
  abs: { x: 250, y: 380 },
  plur: { x: 250, y: 492 },
} as const;

export default function App() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [missingId, setMissingId] = useState<number | null>(null);
  const questionRefs = useRef<Record<number, HTMLFieldSetElement | null>>({});
  const resultRef = useRef<HTMLElement | null>(null);

  // Automatically assign IDs based on array position (starting at 1)
  const questionsWithIds = useMemo<QuestionWithId[]>(
    () => QUESTIONS.map((question, index) => ({ ...question, id: index + 1 })),
    []
  );

  const categories = useMemo(
    () => Array.from(new Set(questionsWithIds.map((question) => question.category))),
    [questionsWithIds]
  );

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questionsWithIds.length) * 100;

  const groupedQuestions = useMemo(
    () =>
      categories.map((category) => ({
        category,
        questions: questionsWithIds.filter((question) => question.category === category),
      })),
    [categories, questionsWithIds]
  );

  function setAnswer(questionId: number, value: number) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    if (missingId === questionId) setMissingId(null);
  }

  function revealResult() {
    const firstMissing = questionsWithIds.find(
      (question) => answers[question.id] === undefined
    );

    if (firstMissing) {
      setMissingId(firstMissing.id);
      questionRefs.current[firstMissing.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const nextResult = scoreQuiz(answers, questionsWithIds);
    setResult(nextResult);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0e0e12] text-[#e8e6df]">
      <Hero progress={progress} />

      <section id="quiz" className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-[#0e0e12]/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="mx-auto flex max-w-5xl items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-[#8a8780]">
                  <span>Question progress</span>
                  <span>
                    {answeredCount}/{questionsWithIds.length}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#c9a96b] transition-[width] duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={revealResult}
                className="hidden rounded-full bg-[#c9a96b] px-5 py-2.5 text-sm font-bold text-[#0e0e12] transition hover:bg-[#d9b97b] focus:outline-none focus:ring-2 focus:ring-[#c9a96b] focus:ring-offset-2 focus:ring-offset-[#0e0e12] sm:inline-flex"
              >
                Reveal
              </button>
            </div>
          </div>

          <div className="py-10">
            <p className="mb-3 text-sm uppercase tracking-[0.28em] text-[#c9a96b]">Expanded diagnostic</p>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Sixty-five statements across temperament, doctrine, institutions, law, markets, and scale.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#aaa69c]">
              Answer every item. The scoring still maps to the three original axes: temporal to spatial,
              illiberal to liberal, and pluralist to monist.
            </p>
          </div>

          <form className="space-y-12" onSubmit={(event) => event.preventDefault()}>
            {groupedQuestions.map((group) => (
              <section key={group.category} aria-labelledby={slug(group.category)}>
                <div className="mb-5 flex flex-col gap-2 border-l-2 border-[#c9a96b] pl-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#8a8780]">Lens</p>
                    <h3 id={slug(group.category)} className="text-2xl font-semibold text-white">
                      {group.category}
                    </h3>
                  </div>
                  <p className="text-sm text-[#8a8780]">{group.questions.length} questions</p>
                </div>

                <div className="space-y-4">
                  {group.questions.map((question) => (
                    <fieldset
                      key={question.id}
                      ref={(node) => {
                        questionRefs.current[question.id] = node;
                      }}
                      className={`rounded-md border bg-[#16161d] p-4 transition duration-200 sm:p-5 ${
                        missingId === question.id
                          ? "border-[#c9a96b] shadow-[0_0_0_1px_rgba(201,169,107,0.55)]"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <legend className="mb-4 block w-full text-base leading-7 text-[#f2efe6]">
                        <span className="mr-2 font-semibold text-[#c9a96b]">{question.id}.</span>
                        {question.prompt}
                      </legend>
                      <div className="grid gap-2 sm:grid-cols-5">
                        {SCALE.map((option) => {
                          const inputId = `q${question.id}-${option.value}`;

                          return (
                            <label
                              key={option.value}
                              htmlFor={inputId}
                              className="group flex min-h-12 cursor-pointer items-center justify-between rounded-md border border-white/10 bg-[#1f1f28] px-3 py-3 text-left transition hover:border-[#c9a96b]/60 hover:bg-[#262631] sm:block sm:text-center"
                            >
                              <input
                                id={inputId}
                                type="radio"
                                name={`question-${question.id}`}
                                value={option.value}
                                checked={answers[question.id] === option.value}
                                onChange={() => setAnswer(question.id, option.value)}
                                className="peer sr-only"
                              />
                              <span className="text-sm text-[#c4c2bb] transition peer-checked:font-bold peer-checked:text-[#c9a96b]">
                                <span className="hidden sm:inline">{option.label}</span>
                                <span className="sm:hidden">{option.short}</span>
                              </span>
                              <span className="h-2.5 w-2.5 rounded-full bg-white/10 transition peer-checked:bg-[#c9a96b] sm:mx-auto sm:mt-2 sm:block" />
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </section>
            ))}

            <div className="flex flex-col items-center gap-3 pt-2">
              {missingId ? (
                <p className="text-center text-sm text-[#c9a96b]">
                  Question {missingId} still needs an answer before scoring.
                </p>
              ) : null}
              <button
                type="button"
                onClick={revealResult}
                className="w-full max-w-sm rounded-full bg-[#c9a96b] px-8 py-4 text-base font-bold text-[#0e0e12] transition hover:-translate-y-0.5 hover:bg-[#d9b97b] hover:shadow-[0_18px_45px_rgba(201,169,107,0.22)] focus:outline-none focus:ring-2 focus:ring-[#c9a96b] focus:ring-offset-2 focus:ring-offset-[#0e0e12]"
              >
                Reveal My Position
              </button>
            </div>
          </form>
        </div>
      </section>

      {result ? <ResultsSection result={result} resultRef={resultRef} /> : null}

      <footer className="px-4 pb-10 pt-6 text-center text-xs leading-6 text-[#77736b] sm:px-6">
        This is a model-based diagnostic for discussion, not a scientific personality instrument.
      </footer>
    </main>
  );
}

function Hero({ progress }: { progress: number }) {
  return (
    <section className="relative flex min-h-[82vh] items-center px-4 py-14 sm:px-6 lg:px-8">
      <div className="ambient-orb absolute left-[-12rem] top-[-10rem] h-96 w-96 rounded-full bg-[#c9a96b]/16 blur-3xl" />
      <div className="ambient-orb absolute bottom-[-14rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[#4a7bb8]/14 blur-3xl [animation-delay:2s]" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative z-10">
          <p className="mb-4 text-sm uppercase tracking-[0.32em] text-[#c9a96b]">Expanded framework</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            The Political Triangle Test
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#bdb8ad]">
            A wider diagnostic across three axes: bio-psychological temperament, moral doctrine, and the
            structure of political power.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#quiz"
              className="inline-flex items-center justify-center rounded-full bg-[#c9a96b] px-6 py-3 font-bold text-[#0e0e12] transition hover:-translate-y-0.5 hover:bg-[#d9b97b]"
            >
              Start The Questions
            </a>
            <a
              href="#method"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 font-bold text-[#e8e6df] transition hover:border-[#c9a96b]/70 hover:text-[#c9a96b]"
            >
              See The Axes
            </a>
          </div>
        </div>

        <div id="method" className="relative min-h-[360px] lg:min-h-[520px]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px] opacity-50 [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
          <TriangleGraphic progress={progress} />
        </div>
      </div>
    </section>
  );
}

function TriangleGraphic({ progress }: { progress: number }) {
  return (
    <svg className="relative z-10 h-full w-full overflow-visible" viewBox="0 0 500 500" role="img" aria-label="Political triangle model">
      <defs>
        <linearGradient id="triangleStroke" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#b84a6a" />
          <stop offset="45%" stopColor="#c9a96b" />
          <stop offset="100%" stopColor="#4a7bb8" />
        </linearGradient>
      </defs>

      <polygon
        points={`${TRIANGLE_POINTS.para.x},${TRIANGLE_POINTS.para.y} ${TRIANGLE_POINTS.indiv.x},${TRIANGLE_POINTS.indiv.y} ${TRIANGLE_POINTS.abs.x},${TRIANGLE_POINTS.abs.y}`}
        fill="rgba(201,169,107,0.06)"
        stroke="url(#triangleStroke)"
        strokeWidth="2"
      />
      <ellipse
        cx={TRIANGLE_POINTS.plur.x}
        cy={TRIANGLE_POINTS.plur.y}
        rx="166"
        ry="28"
        fill="rgba(111,191,115,0.1)"
        stroke="#6fbf73"
        strokeDasharray="6 5"
        strokeWidth="1.5"
      />
      <line x1="250" y1="92" x2="250" y2="442" stroke="rgba(232,230,223,0.12)" strokeDasharray="5 7" />
      <line x1="82" y1="92" x2="418" y2="92" stroke="rgba(232,230,223,0.12)" strokeDasharray="5 7" />

      <CornerLabel x={82} y={54} color="#b84a6a" title="Parasitic" subtitle="far-left" />
      <CornerLabel x={418} y={54} color="#d8b34a" title="Individualist" subtitle="libertarian" />
      <CornerLabel x={250} y={418} color="#4a7bb8" title="Absolutist" subtitle="monist right" />
      <CornerLabel x={250} y={492} color="#6fbf73" title="Pluralist" subtitle="deep center"  />

      <circle cx="250" cy="238" r="6" fill="#c9a96b" opacity="0.8" />
      <circle
        className="marker-pulse"
        cx="250"
        cy="238"
        r={10 + progress / 18}
        fill="none"
        stroke="#c9a96b"
        strokeWidth="1.5"
        opacity="0.45"
      />
    </svg>
  );
}

function CornerLabel({ x, y, color, title, subtitle }: { x: number; y: number; color: string; title: string; subtitle: string }) {
  return (
    <g>
      <text x={x} y={y} textAnchor="middle" fill={color} fontSize="15" fontWeight="700" letterSpacing="1.5">
        {title.toUpperCase()}
      </text>
      <text x={x} y={y + 16} textAnchor="middle" fill="#8a8780" fontSize="11" fontStyle="italic">
        {subtitle}
      </text>
    </g>
  );
}

function ResultsSection({ result, resultRef }: { result: Result; resultRef: RefObject<HTMLElement | null> }) {
  const dominant = result.composition[0];

  return (
    <section ref={resultRef} className="result-rise px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-lg border border-white/10 bg-[#16161d] p-5 shadow-2xl shadow-black/30 sm:p-8">
        <p className="mb-3 text-lg uppercase tracking-[0.28em] text-[#c9a96b]">Your position</p>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div
              className="mb-5 inline-flex rounded-full px-4 py-2 text-lg font-bold text-[#0e0e12]"
              style={{ backgroundColor: dominant.color }}
            >
              Closest corner: {dominant.label}
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{dominant.shortLabel}</h2>
            <p className="mt-4 leading-7 text-[#c4c2bb]">{dominant.description}</p>
            <p className="mt-4 text-sm leading-6 text-[#8a8780]">
              Clarity: {formatPercent(dominant.proportion)} of your four-corner composition. If the top two
              corners are close, read this as a mixed profile rather than a hard label.
            </p>
          </div>

          <ResultTriangle result={result} />
        </div>

        <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h3 className="mb-4 text-xl font-semibold text-white">Axis Readout</h3>
            <div className="space-y-5">
              <AxisBar left="Temporal" right="Spatial" value={result.sN} />
              <AxisBar left="Illiberal" right="Liberal" value={result.lN} />
              <AxisBar left="Pluralist" right="Monist" value={result.mN} />
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-white">Composition</h3>
            <div className="space-y-3">
              {result.composition.map((item) => (
                <div key={item.key}>
                  <div className="mb-1 flex items-center justify-between text-sm text-[#c4c2bb]">
                    <span>{item.label}</span>
                    <span>{formatPercent(item.proportion)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{ width: `${item.proportion * 100}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-9">
          <h3 className="mb-4 text-xl font-semibold text-white">Widest Pulls By Question Family</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {result.categorySignals.map((signal) => (
              <div key={signal.category} className="rounded-md border border-white/10 bg-[#1f1f28] p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="font-semibold text-[#f2efe6]">{signal.category}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-[#c9a96b]">{signal.strongest}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-[#8a8780]">
                  <span>S {formatSigned(signal.sN)}</span>
                  <span>L {formatSigned(signal.lN)}</span>
                  <span>M {formatSigned(signal.mN)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultTriangle({ result }: { result: Result }) {
  const dominant = result.composition[0];

  return (
    <svg className="w-full overflow-visible" viewBox="0 0 500 500" role="img" aria-label="Your plotted result on the political triangle">
      <polygon
        points={`${TRIANGLE_POINTS.para.x},${TRIANGLE_POINTS.para.y} ${TRIANGLE_POINTS.indiv.x},${TRIANGLE_POINTS.indiv.y} ${TRIANGLE_POINTS.abs.x},${TRIANGLE_POINTS.abs.y}`}
        fill="rgba(201,169,107,0.06)"
        stroke="url(#triangleStroke)"
        strokeWidth="2"
      />
      <ellipse
        cx={TRIANGLE_POINTS.plur.x}
        cy={TRIANGLE_POINTS.plur.y}
        rx="166"
        ry="28"
        fill="rgba(111,191,115,0.1)"
        stroke="#6fbf73"
        strokeDasharray="6 5"
        strokeWidth="1.5"
      />

      <CornerLabel x={82} y={54} color="#b84a6a" title="Parasitic" subtitle="far-left" />
      <CornerLabel x={418} y={54} color="#d8b34a" title="Individualist" subtitle="libertarian" />
      <CornerLabel x={250} y={418} color="#4a7bb8" title="Absolutist" subtitle="monist right" />
      <CornerLabel x={250} y={492} color="#6fbf73" title="Pluralist" subtitle="deep center" />

      <circle cx={result.point.x} cy={result.point.y} r="10" fill={dominant.color} stroke="#ffffff" strokeWidth="2" />
      <circle
        className="marker-pulse"
        cx={result.point.x}
        cy={result.point.y}
        r="18"
        fill="none"
        stroke={dominant.color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function AxisBar({ left, right, value }: { left: string; right: string; value: number }) {
  const fillLeft = value < 0 ? `${50 + value * 50}%` : "50%";
  const fillWidth = `${Math.abs(value) * 50}%`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm text-[#8a8780]">
        <span>{left}</span>
        <span className="font-semibold text-[#c9a96b]">{formatSigned(value)}</span>
        <span>{right}</span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/30" />
        <div
          className="absolute top-0 h-full rounded-full bg-gradient-to-r from-[#c9a96b] to-[#d9b97b] transition-all duration-700 ease-out"
          style={{ left: fillLeft, width: fillWidth }}
        />
      </div>
    </div>
  );
}

// Updated scoreQuiz to accept questionsWithIds as a parameter
function scoreQuiz(answers: Record<number, number>, questions: QuestionWithId[]): Result {
  const totals = questions.reduce(
    (acc, question) => {
      const answer = answers[question.id] ?? 0;

      acc.s += answer * question.weights.s;
      acc.l += answer * question.weights.l;
      acc.m += answer * question.weights.m;
      acc.sMax += 2 * Math.abs(question.weights.s);
      acc.lMax += 2 * Math.abs(question.weights.l);
      acc.mMax += 2 * Math.abs(question.weights.m);
      return acc;
    },
    { s: 0, l: 0, m: 0, sMax: 0, lMax: 0, mMax: 0 }
  );

  const sN = normalize(totals.s, totals.sMax);
  const lN = normalize(totals.l, totals.lMax);
  const mN = normalize(totals.m, totals.mMax);
  const composition = getComposition(sN, lN, mN);
  const point = getPoint(composition);
  const categorySignals = getCategorySignals(answers, questions);

  return { sN, lN, mN, composition, point, categorySignals };
}

function getComposition(sN: number, lN: number, mN: number): PrototypeScore[] {
  const spatial = clamp01((sN + 1) / 2);
  const temporal = clamp01((1 - sN) / 2);
  const liberal = clamp01((lN + 1) / 2);
  const illiberal = clamp01((1 - lN) / 2);
  const monist = clamp01((mN + 1) / 2);
  const pluralist = clamp01((1 - mN) / 2);

  const raw = [
    { key: "para" as const, score: spatial * liberal * monist },
    { key: "indiv" as const, score: spatial * liberal * pluralist },
    { key: "abs" as const, score: temporal * illiberal * monist },
    { key: "plur" as const, score: temporal * illiberal * pluralist },
  ];
  const total = raw.reduce((sum, item) => sum + item.score, 0) || 1;

  return raw
    .map((item) => ({ ...PROTOTYPES[item.key], ...item, proportion: item.score / total }))
    .sort((a, b) => b.proportion - a.proportion);
}

function getPoint(composition: PrototypeScore[]) {
  return composition.reduce(
    (point, item) => {
      const corner = TRIANGLE_POINTS[item.key];
      point.x += corner.x * item.proportion;
      point.y += corner.y * item.proportion;
      return point;
    },
    { x: 0, y: 0 }
  );
}

// Updated getCategorySignals to accept questions as a parameter
function getCategorySignals(answers: Record<number, number>, questions: QuestionWithId[]): CategorySignal[] {
  const categories = Array.from(new Set(questions.map((q) => q.category)));
  
  return categories.map((category) => {
    const categoryQuestions = questions.filter((question) => question.category === category);
    const totals = categoryQuestions.reduce(
      (acc, question) => {
        const answer = answers[question.id] ?? 0;

        acc.s += answer * question.weights.s;
        acc.l += answer * question.weights.l;
        acc.m += answer * question.weights.m;
        acc.sMax += 2 * Math.abs(question.weights.s);
        acc.lMax += 2 * Math.abs(question.weights.l);
        acc.mMax += 2 * Math.abs(question.weights.m);
        return acc;
      },
      { s: 0, l: 0, m: 0, sMax: 0, lMax: 0, mMax: 0 }
    );

    const sN = normalize(totals.s, totals.sMax);
    const lN = normalize(totals.l, totals.lMax);
    const mN = normalize(totals.m, totals.mMax);
    const pulls = [
      { label: sN >= 0 ? "Spatial" : "Temporal", value: Math.abs(sN) },
      { label: lN >= 0 ? "Liberal" : "Illiberal", value: Math.abs(lN) },
      { label: mN >= 0 ? "Monist" : "Pluralist", value: Math.abs(mN) },
    ].sort((a, b) => b.value - a.value);

    return {
      category,
      sN,
      lN,
      mN,
      strongest: pulls[0].label,
      strength: pulls[0].value,
    };
  });
}

function normalize(total: number, max: number) {
  return max === 0 ? 0 : clamp(total / max, -1, 1);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number) {
  return clamp(value, 0, 1);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatSigned(value: number) {
  const rounded = Math.round(value * 100);
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}