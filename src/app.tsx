import { useState } from "preact/hooks"
import CoachSelector from "./components/CoachSelector"
import "./content/content.css"

import { problemSlug } from "./content/content"

export function App() {
  const [open, setOpen] = useState(false)
  const [selectingCoach, setSelectingCoach] = useState(false)
  const [coach, setCoach] = useState("default")

  function requestCode() {
    window.postMessage({ type: "GET_LEETCODE_CODE" }, "*")
  }

  if (!open) {
    return (
      <div className="coach-bubble" onClick={() => setOpen(true)}>
        🤖
      </div>
    )
  }

  return (
    <div className="coach-overlay">
      <div className="coach-header">
        <div className="coach-avatar"
          onClick={() => setSelectingCoach(true)}
        >🤖</div>
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
        <textarea
          className="coach-input"
          placeholder="Ask your AI coach for a hint..."
        />

        <button onClick={requestCode} className="coach-voice">
          🎤 Speak
        </button>
      </div>
  }
    </div>
  )
}