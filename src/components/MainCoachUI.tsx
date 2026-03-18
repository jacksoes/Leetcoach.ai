function MainCoachUI({ requestCode }) {
  return (
    <div className="coach-body">
      <textarea
        className="coach-input"
        placeholder="Ask your AI coach for a hint..."
      />

      <button onClick={requestCode} className="coach-voice">
        🎤 Speak
      </button>
    </div>
  )
}