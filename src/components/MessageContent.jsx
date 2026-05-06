import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import TypingDots from "./TypingDots";

export default function MessageContent({ content, role, streaming }) {
  if (role === "user") {
    return (
      <>
        {content}
        {streaming && <span className="streaming-cursor" />}
      </>
    );
  }

  if (!content && streaming) return <TypingDots />;

  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeStr = String(children).replace(/\n$/, "");
            if (match || codeStr.includes("\n")) {
              return <CodeBlock language={match?.[1] || ""}>{codeStr}</CodeBlock>;
            }
            return <code>{children}</code>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
      {streaming && <span className="streaming-cursor" />}
    </>
  );
}
