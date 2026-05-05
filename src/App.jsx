import { useState, useEffect } from "react";
import { useChat } from "./hooks/useChat";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import ChatInput from "./components/ChatInput";
import MessageList from "./components/MessageList";

export default function App() {
  const {
    messages, input, setInput, loading, error,
    systemPrompt, setSystemPrompt, model, setModel,
    sendMessage, stopGeneration, clearChat,
    bottomRef, inputRef,
  } = useChat();

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const sidebarProps = {
    systemPrompt, setSystemPrompt,
    onClear: clearChat,
    messageCount: messages.length,
    model, setModel,
  };

  return (
    <div className="app-container">

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
