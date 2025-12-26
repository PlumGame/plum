import React, { useEffect, useState } from "react";
import "./Preloader.css";

function Preloader({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    const duration = 4 * 1000; // 4 секунды
    const step = duration / 100;
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        onFinish();
      }
    }, step);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="preloader-container">
      <div className="overlay" />
      <div className="progress-container">
        <p className="loading-message">LOADING</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export default Preloader;
