import { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { useChat } from "./hooks/useChat";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import ChatInput from "./components/ChatInput";
import MessageList from "./components/MessageList";

function AppContent() {
  const { theme } = useTheme();
  const {
    messages, input, setInput, loading, error,
    systemPrompt, setSystemPrompt, model, setModel,
    totalUsage, sendMessage, stopGeneration, clearChat,
    bottomRef, inputRef,
  } = useChat();

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        clearChat();
        inputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearChat, inputRef]);

  const sidebarProps = {
    systemPrompt, setSystemPrompt,
    onClear: clearChat,
    messageCount: messages.length,
    model, setModel,
    totalUsage,
  };

  return (
    <div className={`app-container${theme === "light" ? " theme-light" : ""}`}>

      {/* Desktop sidebar */}
      <div className="sidebar">
        <Sidebar {...sidebarProps} />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="drawer">
            <div className="drawer-handle" />
            <Sidebar {...sidebarProps} onClose={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      {/* Main chat */}
      <div className="chat-area">
        <ChatHeader model={model} loading={loading} onMenuOpen={() => setDrawerOpen(true)} />
        <MessageList
          messages={messages}
          error={error}
          bottomRef={bottomRef}
          setInput={setInput}
          inputRef={inputRef}
        />
        <ChatInput
          inputRef={inputRef}
          input={input}
          setInput={setInput}
          loading={loading}
          onSend={sendMessage}
          onStop={stopGeneration}
        />
      </div>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
