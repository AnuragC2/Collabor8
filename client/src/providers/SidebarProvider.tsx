import { createContext, useState, useContext } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";

interface SidebarContextType {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

// context must allow null initially
const SidebarContext = createContext<SidebarContextType | null>(null);

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used inside a SidebarProvider");
  }
  return ctx;
};

interface AppSideBarProvider {
  children: ReactNode;
}

export const SidebarProvider = ({ children }: AppSideBarProvider) => {
  const [open, setOpen] = useState(true);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;
