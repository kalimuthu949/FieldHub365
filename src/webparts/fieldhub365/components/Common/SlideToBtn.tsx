import * as React from "react";
import { useRef, useState, useEffect } from "react";
import styles from "./SlideToBtn.module.scss";

interface SlideToStartProps {
  startJobFunction: () => void;
}

const SlideToStart: React.FC<SlideToStartProps> = ({ startJobFunction }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const swipeRef = useRef<HTMLSpanElement>(null);

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [maxX, setMaxX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (buttonRef.current && swipeRef.current) {
      const padding = 20;
      const max =
        buttonRef.current.offsetWidth - swipeRef.current.offsetWidth - padding;

      setMaxX(max);
    }
  }, []);

  // MOUSE START
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  // TOUCH START
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;

    const diff = Math.min(Math.max(clientX - startX, 0), maxX);
    setDragX(diff);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (dragX >= maxX) {
      setDragX(maxX);
      setCompleted(true);
      startJobFunction();
    } else {
      setDragX(0);
      setCompleted(false);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);

      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  });

  return (
    <button
      ref={buttonRef}
      className={`${styles.button} ${completed ? styles.order : ""}`}
      style={
        {
          display: completed ? "none" : "flex",
          "--swiped-blur": dragX / maxX,
          "--swiped": completed ? 1 : 0,
        } as React.CSSProperties
      }
    >
      <div className={styles.inner}>
        <span
          ref={swipeRef}
          className={styles.swipeBtn}
          style={{ transform: `translateX(${dragX}px)` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {">>"}
        </span>
      </div>

      <div className="result"></div>
    </button>
  );
};

export default SlideToStart;
