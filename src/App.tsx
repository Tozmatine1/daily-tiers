import "./App.css";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { getPuzzleForDate } from "./data/dailyPuzzle";
import type { PuzzleItem, TierDefinition } from "./types/puzzle";

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const MAX_ATTEMPTS = 3;


// =====================
// Draggable item chip
// =====================

type DraggableItemProps = {
  id: string;
  name: string;
  isActive?: boolean;
  disabled?: boolean;
};

function DraggableItem({ id, name, isActive, disabled }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled: !!disabled,
  });

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: transform ? 999 : "auto",
    boxShadow: isActive ? "0 0 0 2px #7c5fba" : undefined,
    cursor: disabled ? "default" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} className="item-chip">
      {/* drag handle on the LEFT */}
      <button
        type="button"
        className={`item-drag-overlay ${disabled ? "chip-locked" : ""}`}
        {...(!disabled ? listeners : {})}
        {...attributes}
        aria-label={`Drag ${name}`}
      />

      {/* main text area */}
      <span className="item-chip-label">{name}</span>
    </div>
  );
}

// =====================
// Droppable tier row
// =====================

type DroppableTierProps = {
  id: string;
  label: string;
  rangeText: string;
  items: PuzzleItem[];
  disableDrag: boolean;
};

function DroppableTier({
  id,
  label,
  rangeText,
  items,
  disableDrag,
}: DroppableTierProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`tier-row tier-${id.toLowerCase()}`}
      style={{
        outline: isOver ? "2px solid #9f7aea" : "none",
        outlineOffset: -2,
      }}
    >
      {/* stats across the top */}
      {rangeText && <div className="tier-stats">{rangeText}</div>}

      {/* left colored label */}
      <div className="tier-label">
        <div className="tier-label-text">{label}</div>
      </div>

      {/* right content area */}
      <div className="tier-content">
        {items.length === 0 ? (
          <div className="tier-empty" />
        ) : (
          items.map((item: PuzzleItem) => (
            <DraggableItem
              key={item.id}
              id={item.id}
              name={item.name}
              disabled={disableDrag}
            />
          ))
        )}
      </div>
    </div>
  );
}

// =====================
// Main App
// =====================

function App() {
  const { puzzle, puzzleId } = getPuzzleForDate();
  const STORAGE_KEY = `dailyTiersAttempt_${puzzleId}`;

  const poolScrollRef = useRef<HTMLUListElement | null>(null);
  const [poolScrollProgress, setPoolScrollProgress] = useState(0);

  const [isDraggingKnob, setIsDraggingKnob] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const knobDragStateRef = useRef<{
    startX: number;
    startScrollLeft: number;
    trackWidth: number;
  } | null>(null);

  function updatePoolScrollProgress() {
    const list = poolScrollRef.current;
    if (!list) return;

    const maxScroll = list.scrollWidth - list.clientWidth;
    if (maxScroll <= 0) {
      setPoolScrollProgress(0);
      return;
    }

    setPoolScrollProgress(list.scrollLeft / maxScroll);
  }

  function handlePoolScroll() {
    updatePoolScrollProgress();
  }

  function handlePoolTrackClick(e: MouseEvent<HTMLDivElement>) {
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = rect.width > 0 ? clickX / rect.width : 0;

    const list = poolScrollRef.current;
    if (!list) return;

    const maxScroll = list.scrollWidth - list.clientWidth;
    list.scrollTo({
      left: maxScroll * ratio,
      behavior: "smooth",
    });
  }

  function handleKnobPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.preventDefault();
    const list = poolScrollRef.current;
    const track = trackRef.current;
    if (!list || !track) return;

    const trackWidth = track.clientWidth;
    knobDragStateRef.current = {
      startX: e.clientX,
      startScrollLeft: list.scrollLeft,
      trackWidth,
    };

    setIsDraggingKnob(true);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6, // must move ~6px before drag starts
      },
    })
  );

  useEffect(() => {
    if (!isDraggingKnob) return;

    function onPointerMove(ev: PointerEvent) {
      const list = poolScrollRef.current;
      const dragState = knobDragStateRef.current;
      if (!list || !dragState) return;

      const { startX, startScrollLeft, trackWidth } = dragState;
      const maxScroll = list.scrollWidth - list.clientWidth;
      if (maxScroll <= 0 || trackWidth <= 0) return;

      const deltaX = ev.clientX - startX;
      const deltaProgress = deltaX / trackWidth;
      let newScrollLeft = startScrollLeft + deltaProgress * maxScroll;

      if (newScrollLeft < 0) newScrollLeft = 0;
      if (newScrollLeft > maxScroll) newScrollLeft = maxScroll;

      list.scrollTo({ left: newScrollLeft });
      updatePoolScrollProgress();
    }

    function onPointerUp() {
      setIsDraggingKnob(false);
      knobDragStateRef.current = null;
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isDraggingKnob]);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const [showResults, setShowResults] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const stored = JSON.parse(raw) as {
        results?: Record<string, boolean>;
        gameOver?: boolean;
      };

      return !!stored.results && !!stored.gameOver;
    } catch (err) {
      console.error("Failed to load showResults", err);
      return false;
    }
  });


  const { setNodeRef: setPoolRef, isOver: isOverPool } = useDroppable({
    id: "POOL",
  });

  // itemId -> chosen tier id ("S","A",... or "")
  const [playerTiers, setPlayerTiers] = useState<Record<string, string>>(() => {
    const emptyPlayerTiers: Record<string, string> = Object.fromEntries(
      puzzle.items.map((item: PuzzleItem) => [item.id, ""])
    );

    if (typeof window === "undefined") {
      return emptyPlayerTiers;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyPlayerTiers;

      const stored = JSON.parse(raw) as {
        playerTiers?: Record<string, string>;
      };

      return stored.playerTiers ?? emptyPlayerTiers;
    } catch (err) {
      console.error("Failed to load saved playerTiers", err);
      return emptyPlayerTiers;
    }
  });

  // 🔀 Shuffled list of items, stable for this puzzleId
const shuffledItems = useMemo(() => shuffleArray(puzzle.items), [puzzle.items]);

  // how many full-board checks the player has used
  const [attemptsUsed, setAttemptsUsed] = useState<number>(() => {
    if (typeof window === "undefined") return 0;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return 0;

      const stored = JSON.parse(raw) as { attemptsUsed?: number };
      return stored.attemptsUsed ?? 0;
    } catch {
      return 0;
    }
  });

  // feedback for last imperfect attempt
  const [lastAttemptCorrect, setLastAttemptCorrect] = useState<number | null>(
    null
  );



  // itemId -> correct? after checking
  const [results, setResults] = useState<Record<string, boolean> | null>(
    () => {
      if (typeof window === "undefined") return null;

      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const stored = JSON.parse(raw) as {
          results?: Record<string, boolean>;
        };

        return stored.results ?? null;
      } catch (err) {
        console.error("Failed to load saved results", err);
        return null;
      }
    }
  );

  // track whether user already submitted
 const [hasSubmitted, setHasSubmitted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const stored = JSON.parse(raw) as {
        results?: Record<string, boolean>;
        gameOver?: boolean;
      };

      return !!stored.gameOver;
    } catch (err) {
      console.error("Failed to load hasSubmitted", err);
      return false;
    }
  });

  const allAnswered = Object.values(playerTiers).every((tier) => tier !== "");
  const totalCorrect =
    results == null ? null : Object.values(results).filter(Boolean).length;

  // optional: refresh at midnight so next day's puzzle loads
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = window.setTimeout(() => {
      window.location.reload();
    }, msUntilMidnight);

    return () => window.clearTimeout(timer);
  }, []);

  function checkAnswers() {
    // If game is over, just reopen the results modal
    if (hasSubmitted) {
      if (results) {
        setShowResults(true);
      }
      return;
    }

    // Require a complete board before checking
    if (!allAnswered) return;

    const scoreObject: Record<string, boolean> = {};
    puzzle.items.forEach((item: PuzzleItem) => {
      const chosen = playerTiers[item.id];
      scoreObject[item.id] = item.trueTier === chosen;
    });

    const correctCount = Object.values(scoreObject).filter(Boolean).length;
    const nextAttempts = attemptsUsed + 1;

    // Perfect or out of attempts → GAME OVER
    const isPerfect = correctCount === puzzle.items.length;
    const noAttemptsLeft = nextAttempts >= MAX_ATTEMPTS;

    if (isPerfect || noAttemptsLeft) {
      setResults(scoreObject);
      setShowResults(true);
      setHasSubmitted(true);
      setAttemptsUsed(nextAttempts);
      setLastAttemptCorrect(correctCount);

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            playerTiers,
            results: scoreObject,
            attemptsUsed: nextAttempts,
            gameOver: true,
          })
        );
      } catch (err) {
        console.error("Failed to save final attempt", err);
      }

      return;
    }

    // Imperfect attempt, still have tries left:
    // tell them how many are correct, but let them rearrange.
    setAttemptsUsed(nextAttempts);
    setLastAttemptCorrect(correctCount);

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          playerTiers,
          attemptsUsed: nextAttempts,
          // no results, no gameOver yet
        })
      );
    } catch (err) {
      console.error("Failed to save partial attempt", err);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveDragId(null);
      return;
    }

    const itemId = String(active.id);
    const targetId = String(over.id);

    if (targetId === "POOL") {
      // Move back to items box
      setPlayerTiers((prev) => ({
        ...prev,
        [itemId]: "",
      }));
    } else if (
      puzzle.category.tiers.some((tier: TierDefinition) => tier.id === targetId)
    ) {
      // Move into a real tier
      setPlayerTiers((prev) => ({
        ...prev,
        [itemId]: targetId,
      }));
    }

    setActiveDragId(null);
  }

  // Turn min/max into readable "35,000+ points" style
  function getTierRangeText(tier: TierDefinition): string {
    const { minValue, maxValue } = tier;
    const units = puzzle.category.units;

    if (minValue != null && maxValue != null) {
      return `${minValue.toLocaleString()}–${maxValue.toLocaleString()} ${units}`;
    }
    if (minValue != null && maxValue == null) {
      return `${minValue.toLocaleString()}+ ${units}`;
    }
    if (minValue == null && maxValue != null) {
      return `≤ ${maxValue.toLocaleString()} ${units}`;
    }
    return "";
  }

  const totalItems = puzzle.items.length;

  // Was the game ended because of a perfect run?
  const isPerfectGameOver =
    hasSubmitted && lastAttemptCorrect === totalItems;

  // Hearts should gray only on *failed* attempts
  let failedAttempts = attemptsUsed;

  if (isPerfectGameOver) {
    // Don’t count the winning attempt as a "lost heart"
    failedAttempts = Math.max(0, attemptsUsed - 1);
  }

  if (failedAttempts > MAX_ATTEMPTS) {
    failedAttempts = MAX_ATTEMPTS;
  }


  return (
    <div className="app">
      <div className="app-inner">
        <main className="app-main">
          <section className="puzzle-meta">
            <div>
              <h2>Daily Tiers</h2>
              <p className="category-name">{puzzle.category.name}</p>
            </div>
          </section>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <section className="game-layout">
              <div className="top-bar">
  {/* LEFT: hearts */}
  <div className="topbar-left">
    <div className="attempt-hearts">
      {Array.from({ length: MAX_ATTEMPTS }).map((_, idx) => {
        const used = idx < failedAttempts;
        return (
          <span
            key={idx}
            className={`heart ${used ? "heart-used" : "heart-active"}`}
          >
            ♥
          </span>
        );
      })}
    </div>
  </div>

  {/* CENTER: button */}
  <div className="topbar-center">
    <button
      onClick={checkAnswers}
      disabled={!allAnswered && !hasSubmitted}
      className="check-button"
    >
      {hasSubmitted
        ? "View Results"
        : allAnswered
        ? "Check Answers"
        : "Complete the Tier List"}
    </button>
  </div>

  <div className="topbar-right">
  <div className="progress-tracker">
    <span
      className={
        (lastAttemptCorrect ?? 0) === 0
          ? "progress-zero"
          : "progress-correct"
      }
    >
      {lastAttemptCorrect ?? 0}
    </span>
    <span className="progress-total">/{puzzle.items.length}</span>
  </div>
</div>

              </div>

              <DragOverlay>
                {activeDragId && (
                  <div className="item-chip item-chip-overlay">
                    {
                      puzzle.items.find(
                        (i: PuzzleItem) => i.id === activeDragId
                      )?.name
                    }
                  </div>
                )}
              </DragOverlay>

              {/* Tier board */}
              <div className="tier-board">
                {puzzle.category.tiers.map((tier: TierDefinition) => {
                  const itemsInThisTier = puzzle.items.filter(
                    (item: PuzzleItem) => playerTiers[item.id] === tier.id
                  );
                  const rangeText = getTierRangeText(tier);

                  return (
                    <DroppableTier
                      key={tier.id}
                      id={tier.id}
                      label={`${tier.id} Tier`}
                      rangeText={rangeText}
                      items={itemsInThisTier}
                      disableDrag={hasSubmitted}
                    />
                  );
                })}
              </div>

              {/* Item pool */}
              <div
                className="items-pool"
                ref={setPoolRef}
                style={
                  isOverPool ? { boxShadow: "0 0 0 2px #7c5fba" } : undefined
                }
              >
                <ul
                  className="items-list"
                  ref={poolScrollRef}
                  onScroll={handlePoolScroll}
                >
                  {shuffledItems
                    .filter(
                      (item: PuzzleItem) => playerTiers[item.id] === ""
                    )
                    .map((item: PuzzleItem) => (
                      <li key={item.id} className="items-list-entry">
                        <DraggableItem
                          id={item.id}
                          name={item.name}
                          disabled={hasSubmitted}
                        />

                        {results && (
                          <div
                            className={
                              results[item.id]
                                ? "item-result correct"
                                : "item-result incorrect"
                            }
                          >
                            {item.name}{" "}
                            <span
                              className={
                                results[item.id]
                                  ? "result-check"
                                  : "result-x"
                              }
                            >
                              {results[item.id] ? "✓" : "✗"}
                            </span>
                          </div>
                        )}
                      </li>
                    ))}
                </ul>

                <div className="pool-scroll-controls">
                  <button
                    type="button"
                    className="pool-scroll-button"
                    onClick={() =>
                      poolScrollRef.current?.scrollBy({
                        left: -160,
                        behavior: "smooth",
                      })
                    }
                    aria-label="Scroll items left"
                  >
                    ◀
                  </button>

                  <div
                    className="pool-scroll-track"
                    ref={trackRef}
                    onClick={handlePoolTrackClick}
                  >
                    <div
                      className="pool-scroll-knob"
                      onPointerDown={handleKnobPointerDown}
                      style={{
                        left: `${poolScrollProgress * 75}%`, // knob travels across ~75% of track
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="pool-scroll-button"
                    onClick={() =>
                      poolScrollRef.current?.scrollBy({
                        left: 160,
                        behavior: "smooth",
                      })
                    }
                    aria-label="Scroll items right"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Results modal */}
              {showResults && results && (
                <div
                  className="results-backdrop"
                  onClick={() => setShowResults(false)}
                >
                  <div
                    className="results-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="results-close"
                      onClick={() => setShowResults(false)}
                    >
                      ✕
                    </button>

                    <h3>Results</h3>
                    <p>
                      You got {totalCorrect} / {puzzle.items.length} correct.
                    </p>

                    <div className="results-tiers">
                      {puzzle.category.tiers.map(
                        (tier: TierDefinition) => {
                          const tierItems = puzzle.items.filter(
                            (item: PuzzleItem) => item.trueTier === tier.id
                          );

                          return (
                            <div
                              key={tier.id}
                              className="results-tier-block"
                            >
                              <h4>{tier.id} Tier</h4>
                              <ul>
                                {tierItems.map(
                                  (item: PuzzleItem) => (
                                    <li key={item.id}>
                                      {item.name}{" "}
                                      <span
                                        className={
                                          results[item.id]
                                            ? "result-check"
                                            : "result-x"
                                        }
                                      >
                                        {results[item.id]
                                          ? "✓"
                                          : "✗"}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </DndContext>
        </main>
      </div>
    </div>
  );
}

export default App;
