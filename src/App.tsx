import "./App.css";
import { useState } from "react";
import type { CSSProperties } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { TodayPuzzle } from "./data/nbaCareerPoints";

// Draggable item in the pool
type DraggableItemProps = {
  id: string;
  name: string;
};

function DraggableItem({ id, name }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
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

  // itemId -> chosen tier
  const [playerTiers, setPlayerTiers] = useState<Record<string, string>>(
    () => Object.fromEntries(puzzle.items.map((item) => [item.id, ""]))
  );

  // itemId -> correct? after checking
  const [results, setResults] = useState<Record<string, boolean> | null>(null);

  const allAnswered = Object.values(playerTiers).every((tier) => tier !== "");
  const totalCorrect =
    results == null
      ? null
      : Object.values(results).filter(Boolean).length;

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
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const itemId = String(active.id);
    const tierId = String(over.id);

    setPlayerTiers((prev) => ({
      ...prev,
      [itemId]: tierId,
    }));
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
        <header className="app-header">
          <h1>Daily Tiers</h1>
          <p className="subtitle">
            Drag each item into the correct tier based on the stat.
          </p>
        </header>

        <main className="app-main">
          <section className="puzzle-meta">
            <div>
              <h2>Today&apos;s Category</h2>
              <p className="category-name">{puzzle.category.name}</p>
              <p className="units">Stat: {puzzle.category.units}</p>
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

          <DndContext onDragEnd={handleDragEnd}>
            <section className="game-layout">
              <div className="top-bar">
                <button
                  onClick={checkAnswers}
                  disabled={!allAnswered}
                  className="check-button"
                >
                  {allAnswered ? "Check Answers" : "Assign all items first"}
                </button>
              </div>

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
              <div className="items-pool">
                <h3>Items to place</h3>
                <p className="items-hint">
                  Drag items into the board above, or tap a tier button.
                </p>
                <ul className="items-list">
                  {puzzle.items.map((item) => (
                    <li key={item.id} className="items-list-entry">
  {playerTiers[item.id] === "" ? (
    <DraggableItem id={item.id} name={item.name} />
  ) : (
    <div className="item-chip item-chip-disabled">{item.name}</div>
  )}

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

  <div className="item-selected">
    Selected: {playerTiers[item.id] || "None"}
  </div>

  {results && (
    <div
      className={
        results[item.id] ? "item-result correct" : "item-result incorrect"
      }
    >
      {results[item.id] ? "Correct ✓" : "Incorrect ✗"}
    </div>
  )}
</li>

                  ))}
                </ul>
              </div>
            </section>
          </DndContext>
        </main>
      </div>
    </div>
  );
}

export default App;
