import { useEffect, useState } from "preact/hooks"
import CoachSelector from "./components/CoachSelector"
import "./content/content.css"
import { COACHES } from "./models/coaches"
import { problemSlug } from "./content/content"

export function App() {
  const [open, setOpen] = useState(false)
  const [selectingCoach, setSelectingCoach] = useState(false)

  const [message, setMessage] = useState("");
  const [leetCodeCode, setLeetCodeCode] = useState<string | null>(null)

  const [sessionId, setSessionId] = useState<string | null>(null)



  async function createConversationSession() {
  try {
    const payload = {
      user_id: "current-user-id", // replace with real user ID from auth
      role: "system",             // or whatever role you want
      content: "default personality", // could be coach-specific
      title_slug: problemSlug,
      model: "us.amazon.nova-lite-v1:0" // or whatever model
    }

    const res = await fetch("http://127.0.0.1:8000/start_chat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    console.log("Created session:", data)

    // store session ID in state
    setSessionId(data.session_id)
    return data.session_id
  } catch (err) {
    console.error("Error creating session:", err)
    return null
  }
}
  

  const [coach, setCoach] = useState(() => {
    const savedId = localStorage.getItem("leetcoach")
    return COACHES.find(c => c.id === savedId) || COACHES[0]
  })

  const sendMessage = (value) => {
    if (!value.trim()) return;
    console.log(value);
    setMessage(() => ""); // 🔥 force fresh state
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
    console.log("Received LeetCode code:", code)

    setLeetCodeCode(code) // ✅ store it in state
  }

  window.addEventListener("message", handleMessage)

  return () => {
    window.removeEventListener("message", handleMessage)
  }
}, [])

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
              sendMessage(message); // ✅ pass state
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

                  console.log(value);
                  requestCode()

                  e.currentTarget.value = ""; // 🔥 instant DOM clear
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
        </div>

      }
    </div>
  )
}