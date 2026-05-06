import { useState, useRef, useEffect } from "react";
import { STORAGE_KEY, SYSTEM_PROMPT_DEFAULT } from "../constants";

export function useChat() {
  const [messages, setMessages] = useState(() => {
    try {
      return (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).map(m => ({
        ...m,
        streaming: false,
      }));
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT_DEFAULT);
  const [model, setModel] = useState("gpt-4o");
  const [totalUsage, setTotalUsage] = useState({ prompt: 0, completion: 0 });

  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const stable = messages.filter(m => !m.streaming);
    if (stable.length === messages.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setLoading(true);
    setError(null);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model,
          max_tokens: 1500,
          stream: true,
          stream_options: { include_usage: true },
          messages: [
            { role: "system", content: systemPrompt },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "API error");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const replyTimestamp = Date.now();

      setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true, timestamp: replyTimestamp }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || "";
            assistantContent += delta;
            if (parsed.usage) {
              setTotalUsage(prev => ({
                prompt: prev.prompt + parsed.usage.prompt_tokens,
                completion: prev.completion + parsed.usage.completion_tokens,
              }));
            }
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantContent,
                streaming: true,
                timestamp: replyTimestamp,
              };
              return updated;
            });
          } catch (e) {
            void e;
          }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: assistantContent,
          timestamp: replyTimestamp,
        };
        return updated;
      });
    } catch (e) {
      if (e.name === "AbortError") {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.streaming) {
            updated[updated.length - 1] = { role: last.role, content: last.content, timestamp: last.timestamp };
          }
          return updated;
        });
      } else {
        setMessages(prev => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.streaming) updated.pop();
          return updated;
        });
        setError(e.message);
      }
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const stopGeneration = () => abortRef.current?.abort();

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setTotalUsage({ prompt: 0, completion: 0 });
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    systemPrompt,
    setSystemPrompt,
    model,
    setModel,
    totalUsage,
    sendMessage,
    stopGeneration,
    clearChat,
    bottomRef,
    inputRef,
  };
}
