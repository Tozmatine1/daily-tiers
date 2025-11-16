import "./App.css";
import { useState } from "react";
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

// Draggable item in the pool
type DraggableItemProps = {
  id: string;
  name: string;
  onClick?: () => void;
  isActive?: boolean;
};

function DraggableItem({ id, name, onClick, isActive }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    cursor: "grab",
    zIndex: transform ? 999 : "auto",
    boxShadow: isActive ? "0 0 0 2px #7c5fba" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      {...listeners}
      {...attributes}
      className="item-chip"
    >
      {name}
    </div>
  );
}

// Droppable tier row (TierMaker-style)
type DroppableTierProps = {
  id: string;
  label: string;
  rangeText: string;
  items: { id: string; name: string }[];
};

function DroppableTier({ id, label, rangeText, items }: DroppableTierProps) {
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
      <div className="tier-label">
        <div className="tier-label-text">{label}</div>
        {rangeText && <div className="tier-label-range">{rangeText}</div>}
      </div>
      <div className="tier-content">
        {items.length === 0 ? (
          <div className="tier-empty">(Drop items here)</div>
        ) : (
          items.map((item) => (
            <DraggableItem key={item.id} id={item.id} name={item.name} />
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

  const [showResults, setShowResults] = useState(false);


  const { setNodeRef: setPoolRef, isOver: isOverPool } = useDroppable({
    id: "POOL",
  });

  // itemId -> chosen tier
  const [playerTiers, setPlayerTiers] = useState<Record<string, string>>(
    () => Object.fromEntries(puzzle.items.map((item) => [item.id, ""]))
  );

  // itemId -> correct? after checking
  const [results, setResults] = useState<Record<string, boolean> | null>(null);

  const [activeItemForTierSelect, setActiveItemForTierSelect] = useState<string | null>(null);


  const allAnswered = Object.values(playerTiers).every((tier) => tier !== "");
  const totalCorrect =
    results == null ? null : Object.values(results).filter(Boolean).length;

  let feedbackText = "";
  if (typeof totalCorrect === "number") {
    if (totalCorrect === puzzle.items.length) {
      feedbackText = "Perfect! You nailed every tier.";
    } else if (totalCorrect >= 8) {
      feedbackText = "Nice work! You really know your stuff.";
    } else if (totalCorrect >= 5) {
      feedbackText = "Not bad at all. Some tiers were tricky.";
    } else {
      feedbackText = "Brutal. Today was rough. Tomorrow will be better.";
    }
  }

 function checkAnswers() {
  const scoreObject: Record<string, boolean> = {};
  puzzle.items.forEach((item) => {
    const chosen = playerTiers[item.id];
    scoreObject[item.id] = item.trueTier === chosen;
  });

  setResults(scoreObject);
  setShowResults(true);   // 👈 open modal
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
              <h2>Daily</h2>
              <p className="category-name">{puzzle.category.name}</p>
          
            </div>

            {typeof totalCorrect === "number" && (
              <div className="score-block">
                <div className="score-text">
                  Score: {totalCorrect} / {puzzle.items.length}
                </div>
                <div className="score-feedback">{feedbackText}</div>
              </div>
            )}
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
                  disabled={!allAnswered}
                  className="check-button"
                >
                  {allAnswered ? "Check Answers" : "Complete the Tier List"}
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
  isActive={activeItemForTierSelect === item.id}
  onClick={() => {
    console.log("Clicked item", item.id);           // 👈 add this
    setActiveItemForTierSelect((prev) =>
      prev === item.id ? null : item.id
    );
  }}
/>

      {activeItemForTierSelect === item.id && (
        <div className="item-tier-buttons">
          {puzzle.category.tiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() =>
                setPlayerTiers((prev) => ({
                  ...prev,
                  [item.id]: tier.id,
                }))
              }
              className={
                playerTiers[item.id] === tier.id
                  ? "tier-btn tier-btn-active"
                  : "tier-btn"
              }
            >
              {tier.id}
            </button>
          ))}
        </div>
      )}

      {results && (
        <div
          className={
            results[item.id]
              ? "item-result correct"
              : "item-result incorrect"
          }
        >
          {results[item.id] ? "Correct ✓" : "Incorrect ✗"}
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
                {tierItems.map((item) => (
                  <li key={item.id}>
                    {item.name} {results[item.id] ? "✓" : "✗"}
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
              {/* 🔹 END OF INSERT */}


            </section>   {/* end of game-layout */}
          </DndContext>
        </main>
      </div>
    </div>
  );
}

export default App;
