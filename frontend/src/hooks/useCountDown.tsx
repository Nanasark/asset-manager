import { useEffect, useState } from "react";

export function useCountdown(targetTime: number) {
  const [timeLeft, setTimeLeft] = useState("Calculating...");

  useEffect(() => {
    function updateCountdown() {
      const now = Date.now();
      const distance = targetTime * 1000 - now;

      if (distance <= 0) {
        setTimeLeft("Reward available now");
        return;
      }

      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown(); 

    return () => clearInterval(interval);
  }, [targetTime]);

  return timeLeft;
}
