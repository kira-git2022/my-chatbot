import { useState, useMemo } from "react";

export function useSearch(messages) {
  const [query, setQuery]           = useState("");
  const [isOpen, setIsOpen]         = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const matchingIndices = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return messages.reduce((acc, m, i) => {
      if (m.content.toLowerCase().includes(q)) acc.push(i);
      return acc;
    }, []);
  }, [messages, query]);

  const setQueryAndReset = q => { setQuery(q); setCurrentIdx(0); };

  const open  = () => setIsOpen(true);
  const close = () => { setIsOpen(false); setQueryAndReset(""); };

  const next = () => {
    if (!matchingIndices.length) return;
    setCurrentIdx(i => (i + 1) % matchingIndices.length);
  };
  const prev = () => {
    if (!matchingIndices.length) return;
    setCurrentIdx(i => (i - 1 + matchingIndices.length) % matchingIndices.length);
  };

  const safeIdx            = matchingIndices.length ? currentIdx % matchingIndices.length : -1;
  const currentMatchMsgIdx = safeIdx >= 0 ? matchingIndices[safeIdx] : -1;

  return {
    query, setQuery: setQueryAndReset,
    isOpen, open, close,
    matchingIndices,
    currentMatchMsgIdx,
    matchCount:        matchingIndices.length,
    currentDisplayIdx: safeIdx,
    next, prev,
  };
}
