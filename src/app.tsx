import { useEffect, useState } from "preact/hooks"
import CoachSelector from "./components/CoachSelector"
import "./content/content.css"
import { COACHES } from "./models/coaches"
import { problemSlug } from "./content/content"

export function App() {
  const [open, setOpen] = useState(false)
  const [selectingCoach, setSelectingCoach] = useState(false)

  const [message, setMessage] = useState("");


  const [coach, setCoach] = useState(() => {
    const savedId = localStorage.getItem("leetcoach")
    return COACHES.find(c => c.id === savedId) || COACHES[0]
  })

  const sendMessage = (value) => {
    if (!value.trim()) return;
    console.log(value);
    setMessage(() => ""); // 🔥 force fresh state
  };




  useEffect(() => {
    localStorage.setItem("leetcoach", coach.id)
  }, [coach])

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
        <div className="coach-title">LeetCoach {problemSlug}</div>

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

                  e.currentTarget.value = ""; // 🔥 instant DOM clear
                  setMessage("");
                }
              }}
            />
          </form>

          <button type="button" onClick={requestCode} className="coach-voice">
            🎤 Speak
          </button>
        </div>

      }
    </div>
  )
}