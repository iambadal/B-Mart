import { useEffect, useState } from "react";

export const useDebounce = (arg, delay = 400) => {
  const [debounced, setDebounced] = useState(arg);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(arg), delay);

    return () => clearTimeout(timeoutId);
  }, [arg]);

  return debounced;
};
