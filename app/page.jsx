"use client";

import { useEffect, useState, useRef } from "react";

const RATINGS = ["Very High", "High", "Fair", "Low", "Very Low"];
const INTERVAL_SECONDS = 3 * 60; // 3 minutes

export default function HomePage() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [inputBlocked, setInputBlocked] = useState(false);
  const [error, setError] = useState("");

  // ding sound reference
  const dingRef = useRef(null);
  // store participant username
  const [username, setUsername] = useState("");

  const unlockAudio = () => {
    const audio = new Audio("/silence.mp3");
    audio.play().catch(() => {});
  };

  useEffect(() => {
    const handler = () => {
      unlockAudio();
      window.removeEventListener("touchstart", handler);
    };

    window.addEventListener("touchstart", handler);

    return () => window.removeEventListener("touchstart", handler);
  }, []);

  // countdown logic
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [secondsLeft]);

  // play sound when countdown hits 0
  useEffect(() => {
    if (secondsLeft === 0 && inputBlocked) {
      dingRef.current?.play().catch(() => {});
      setInputBlocked(false); // allow rating again
    }
  }, [secondsLeft, inputBlocked]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleRatingClick = async (rating) => {

    // Prime audio on first real user gesture (unlock audio on iOS)
    if (dingRef.current) {
      try {
        await dingRef.current.play();
        dingRef.current.pause();
        dingRef.current.currentTime = 0;
      } catch (err) {
        // ignore
      }
    }

    if (inputBlocked) return; // extra protection

    setIsSaving(true);
    setError("");

    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, username }),
      });

      if (!res.ok) {
        throw new Error("Failed to save rating");
      }

      // BLOCK inputs until next cycle
      setInputBlocked(true);
      setSecondsLeft(INTERVAL_SECONDS);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save rating");
    } finally {
      setIsSaving(false);
    }
  };

  const showPromptNow = secondsLeft === 0;

  return (
    <main className="isa-root">
      {/* ding sound */}
      <audio ref={dingRef} src="/hotel-bell-ding.mp3" preload="auto" />

      {showPromptNow ? 
      <div className="isa-card">
        <header className="isa-header">
          <h1>ISA Workload Assessment</h1>
          {/* <p>Please rate your workload at this moment.</p> */}
          <div className="name-container">
            <input
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="name-input"
            />
            </div>
          <hr />
        </header>

        
        <section className="isa-buttons">
          {RATINGS.map((rating) => (
            <button
              key={rating}
              className="rating-button"
              onClick={() => handleRatingClick(rating)}
              disabled={isSaving || inputBlocked || !showPromptNow ||!username}
            >
              {rating}
            </button>
          ))}
        </section>

        {/* <section className="isa-timer">
          {showPromptNow ? (
            <p className={`timer-main ${inputBlocked ? "" : "pulse-animation"}`}>
              Please rate your workload now.
            </p>
          ) : (
            <p className="timer-main">
              Next assessment in <span>{formatTime(secondsLeft)}</span>
            </p>
          )}

          {error && <p className="error-text">{error}</p>}
        </section> */}
      </div>
    :
      <div className="timer-display">
        <p className="timer-countdown">{formatTime(secondsLeft)}</p>
      </div>

}
    </main>
  );
}
