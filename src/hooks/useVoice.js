import { useState, useRef } from "react";

export function useVoice({ onResult }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggle = () => {
    if (!supported) return;

    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = e => onResult(e.results[0][0].transcript);
    rec.onend    = () => setListening(false);
    rec.onerror  = () => setListening(false);

    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  return { listening, toggle, supported };
}
