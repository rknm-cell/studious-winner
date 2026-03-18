import { useState } from "react";

const SUGGESTION_TAGS = ["stickers", "custom", "colorful", "fun", "sticky", "pop"];

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

// ─── Shared layout wrapper ───────────────────────────────────────────────────
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}

// ─── Step 1: Choose path ─────────────────────────────────────────────────────
function StepChoose({ onBrainstorm, onHaveName }) {
  return (
    <Shell>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">
          Let's name your business!
        </h1>
        <p className="text-stone-500 text-base">
          Already have a name in mind, or want us to help brainstorm one?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* I have a name */}
        <button
          onClick={onHaveName}
          className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col items-center gap-3 hover:shadow-md hover:border-stone-300 transition-all text-left group"
        >
          <span className="text-3xl">🎯</span>
          <div>
            <p className="font-bold text-stone-800 group-hover:text-red-600 transition-colors">
              I have a name
            </p>
            <p className="text-stone-400 text-sm mt-0.5">
              I know what I want to call it
            </p>
          </div>
        </button>

        {/* Help me brainstorm */}
        <button
          onClick={onBrainstorm}
          className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col items-center gap-3 hover:shadow-md hover:border-stone-300 transition-all text-left group"
        >
          <span className="text-3xl">💡</span>
          <div>
            <p className="font-bold text-stone-800 group-hover:text-red-600 transition-colors">
              Help me brainstorm
            </p>
            <p className="text-stone-400 text-sm mt-0.5">
              Give me some words and I'll get creative
            </p>
          </div>
        </button>
      </div>
    </Shell>
  );
}

// ─── Step 2: Brainstorm ───────────────────────────────────────────────────────
function StepBrainstorm({ onBack, onSelect }) {
  const [input, setInput] = useState("");
  const [tags, setTags] = useState([]);
  const [result, setResult] = useState(null);
  const [nameIndex, setNameIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleBrainstorm = () => {
    if (!input.trim() && tags.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      setResult(MOCK_NAMES[nameIndex % MOCK_NAMES.length]);
      setLoading(false);
    }, 800);
  };

  const handleShowAnother = () => {
    const next = nameIndex + 1;
    setNameIndex(next);
    setResult(MOCK_NAMES[next % MOCK_NAMES.length]);
  };

  const canBrainstorm = input.trim().length > 0 || tags.length > 0;

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
          Let's name your business!
        </h1>
        <p className="text-stone-500 text-base">
          Give us some words — feelings, places, things you love — and we'll
          mash them into name ideas.
        </p>
      </div>

      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleBrainstorm()}
        placeholder="e.g. words, feelings, or things you love"
        className="w-full border-2 border-red-400 rounded-xl px-4 py-3 text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-red-300 mb-3 bg-white text-base"
      />

      {/* Tag pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {SUGGESTION_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-4 py-1.5 rounded-full border text-sm transition-all ${
              tags.includes(tag)
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-stone-600 border-stone-300 hover:border-stone-400"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* CTA row */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBrainstorm}
          disabled={!canBrainstorm || loading}
          className={`flex-1 py-3 rounded-full font-semibold text-white transition-all text-base ${
            canBrainstorm && !loading
              ? "bg-red-500 hover:bg-red-600 shadow-sm"
              : "bg-red-200 cursor-not-allowed"
          }`}
        >
          {loading ? "Thinking…" : "Brainstorm names →"}
        </button>
        <button
          onClick={onBack}
          className="text-stone-400 hover:text-stone-600 text-sm whitespace-nowrap transition-colors"
        >
          I already have a name
        </button>
      </div>

      {/* Result card */}
      {result && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <button
            onClick={() => onSelect(result.name)}
            className="w-full text-left p-5 hover:bg-stone-50 transition-colors"
          >
            <p className="font-bold text-stone-800 text-lg">{result.name}</p>
            <p className="text-stone-400 text-sm mt-1">{result.reason}</p>
          </button>
          <div className="border-t border-stone-100">
            <button
              onClick={handleShowAnother}
              className="w-full py-3 text-stone-500 hover:text-stone-700 text-sm transition-colors"
            >
              We've got more — show me another
            </button>
          </div>
        </div>
      )}
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

  return (
    <Shell>
      <button
        onClick={onGoBack}
        className="text-stone-400 hover:text-stone-600 text-sm flex items-center gap-1 mb-6 transition-colors"
      >
        ← Back
      </button>

      {/* Business card */}
      <div className="bg-white rounded-2xl border-t-4 border-red-500 shadow-md p-8 mb-6 text-center">
        {/* Traffic light dots */}
        <div className="flex justify-center gap-1.5 mb-5">
          <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
          <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
          <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
        </div>

        <h2 className="text-3xl font-bold text-stone-900 leading-tight mb-3">
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
