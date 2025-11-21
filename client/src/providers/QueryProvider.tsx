import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from 'react';
const queryClient = new QueryClient();

interface QueryProvider {
  children: ReactNode;
}

export const AppQueryProvider = ({ children }: QueryProvider) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
