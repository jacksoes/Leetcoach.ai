import { useEffect, useState, useRef } from "preact/hooks";
import CoachSelector from "./components/CoachSelector";
import "./content/content.css";
import { COACHES } from "./models/coaches";
import { problemSlug } from "./content/content";
import ReactMarkdown from "react-markdown";

export function App() {
  const [open, setOpen] = useState(false);
  const [selectingCoach, setSelectingCoach] = useState(false);

  const [message, setMessage] = useState("");
  const [leetCodeCode, setLeetCodeCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [modalCode, setModalCode] = useState<string | null>(null);

  const pendingRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [coach, setCoach] = useState(() => {
    const savedId = localStorage.getItem("leetcoach");
    return COACHES.find(c => c.id === savedId) || COACHES[0];
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("leetcoach", coach.id);
  }, [coach]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== window) return;
      if (!event.data || event.data.type !== "LEETCODE_CODE") return;

      const code = event.data.code;
      const messageValue = pendingRef.current?.message;

      setMessages(prev => [...prev, { role: "user", text: messageValue }]);
      sendMessageToServer(code, messageValue);
      setLeetCodeCode(code);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [sessionId, coach.id]);

  async function createConversationSession() {
    try {
      const payload = {
        user_id: "current-user-id",
        role: "system",
        personality: coach.personality,
        title_slug: problemSlug,
        model: "us.amazon.nova-lite-v1:0"
      };

      const res = await fetch("http://127.0.0.1:8000/start_chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setSessionId(data.session_id);
      return data.session_id;
    } catch (err) {
      console.error("Error creating session:", err);
      return null;
    }
  }

  async function sendMessageToServer(code: string, messageValue: string) {
    if (!sessionId) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/send_message/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          code_snapshot: code,
          user_input: messageValue,
          coach: coach.id,
          problem: problemSlug
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      console.error(err);
    }
  }

  function requestCode() {
    window.postMessage({ type: "GET_LEETCODE_CODE" }, "*");
  }

  if (!open) {
    return (
      <div className="coach-bubble" onClick={() => setOpen(true)}>
        {coach.avatar}
      </div>
    );
  }

  return (
    <div className="coach-overlay">
      {/* Header */}
      <div className="coach-header">
        <div className="coach-avatar" onClick={() => setSelectingCoach(true)}>
          {coach.avatar}
        </div>
        <button className="coach-create" onClick={createConversationSession}>
          Start
        </button>
        <button className="coach-close" onClick={() => setOpen(false)}>
          ✕
        </button>
      </div>

      {/* Coach selector */}
      {selectingCoach ? (
        <CoachSelector
          onSelect={(c) => {
            setCoach(c);
            setSelectingCoach(false);
          }}
        />
      ) : (
        <div className="coach-body">
          <form
            className="coach-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (message.trim()) pendingRef.current = { message };
            }}
          >
            <textarea
              className="coach-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const value = e.currentTarget.value;
                  if (!value.trim()) return;

                  pendingRef.current = { message: value };
                  requestCode();
                  e.currentTarget.value = "";
                  setMessage("");
                }
              }}
            />
          </form>

          <button type="button" onClick={requestCode} className="coach-voice">
            🎤 Speak
          </button>

          {/* Messages */}
          <div className="coach-response-scroll" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`coach-message ${msg.role}`}>
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      if (!inline) {
                        return (
                          <pre
                            className="clickable-code"
                            onClick={() => setModalCode(String(children))}
                            title="Click to expand"
                          >
                            <code {...props}>{children}</code>
                          </pre>
                        );
                      }
                      return <code {...props}>{children}</code>;
                    }
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            ))}
          </div>

          {/* Modal for code preview */}
          {modalCode && (
            <div className="code-modal-overlay" onClick={() => setModalCode(null)}>
              <div className="code-modal-content" onClick={(e) => e.stopPropagation()}>
                <pre>
                  <code>{modalCode}</code>
                </pre>
                <button onClick={() => setModalCode(null)}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}