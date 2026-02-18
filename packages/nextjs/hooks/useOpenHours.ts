import { useEffect, useState } from "react";

export function useOpenHours() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [isClosingSoon, setIsClosingSoon] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    // 1. Signal that we are now on the client side
    setMounted(true);

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const h = now.getHours();

      const open = h >= 8 && h < 20;
      const closing = h === 19;

      setIsOpen(open);
      setIsClosingSoon(closing);

      if (closing) {
        const target = new Date();
        target.setHours(20, 0, 0, 0);
        const diff = target.getTime() - now.getTime();
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${mins}m ${secs.toString().padStart(2, "0")}s`);
      } else {
        setTimeRemaining("");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Export 'mounted' so the UI knows when it's safe to show time data
  return { currentTime, isOpen, isClosingSoon, timeRemaining, mounted };
}
