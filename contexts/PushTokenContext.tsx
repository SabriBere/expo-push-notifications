import { createContext, type ReactNode, useContext, useState } from "react";

type PushTokenContextValue = {
  expoPushToken: string | null;
  setExpoPushToken: (token: string | null) => void;
};

export const PushTokenContext = createContext<PushTokenContextValue>({
  expoPushToken: null,
  setExpoPushToken: () => {},
});

export function PushTokenProvider({ children }: { children: ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  return (
    <PushTokenContext.Provider value={{ expoPushToken, setExpoPushToken }}>
      {children}
    </PushTokenContext.Provider>
  );
}

export function useExpoPushToken() {
  return useContext(PushTokenContext);
}
