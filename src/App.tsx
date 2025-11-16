import "./App.css";
import { useState,} from "react";
import type { CSSProperties } from "react";
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
import { TodayPuzzle } from "./data/nbaCareerPoints";

const DAILY_PUZZLE_ID = "nba-career-points-2025-11-16";  // 👈 pick any unique string
const STORAGE_KEY = `dailyTiersAttempt_${DAILY_PUZZLE_ID}`;


type DraggableItemProps = {
  id: string;
  name: string;
  onClick?: () => void;
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
      {/* drag handle now on the LEFT */}
      <button
  type="button"
  className={`item-drag-overlay ${disabled ? "chip-locked" : ""}`}
  {...(!disabled ? listeners : {})}   // no drag listeners when disabled
  {...attributes}
  aria-label={`Drag ${name}`}
>
  
</button>

      {/* main tappable text area */}
      <span className="item-chip-label">
        {name}
      </span>
    </div>
  );
}

// Droppable tier row (TierMaker-style)
type DroppableTierProps = {
  id: string;
  label: string;
  rangeText: string;
  items: { id: string; name: string }[];
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
      {/* 🔹 stats row spanning full width */}
      {rangeText && <div className="tier-stats">{rangeText}</div>}

      {/* left colored label */}
      <div className="tier-label">
        <div className="tier-label-text">{label}</div>
      </div>

      {/* right content area */}
      <div className="tier-content">
        {items.length === 0 ? (
          <div className="tier-empty"></div>
        ) : (
          items.map((item) => (
            <DraggableItem key={item.id} id={item.id} name={item.name} disabled={disableDrag}/>
          ))
        )}
      </div>
    </div>
  );
}

function App() {
  const puzzle = TodayPuzzle;

  const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 6, // must move ~6px before a drag starts
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

      // If they already played, open the modal automatically
      return !!stored.results;
    } catch (err) {
      console.error("Failed to load showResults", err);
      return false;
    }
  });

  const { setNodeRef: setPoolRef, isOver: isOverPool } = useDroppable({
    id: "POOL",
  });

  // itemId -> chosen tier
    const [playerTiers, setPlayerTiers] = useState<Record<string, string>>(() => {
    // default: everyone in the pool
    const emptyPlayerTiers: Record<string, string> = Object.fromEntries(
      puzzle.items.map((item) => [item.id, ""])
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
  // 👇 NEW: track if this user has already submitted in this session
   const [hasSubmitted, setHasSubmitted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const stored = JSON.parse(raw) as {
        results?: Record<string, boolean>;
      };

      // If we have results saved, we consider the attempt "used"
      return !!stored.results;
    } catch (err) {
      console.error("Failed to load hasSubmitted", err);
      return false;
    }
  });
  const allAnswered = Object.values(playerTiers).every((tier) => tier !== "");
  const totalCorrect =
    results == null ? null : Object.values(results).filter(Boolean).length;
    
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
  puzzle.items.forEach((item) => {
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
    } else if (puzzle.category.tiers.some((tier) => tier.id === targetId)) {
      // Move into a real tier
      setPlayerTiers((prev) => ({
        ...prev,
        [itemId]: targetId,
      }));
    }

    setActiveDragId(null);
  }

  // Turn min/max into readable "35,000+ points" style
  function getTierRangeText(tier: {
    minValue: number | null;
    maxValue: number | null;
  }): string {
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
                    {puzzle.items.find((i) => i.id === activeDragId)?.name}
                  </div>
                )}
              </DragOverlay>

              {/* TierMaker-style board */}
              <div className="tier-board">
                {puzzle.category.tiers.map((tier) => {
                  const itemsInThisTier = puzzle.items.filter(
                    (item) => playerTiers[item.id] === tier.id
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

              {/* Item pool below the board */}
              <div
                className="items-pool"
                ref={setPoolRef}
                style={isOverPool ? { boxShadow: "0 0 0 2px #7c5fba" } : undefined}
              >
                <ul className="items-list">
  {puzzle.items
  .filter((item) => playerTiers[item.id] === "") // only items currently in the pool
  .map((item) => (
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
<span className={results[item.id] ? "result-check" : "result-x"}>
  {results[item.id] ? "✓" : "✗"}
</span>
        </div>
      )}
    </li>
  ))}

</ul>
              </div>  {/* end of items-pool */}


              {/* 🔹 ADD THIS BLOCK DIRECTLY BELOW THE ITEMS-POOL */}
              {showResults && results && (
  <div
    className="results-backdrop"
    onClick={() => setShowResults(false)}  // 👈 click backdrop to close
  >
    <div
      className="results-modal"
      onClick={(e) => e.stopPropagation()} // 👈 prevent closing when clicking inside modal
    >
      <button
        className="results-close"
        onClick={() => setShowResults(false)}  // 👈 close button
      >
        ✕
      </button>

      <h3>Results</h3>
      <p>
        You got {totalCorrect} / {puzzle.items.length} correct.
      </p>

      <div className="results-tiers">
        {puzzle.category.tiers.map((tier) => {
          const tierItems = puzzle.items.filter(
            (item) => item.trueTier === tier.id
          );

          return (
            <div key={tier.id} className="results-tier-block">
              <h4>{tier.id} Tier</h4>
              <ul>
                {tierItems.map((item: { id: string; name: string }) => {
  const isCorrect = results[item.id];

  return (
    <li key={item.id}>
      {item.name}{" "}
      <span
        style={{
          color: isCorrect ? "#4CFF4C" : "#FF4C4C",
          fontWeight: 700,
        }}
      >
        {isCorrect ? "✓" : "✗"}
      </span>
    </li>
  );
})}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  </div>
)}
              {/* 🔹 END OF INSERT */}


            </section>   {/* end of game-layout */}
          </DndContext>
        </main>
      </div>
    </div>
  );
}

export default App;
