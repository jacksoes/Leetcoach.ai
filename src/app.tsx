import { useState } from "preact/hooks"
import "./content/content.css"

import { problemSlug } from "./content/content"

export function App() {
  const [open, setOpen] = useState(false)

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
        <div className="coach-avatar">🤖</div>
        <div className="coach-title">LeetCoach {problemSlug}</div>

        <button
          className="coach-close"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
      </div>

      <div className="coach-body">
        <textarea
          className="coach-input"
          placeholder="Ask your AI coach for a hint..."
        />

        <button onClick={requestCode} className="coach-voice">
          🎤 Speak
        </button>
      </div>
    </div>
  )
}