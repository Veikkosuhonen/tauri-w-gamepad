import React from "react";
import ReactDOM from "react-dom/client";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FocusProvider } from "./FocusManager";
import { InputProvider } from "./InputManager";

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FocusProvider root={{
        key: 0,
        children: {},
        element: document.body,
        parent: null,
        getPath: () => "",
        onDown: () => {},
      }}>
        <InputProvider>
          <App />
        </InputProvider>
      </FocusProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
