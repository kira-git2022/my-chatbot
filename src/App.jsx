import { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { useChat } from "./hooks/useChat";
import { useSearch } from "./hooks/useSearch";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import ChatInput from "./components/ChatInput";
import MessageList from "./components/MessageList";
import SearchBar from "./components/SearchBar";

function AppContent() {
  const { theme } = useTheme();
  const {
    messages, input, setInput, loading, error,
    systemPrompt, setSystemPrompt, model, setModel,
    totalUsage, title, setTitle,
    sendMessage, stopGeneration, clearChat,
    bottomRef, inputRef,
  } = useChat();

  const search = useSearch(messages);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = e => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "k") { e.preventDefault(); clearChat(); inputRef.current?.focus(); }
      if (mod && e.key === "/") { e.preventDefault(); inputRef.current?.focus(); }
      if (mod && e.key === "f") { e.preventDefault(); search.open(); }
      if (e.key === "Escape" && search.isOpen) search.close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearChat, inputRef, search]);

  const sidebarProps = {
    systemPrompt, setSystemPrompt,
    onClear: clearChat,
    messageCount: messages.length,
    model, setModel,
    totalUsage,
  };

  return (
    <div className={`app-container${theme === "light" ? " theme-light" : ""}`}>

      <div className="sidebar">
        <Sidebar {...sidebarProps} />
      </div>

      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="drawer">
            <div className="drawer-handle" />
            <Sidebar {...sidebarProps} onClose={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      <div className="chat-area">
        <ChatHeader
          model={model}
          loading={loading}
          title={title}
          setTitle={setTitle}
          onMenuOpen={() => setDrawerOpen(true)}
          onOpenSearch={search.open}
        />

        {search.isOpen && (
          <SearchBar
            query={search.query}
            setQuery={search.setQuery}
            matchCount={search.matchCount}
            currentDisplayIdx={search.currentDisplayIdx}
            onNext={search.next}
            onPrev={search.prev}
            onClose={search.close}
          />
        )}

        <MessageList
          messages={messages}
          error={error}
          bottomRef={bottomRef}
          setInput={setInput}
          inputRef={inputRef}
          searchQuery={search.isOpen ? search.query : ""}
          matchingIndices={search.matchingIndices}
          currentMatchMsgIdx={search.currentMatchMsgIdx}
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
