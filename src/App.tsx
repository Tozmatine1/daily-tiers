import "./App.css";
import { useState, useEffect, useRef, type CSSProperties } from "react";
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


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6, // must move ~6px before drag starts
      },
    })
  );

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const [showResults, setShowResults] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const stored = JSON.parse(raw) as {
        results?: Record<string, boolean>;
      };

      return !!stored.results;
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

// 👉 MUST BE HERE (right after playerTiers)
const [shuffledItemIds] = useState<string[]>(() => {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      if (stored.shuffledItemIds) {
        return stored.shuffledItemIds;
      }
    }
  }

  // Generate new shuffled order for first-time load today
  const ids = puzzle.items.map((i: PuzzleItem) => i.id);
  return shuffleArray(ids); 
});

  // itemId -> correct? after checking
  const [results, setResults] = useState<Record<string, boolean> | null>(() => {
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
  });

  // track whether user already submitted
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const stored = JSON.parse(raw) as {
        results?: Record<string, boolean>;
      };

      return !!stored.results;
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
    // If they've already submitted, just reopen the results modal
    if (hasSubmitted) {
      if (results) {
        setShowResults(true);
      }
      return;
    }

    // First-time submission: require a complete board
    if (!allAnswered) return;

    const scoreObject: Record<string, boolean> = {};
    puzzle.items.forEach((item: PuzzleItem) => {
      const chosen = playerTiers[item.id];
      scoreObject[item.id] = item.trueTier === chosen;
    });

    setResults(scoreObject);
    setShowResults(true);
    setHasSubmitted(true);

    try {
      window.localStorage.setItem(
  STORAGE_KEY,
  JSON.stringify({
    playerTiers,
    results: scoreObject,
    shuffledItemIds, // SAVE the order
  })
);
    } catch (err) {
      console.error("Failed to save attempt", err);
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
  <ul className="items-list" ref={poolScrollRef}>
    {puzzle.items
      .filter((item: PuzzleItem) => playerTiers[item.id] === "")
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
                  results[item.id] ? "result-check" : "result-x"
                }
              >
                {results[item.id] ? "✓" : "✗"}
              </span>
            </div>
          )}
        </li>
      ))}
  </ul>

  {/* scroll knob / controls */}
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

    <div className="pool-scroll-track">
      <div className="pool-scroll-knob" />
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
                      {puzzle.category.tiers.map((tier: TierDefinition) => {
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
                              {tierItems.map((item: PuzzleItem) => (
                                <li key={item.id}>
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
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
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
