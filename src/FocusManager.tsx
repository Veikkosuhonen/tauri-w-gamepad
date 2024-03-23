import { createContext, useState } from "react";

type FocusManager = {
  element: HTMLElement | null;
  focus(element: HTMLElement | null): void;
};

const focusContext = createContext<FocusManager | null>(null);

export const useFocusManager = () => {
  const context = focusContext;
  if (!context) {
    throw new Error("useFocusManager must be used within a FocusProvider");
  }
  return context;
}

export const FocusProvider = ({ children }: { children: React.ReactNode }) => {
  const [element, setElement] = useState<HTMLElement | null>(null);

  const focus = (element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
    setElement(element);
  };

  return (
    <focusContext.Provider value={{ element, focus }}>
      {children}
    </focusContext.Provider>
  );
}
