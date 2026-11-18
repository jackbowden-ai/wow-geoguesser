"use client";

import { useCallback, useEffect, useState } from "react";
import MapView from "@/components/MapView";
import { QUESTIONS, type Question } from "@/data/questions";
import {
  MAX_SCORE_PER_ROUND,
  ROUNDS,
  clamp,
  formatYards,
  mapDistance,
  scoreFor,
  shuffle,
  toYards,
  type Point,
} from "@/lib/geo";

type Phase = "intro" | "guessing" | "revealed" | "done";

type Round = {
  q: Question;
  guess: Point;
  yards: number;
  score: number;
};

function useCountUp(target: number, run: boolean, delay = 600, duration = 1300) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) {
      setValue(0);
      return;
    }
    let raf = 0;
    const t0 = performance.now() + delay;
    const step = (now: number) => {
      const t = clamp((now - t0) / duration, 0, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, delay, duration]);
  return value;
}

function rating(total: number): string {
  const max = ROUNDS * MAX_SCORE_PER_ROUND;
  const pct = total / max;
  if (pct >= 0.9) return "Loremaster of Azeroth";
  if (pct >= 0.7) return "Seasoned Explorer";
  if (pct >= 0.45) return "Questing Adventurer";
  if (pct >= 0.2) return "Fresh Recruit";
  return "Lost in the Barrens";
}

function square(score: number): string {
  if (score >= 4000) return "🟩";
  if (score >= 2000) return "🟨";
  if (score >= 800) return "🟧";
  return "🟥";
}

export default function Game() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState<Point | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [debug, setDebug] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).get("debug") === "1");
  }, []);

  const q = questions[index];
  const current = rounds[index];
  const total = rounds.reduce((s, r) => s + r.score, 0);
  const shownPoints = useCountUp(current?.score ?? 0, phase === "revealed");

  const start = useCallback(() => {
    setQuestions(shuffle(QUESTIONS).slice(0, ROUNDS));
    setIndex(0);
    setRounds([]);
    setGuess(null);
    setCopied(false);
    setPhase("guessing");
    setResetKey((k) => k + 1);
  }, []);

  const confirm = useCallback(() => {
    if (phase !== "guessing" || !guess || !q) return;
    const d = mapDistance(guess, q.answer);
    setRounds((r) => [...r, { q, guess, yards: toYards(d), score: scoreFor(d) }]);
    setPhase("revealed");
  }, [phase, guess, q]);

  const next = useCallback(() => {
    if (phase !== "revealed") return;
    if (index + 1 >= ROUNDS) {
      setPhase("done");
      return;
    }
    setIndex((i) => i + 1);
    setGuess(null);
    setPhase("guessing");
    setResetKey((k) => k + 1);
  }, [phase, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat) return;
      // A focused button already turns Enter into a click; don't fire twice.
      if ((e.target as HTMLElement | null)?.tagName === "BUTTON") return;
      if (phase === "guessing") confirm();
      else if (phase === "revealed") next();
      else if (phase === "intro") start();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, confirm, next, start]);

  const share = async () => {
    const text = `Azeroth GeoGuessr ${total.toLocaleString("en-GB")}/${(ROUNDS * MAX_SCORE_PER_ROUND).toLocaleString(
      "en-GB"
    )}\n${rounds.map((r) => square(r.score)).join("")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your result:", text);
    }
  };

  const playing = phase === "guessing" || phase === "revealed";

  return (
    <main className="app">
      <header className="hud">
        <div className="hud__title">
          <span className="hud__crest">⚔</span> Azeroth GeoGuessr
        </div>
        <div className="hud__pips" aria-label={`Question ${Math.min(index + 1, ROUNDS)} of ${ROUNDS}`}>
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <span
              key={i}
              className={`pip ${i < rounds.length ? "pip--done" : ""} ${playing && i === index ? "pip--now" : ""}`}
            />
          ))}
        </div>
        <div className="hud__score">
          <span className="hud__label">Score</span> {total.toLocaleString("en-GB")}
        </div>
      </header>

      <div className="stage">
        <MapView
          guess={playing ? guess : null}
          answer={q ? q.answer : null}
          revealed={phase === "revealed"}
          disabled={phase !== "guessing"}
          resetKey={resetKey}
          distanceLabel={current && phase === "revealed" ? formatYards(current.yards) : null}
          onGuess={setGuess}
        />

        {playing && q && (
          <section className="card" key={`${q.id}-${phase}`}>
            {phase === "guessing" ? (
              <>
                <div className="card__meta">
                  <span className="chip">{q.category}</span>
                  <span>
                    Question {index + 1} of {ROUNDS}
                  </span>
                </div>
                <p className="card__clue">{q.clue}</p>
                <button className="btn" disabled={!guess} onClick={confirm}>
                  {guess ? "Lock in guess" : "Click the map to place a pin"}
                </button>
                {debug && guess && (
                  <p className="debug">
                    guess: x {guess.x.toFixed(3)}, y {guess.y.toFixed(3)}
                  </p>
                )}
              </>
            ) : (
              current && (
                <>
                  <div className="card__meta">
                    <span className="chip chip--gold">{q.name}</span>
                    <span>
                      Question {index + 1} of {ROUNDS}
                    </span>
                  </div>
                  <p className="card__distance">
                    You were <strong>{formatYards(current.yards)}</strong> away
                  </p>
                  <p className="card__points">
                    +{shownPoints.toLocaleString("en-GB")} <small>/ {MAX_SCORE_PER_ROUND.toLocaleString("en-GB")}</small>
                  </p>
                  <div className="meter" aria-hidden>
                    <div className="meter__fill" style={{ width: `${(current.score / MAX_SCORE_PER_ROUND) * 100}%` }} />
                  </div>
                  <p className="card__fact">{q.fact}</p>
                  {debug && (
                    <p className="debug">
                      answer: x {q.answer.x.toFixed(3)}, y {q.answer.y.toFixed(3)}
                    </p>
                  )}
                  <button className="btn" onClick={next}>
                    {index + 1 >= ROUNDS ? "See results" : "Next question"}
                  </button>
                </>
              )
            )}
          </section>
        )}

        {phase === "intro" && (
          <div className="overlay">
            <div className="modal">
              <h1>Azeroth GeoGuessr</h1>
              <p className="modal__sub">How well do you know the world of Warcraft?</p>
              <ul className="modal__rules">
                <li>{ROUNDS} lore clues, one map of Azeroth.</li>
                <li>Pan, zoom, then click to drop your pin.</li>
                <li>The closer you are, the more points you earn, up to {MAX_SCORE_PER_ROUND.toLocaleString("en-GB")} each.</li>
              </ul>
              <button className="btn btn--big" onClick={start}>
                Begin the journey
              </button>
              <p className="modal__hint">Tip: press Enter to confirm and continue.</p>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="overlay">
            <div className="modal modal--results">
              <p className="modal__eyebrow">Journey complete</p>
              <h1>{rating(total)}</h1>
              <p className="modal__total">
                {total.toLocaleString("en-GB")} <small>/ {(ROUNDS * MAX_SCORE_PER_ROUND).toLocaleString("en-GB")}</small>
              </p>
              <ol className="results">
                {rounds.map((r) => (
                  <li key={r.q.id}>
                    <span className="results__sq">{square(r.score)}</span>
                    <span className="results__name">{r.q.name}</span>
                    <span className="results__dist">{formatYards(r.yards)}</span>
                    <span className="results__pts">{r.score.toLocaleString("en-GB")}</span>
                  </li>
                ))}
              </ol>
              <div className="modal__actions">
                <button className="btn btn--ghost" onClick={share}>
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button className="btn" onClick={start}>
                  Play again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
