import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

const LIGHTBULB_OFF = "/animations/lightbulb/lightbulb_off.png";
const LIGHTBULB_ON = "/animations/lightbulb/lightbulb_on.png";

/** Mad-lib word banks — tap one per row */
const MAD_VIBE = [
  "playful",
  "bold",
  "cozy",
  "premium",
  "quirky",
  "local",
  "minimal",
  "wild",
];
const MAD_BUSINESS = [
  "sticker shop",
  "online store",
  "studio",
  "brand",
  "side hustle",
  "small business",
  "maker shop",
  "creative project",
];
const MAD_LOVE = [
  "color",
  "custom touches",
  "making people smile",
  "quality",
  "fun",
  "community",
  "standing out",
  "keeping it real",
];

const MOCK_NAMES = [
  {
    name: "Peter's Sticker Shop",
    reason: "Alliteration using the 's' sound from his favorite words sticker and shop",
  },
  {
    name: "Stick With Pete",
    reason: "A playful twist on 'stick with it' — memorable and personal",
  },
  {
    name: "Pop & Peel",
    reason: "Captures the fun, tactile joy of stickers with a catchy rhyme",
  },
  {
    name: "The Sticky Lab",
    reason: "Suggests creativity and custom craftsmanship in a fun way",
  },
];

function MadLibWordBank({ label, value, options, onPick, slotKey }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-stone-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onPick(opt)}
            draggable
            onDragStart={(e) => {
              try {
                e.dataTransfer.setData(
                  "text/plain",
                  JSON.stringify({ slot: slotKey, value: opt })
                );
                e.dataTransfer.effectAllowed = "move";
              } catch {
                // Ignore; drag/drop may not be supported in this environment.
              }
            }}
            className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
              value === opt
                ? "border-red-500 bg-red-500 text-white"
                : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Shared layout wrapper ───────────────────────────────────────────────────
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}

// ─── Step 1: Choose path ─────────────────────────────────────────────────────
function StepChoose({ onBrainstorm, onHaveName }) {
  return (
    <Shell>
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh] gap-8">
        <button
          type="button"
          aria-label="Help me brainstorm"
          onClick={onBrainstorm}
          className="group flex flex-col items-center gap-5 rounded-3xl px-8 py-10 transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100"
        >
          <div className="relative h-36 w-36 shrink-0">
            <img
              src={LIGHTBULB_OFF}
              alt=""
              width={144}
              height={144}
              className="absolute inset-0 h-full w-full object-contain transition-opacity duration-200 group-hover:opacity-0 group-active:opacity-0 pointer-events-none select-none"
              draggable={false}
            />
            <img
              src={LIGHTBULB_ON}
              alt=""
              width={144}
              height={144}
              className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100 pointer-events-none select-none"
              draggable={false}
            />
          </div>
          <span className="text-2xl font-bold text-stone-800 transition-colors group-hover:text-red-600">
            Help me brainstorm
          </span>
        </button>

        <button
          type="button"
          onClick={onHaveName}
          className="text-sm text-stone-500 underline-offset-4 hover:text-stone-700 hover:underline"
        >
          I already have a name
        </button>
      </div>
    </Shell>
  );
}

// ─── Step 2: Brainstorm ───────────────────────────────────────────────────────
function StepBrainstorm({ onBack, onSelect }) {
  const [vibe, setVibe] = useState(null);
  const [biz, setBiz] = useState(null);
  const [love, setLove] = useState(null);
  const [extraNote, setExtraNote] = useState("");
  const [tailored, setTailored] = useState(null);
  const [tailorIndex, setTailorIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showOptionalNote, setShowOptionalNote] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState(null); // "vibe" | "biz" | "love" | null

  const pickSlotValue = (slot, value) => {
    if (slot === "vibe") setVibe(value);
    else if (slot === "biz") setBiz(value);
    else if (slot === "love") setLove(value);
  };

  const handleSlotDrop = (targetSlot, e) => {
    e.preventDefault();
    setDragOverSlot(null);

    const raw = e.dataTransfer.getData("text/plain");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.slot !== targetSlot) return;
      pickSlotValue(targetSlot, parsed.value);
    } catch {
      // Ignore invalid drag payload
    }
  };

  const madLibComplete = Boolean(vibe && biz && love);
  const canTailor = madLibComplete || extraNote.trim().length > 0;

  const handleTailor = () => {
    if (!canTailor) return;
    setLoading(true);
    setTimeout(() => {
      setTailored(MOCK_NAMES[tailorIndex % MOCK_NAMES.length]);
      setLoading(false);
    }, 800);
  };

  const handleShowAnotherTailored = () => {
    const next = tailorIndex + 1;
    setTailorIndex(next);
    setTailored(MOCK_NAMES[next % MOCK_NAMES.length]);
  };

  return (
    <Shell>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-stone-400 hover:text-stone-600 text-sm flex items-center gap-1 mb-4 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">
          Here are some ideas
        </h1>
        <p className="text-stone-500 text-base">
          Tap one to use it, or fill in the sentence below for ideas tuned to you.
        </p>
      </div>

      {/* Mad-lib refine */}
      <div className="border-t border-stone-100 pt-6">
        <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">
          Tune ideas to you
        </p>
        <p className="text-stone-600 text-base mb-4">
          Drag a chip into the sentence (or tap a chip) to fill the blanks.
        </p>

        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 mb-6 text-center text-stone-800 text-lg leading-relaxed">
          A{" "}
          <span
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragOverSlot("vibe")}
            onDragLeave={() =>
              setDragOverSlot((s) => (s === "vibe" ? null : s))
            }
            onDrop={(e) => handleSlotDrop("vibe", e)}
            role="button"
            tabIndex={0}
            className={`inline-flex items-center px-2 rounded-lg border transition-colors ${
              vibe
                ? "border-red-500 bg-white text-red-600 font-bold"
                : dragOverSlot === "vibe"
                  ? "border-red-300 bg-red-50 text-stone-600"
                  : "border-transparent bg-stone-50 text-stone-400"
            }`}
          >
            {vibe ?? "……"}
          </span>{" "}
          <span
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragOverSlot("biz")}
            onDragLeave={() =>
              setDragOverSlot((s) => (s === "biz" ? null : s))
            }
            onDrop={(e) => handleSlotDrop("biz", e)}
            role="button"
            tabIndex={0}
            className={`inline-flex items-center px-2 rounded-lg border transition-colors ${
              biz
                ? "border-red-500 bg-white text-red-600 font-bold"
                : dragOverSlot === "biz"
                  ? "border-red-300 bg-red-50 text-stone-600"
                  : "border-transparent bg-stone-50 text-stone-400"
            }`}
          >
            {biz ?? "……"}
          </span>{" "}
          for people who love{" "}
          <span
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragOverSlot("love")}
            onDragLeave={() =>
              setDragOverSlot((s) => (s === "love" ? null : s))
            }
            onDrop={(e) => handleSlotDrop("love", e)}
            role="button"
            tabIndex={0}
            className={`inline-flex items-center px-2 rounded-lg border transition-colors ${
              love
                ? "border-red-500 bg-white text-red-600 font-bold"
                : dragOverSlot === "love"
                  ? "border-red-300 bg-red-50 text-stone-600"
                  : "border-transparent bg-stone-50 text-stone-400"
            }`}
          >
            {love ?? "……"}
          </span>
          .
        </div>

        <MadLibWordBank
          label="How should it feel?"
          value={vibe}
          options={MAD_VIBE}
          onPick={(v) => setVibe(v)}
          slotKey="vibe"
        />
        <MadLibWordBank
          label="What kind of thing is it?"
          value={biz}
          options={MAD_BUSINESS}
          onPick={(v) => setBiz(v)}
          slotKey="biz"
        />
        <MadLibWordBank
          label="What do your people love?"
          value={love}
          options={MAD_LOVE}
          onPick={(v) => setLove(v)}
          slotKey="love"
        />

        {!showOptionalNote ? (
          <button
            type="button"
            onClick={() => setShowOptionalNote(true)}
            className="mb-4 text-sm text-stone-500 hover:text-stone-700 underline-offset-2 hover:underline"
          >
            Add a note (optional)
          </button>
        ) : (
          <div className="mb-4">
            <label className="text-sm font-medium text-stone-600 block mb-2">
              Anything else we should know?
            </label>
            <input
              type="text"
              value={extraNote}
              onChange={(e) => setExtraNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canTailor && handleTailor()}
              placeholder="e.g. rhymes, a name you almost picked…"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-300 bg-white text-base"
            />
          </div>
        )}

        {!madLibComplete && !extraNote.trim() && (
          <p className="text-sm text-stone-400 mb-3">
            Pick all three, or open “Add a note” and type a short hint.
          </p>
        )}

        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            onClick={handleTailor}
            disabled={!canTailor || loading}
            className={`flex-1 py-3 rounded-full font-semibold text-white transition-all text-base ${
              canTailor && !loading
                ? "bg-red-500 hover:bg-red-600 shadow-sm"
                : "bg-red-200 cursor-not-allowed"
            }`}
          >
            {loading ? "Thinking…" : "Get tailored ideas →"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-stone-400 hover:text-stone-600 text-sm whitespace-nowrap transition-colors"
          >
            I already have a name
          </button>
        </div>

        {tailored && (
          <div className="rounded-2xl border border-stone-200 overflow-hidden">
            <button
              type="button"
              onClick={() => onSelect(tailored.name)}
              className="w-full text-left p-5 hover:bg-stone-50 transition-colors"
            >
              <p className="font-bold text-stone-800 text-lg">{tailored.name}</p>
              <p className="text-stone-400 text-sm mt-1">{tailored.reason}</p>
            </button>
            <div className="border-t border-stone-100">
              <button
                type="button"
                onClick={handleShowAnotherTailored}
                className="w-full py-3 text-stone-500 hover:text-stone-700 text-sm transition-colors"
              >
                Show me another tailored idea
              </button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

// ─── Step 2b: Enter name manually ────────────────────────────────────────────
function StepEnterName({ onBack, onSelect }) {
  const [name, setName] = useState("");

  return (
    <Shell>
      <button
        onClick={onBack}
        className="text-stone-400 hover:text-stone-600 text-sm flex items-center gap-1 mb-6 transition-colors"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold text-stone-800 mb-2">
        What's your business name?
      </h1>
      <p className="text-stone-500 text-base mb-6">
        Type it in and we'll make it official.
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && name.trim() && onSelect(name.trim())}
        placeholder="e.g. Peter's Sticker Shop"
        className="w-full border-2 border-red-400 rounded-xl px-4 py-3 text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-red-300 mb-4 bg-white text-base"
        autoFocus
      />
      <button
        onClick={() => name.trim() && onSelect(name.trim())}
        disabled={!name.trim()}
        className={`w-full py-3 rounded-full font-semibold text-white transition-all text-base ${
          name.trim()
            ? "bg-red-500 hover:bg-red-600 shadow-sm"
            : "bg-red-200 cursor-not-allowed"
        }`}
      >
        Use this name →
      </button>
    </Shell>
  );
}

// ─── Step 3: Confirmation card ────────────────────────────────────────────────
function StepConfirm({ businessName, onLockIn, onGoBack }) {
  const year = new Date().getFullYear();
  const curtainTimerRef = useRef(null);
  // Start hidden; only show overlays when Curtains button is pressed.
  const [curtainFrame, setCurtainFrame] = useState(null); // null = hidden, 0..5 = frame
  const tasselTimerRef = useRef(null);
  // Start hidden; only show overlays when Curtains button is pressed.
  const [tasselFrame, setTasselFrame] = useState(null); // null = hidden, 1..7 = frame
  const [shimmerNonce, setShimmerNonce] = useState(0);
  const [namePopActive, setNamePopActive] = useState(false);

  useEffect(() => {
    return () => {
      if (curtainTimerRef.current) clearInterval(curtainTimerRef.current);
      if (tasselTimerRef.current) clearInterval(tasselTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!namePopActive) return;
    const t = setTimeout(() => setNamePopActive(false), 1800);
    return () => clearTimeout(t);
  }, [namePopActive]);

  const playCurtain = () => {
    // Restart from 00 on every click.
    if (curtainTimerRef.current) clearInterval(curtainTimerRef.current);

    setCurtainFrame(0);

    let frame = 0;
    curtainTimerRef.current = setInterval(() => {
      frame += 1;
      if (frame > 5) {
        clearInterval(curtainTimerRef.current);
        curtainTimerRef.current = null;
        setCurtainFrame(5);
        return;
      }
      setCurtainFrame(frame);
    }, 120);
  };

  const playTassels = () => {
    if (tasselTimerRef.current) clearInterval(tasselTimerRef.current);

    setTasselFrame(1);

    let frame = 1;
    tasselTimerRef.current = setInterval(() => {
      if (frame >= 7) {
        clearInterval(tasselTimerRef.current);
        tasselTimerRef.current = null;
        setTasselFrame(7);
        return;
      }
      frame += 1;
      setTasselFrame(frame);
    }, 120);
  };

  const curtainSrc =
    curtainFrame === null
      ? null
      : `/animations/curtain/${String(curtainFrame).padStart(
          2,
          "0"
        )}.png`;

  const tasselSrc =
    tasselFrame === null
      ? null
      : `/animations/tassels/${String(tasselFrame).padStart(2, "0")}.png`;

  const triggerShimmer = () => {
    // Shimmer is its own reveal mode: curtains/tassels should not show.
    if (curtainTimerRef.current) clearInterval(curtainTimerRef.current);
    if (tasselTimerRef.current) clearInterval(tasselTimerRef.current);
    curtainTimerRef.current = null;
    tasselTimerRef.current = null;

    setCurtainFrame(null);
    setTasselFrame(null);

    // Restart text sweep even if Shimmer is clicked again mid-animation.
    flushSync(() => setNamePopActive(false));
    setNamePopActive(true);
    setShimmerNonce((n) => n + 1);
  };

  const handleCurtainsClick = () => {
    playCurtain();
    playTassels();
  };

  return (
    <Shell>
      <button
        onClick={onGoBack}
        className="text-stone-400 hover:text-stone-600 text-sm flex items-center gap-1 mb-6 transition-colors"
      >
        ← Back
      </button>

      {/* Reveal control */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={handleCurtainsClick}
          className="px-3 py-1.5 rounded-full text-sm transition-all border border-red-500 bg-red-500 text-white hover:bg-red-600"
        >
          Curtains
        </button>
        <button
          type="button"
          onClick={triggerShimmer}
          className="px-3 py-1.5 rounded-full text-sm transition-all border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:border-stone-300"
        >
          Shimmer
        </button>
      </div>

      {/* Business card (click to play curtain 00 → 05) */}
      <div
        className="bg-white rounded-2xl border-t-4 border-red-500 shadow-md p-8 mb-6 text-center relative overflow-hidden"
        role="button"
        tabIndex={0}
        onClick={handleCurtainsClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleCurtainsClick();
        }}
      >
        <div className="relative z-0">
          {/* Traffic light dots */}
          <div className="flex justify-center gap-1.5 mb-5">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
          </div>
          <h2
            className={
              namePopActive
                ? "text-3xl font-bold leading-tight mb-3 business-name-shimmer-pop"
                : "text-3xl font-bold leading-tight mb-3 !text-stone-950"
            }
          >
            {businessName}
          </h2>

          <p className="text-stone-400 text-sm tracking-wide mb-5">
            est. {year} · Fashion
          </p>

          <div className="border-t border-stone-100 pt-5">
            <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-1">
              Founder &amp; CEO
            </p>
            <p className="font-bold text-stone-800 text-lg">Peter</p>
          </div>
        </div>

        {curtainSrc && (
          <img
            src={curtainSrc}
            alt=""
            draggable={false}
            className="absolute inset-0 z-10 w-full h-full object-cover pointer-events-none select-none"
          />
        )}

        {tasselSrc && (
          <div className="absolute inset-y-0 left-0 z-20 w-16 pointer-events-none select-none">
            <img
              src={tasselSrc}
              alt=""
              draggable={false}
              className="h-full w-full object-contain"
            />
          </div>
        )}

        {shimmerNonce > 0 && (
          <div
            key={shimmerNonce}
            className="absolute inset-0 z-30 pointer-events-none overflow-hidden"
          >
            <div className="shimmer-sweep" />
          </div>
        )}
      </div>

      <p className="text-center text-stone-500 text-base mb-4">
        That's a killer name. Lock it in?
      </p>

      <button
        onClick={onLockIn}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 rounded-full text-base transition-all shadow-sm mb-3"
      >
        Lock it in →
      </button>

      <button
        onClick={onGoBack}
        className="w-full text-stone-500 hover:text-stone-700 text-sm py-2 transition-colors"
      >
        Go back and change it
      </button>
    </Shell>
  );
}

// ─── Step 4: Success ─────────────────────────────────────────────────────────
function StepSuccess({ businessName }) {
  return (
    <Shell>
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">
          It's official!
        </h1>
        <p className="text-stone-500 text-base mb-6">
          <span className="font-semibold text-stone-700">{businessName}</span>{" "}
          is locked in. Time to build your brand.
        </p>
        <div className="bg-white border border-stone-200 rounded-2xl p-5 text-left">
          <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-3">
            Next up
          </p>
          {["Brand Studio", "Megaphone", "Product Lab"].map((step, i) => (
            <div key={step} className="flex items-center gap-3 py-2">
              <span className="w-7 h-7 rounded-full bg-stone-100 text-stone-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 3}
              </span>
              <span className="text-stone-700 font-medium">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// ─── Root orchestrator ────────────────────────────────────────────────────────
export default function BusinessNamingFlow() {
  const [step, setStep] = useState("choose"); // choose | brainstorm | enter | confirm | success
  const [chosenName, setChosenName] = useState("");
  const [nameSource, setNameSource] = useState("brainstorm"); // brainstorm | enter

  const handleSelect = (name, source) => {
    setChosenName(name);
    setNameSource(source);
    setStep("confirm");
  };

  if (step === "choose") {
    return (
      <StepChoose
        onBrainstorm={() => setStep("brainstorm")}
        onHaveName={() => setStep("enter")}
      />
    );
  }

  if (step === "brainstorm") {
    return (
      <StepBrainstorm
        onBack={() => setStep("choose")}
        onSelect={(name) => handleSelect(name, "brainstorm")}
      />
    );
  }

  if (step === "enter") {
    return (
      <StepEnterName
        onBack={() => setStep("choose")}
        onSelect={(name) => handleSelect(name, "enter")}
      />
    );
  }

  if (step === "confirm") {
    return (
      <StepConfirm
        businessName={chosenName}
        onLockIn={() => setStep("success")}
        onGoBack={() =>
          setStep(nameSource === "enter" ? "enter" : "brainstorm")
        }
      />
    );
  }

  return <StepSuccess businessName={chosenName} />;
}
