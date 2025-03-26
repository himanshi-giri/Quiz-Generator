import { useState, useEffect, useRef } from "react";

export const useCountdown = (initialSeconds: number) => {
  const [countdown, setCountdown] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(true);

  const startCountdown = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset countdown
    setCountdown(initialSeconds);
    isRunningRef.current = true;

    intervalRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          // When countdown reaches 1, clear the interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          isRunningRef.current = false;
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    // Start countdown immediately
    startCountdown();

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initialSeconds]);

  return {
    countdown,
    isRunning: isRunningRef.current,
    startCountdown
  };
};