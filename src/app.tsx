import { useEffect, useState, useRef } from "preact/hooks"
import CoachSelector from "./components/CoachSelector"
import "./content/content.css"
import { COACHES } from "./models/coaches"
import { problemSlug } from "./content/content"
import ReactMarkdown from "react-markdown";

export function App() {
  const [open, setOpen] = useState(false)
  const [selectingCoach, setSelectingCoach] = useState(false)

  const [message, setMessage] = useState("");
  const [leetCodeCode, setLeetCodeCode] = useState<string | null>(null)
  const [serverResponse, setServerResponse] = useState<any>(null) // ✅ new state

  const [sessionId, setSessionId] = useState<string | null>(null)

  const pendingRef = useRef<any>(null);

  const [coach, setCoach] = useState(() => {
    const savedId = localStorage.getItem("leetcoach")
    return COACHES.find(c => c.id === savedId) || COACHES[0]
  })

  async function createConversationSession() {
    try {
      const payload = {
        user_id: "current-user-id",
        role: "system",
        personality: coach.personality,
        title_slug: problemSlug,
        model: "us.amazon.nova-lite-v1:0"
      }

      const res = await fetch("http://127.0.0.1:8000/start_chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      console.log("Created session:", data)
      setSessionId(data.session_id)
      return data.session_id
    } catch (err) {
      console.error("Error creating session:", err)
      return null
    }
  }

  const sendMessage = (value) => {
    if (!value.trim()) return;
    console.log(value);
    setMessage(() => "");
  };

  async function sendMessageToServer(code: string, messageValue: string) {
    if (!sessionId) {
      console.error("No session ID!")
      return
    }

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
      })
      const data = await res.json()
      console.log("Server response:", data)
      setServerResponse(data) // ✅ store response to render
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    localStorage.setItem("leetcoach", coach.id)
  }, [coach])

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== window) return
      if (!event.data || event.data.type !== "LEETCODE_CODE") return

      const code = event.data.code
      const messageValue = pendingRef.current?.message
      console.log("Received LeetCode code:", code)
      console.log("RECEIVED MESSAGE DATA:", messageValue)

      sendMessageToServer(code, messageValue)
      setLeetCodeCode(code)
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [sessionId, coach.id])

  function requestCode() {
    window.postMessage({ type: "GET_LEETCODE_CODE" }, "*")
  }

  if (!open) {
    return (
      <div className="coach-bubble" onClick={() => setOpen(true)}>
        {coach.avatar}
      </div>
    )
  }

  return (
    <div className="coach-overlay">
      <div className="coach-header">
        <div className="coach-avatar"
          onClick={() => setSelectingCoach(true)}
        >{coach.avatar}</div>
        <div className="coach-title">LeetCoach</div>

        <button
          className="coach-close"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
      </div>

      {selectingCoach ? (
        <CoachSelector
          onSelect={(c) => {
            setCoach(c)
            setSelectingCoach(false)
          }}
        />
      ) :

        <div className="coach-body">
          <form
            className="coach-form"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(message);
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

                  pendingRef.current = { message: value }
                  requestCode()
                  e.currentTarget.value = "";
                  setMessage("");
                }
              }}
            />
          </form>

          <button type="button" onClick={requestCode} className="coach-voice">
            🎤 Speak
          </button>
          <button type="button" onClick={createConversationSession} className="coach-voice">
            Create convo
          </button>

          {/* ✅ Render server response */}
          {serverResponse && (
  <div className="coach-response-scroll">
    <div className="coach-response-text">
      <ReactMarkdown>
      {serverResponse.reply}
    </ReactMarkdown>
    </div>
  </div>
)}
        </div>
      }
    </div>
  )
}