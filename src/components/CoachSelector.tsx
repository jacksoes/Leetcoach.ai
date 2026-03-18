function CoachSelector({ onSelect }) {
  const coaches = ["default", "strict", "friendly", "interviewer"]

  return (
    <div className="coach-selector">
      <h3>Select your coach</h3>
      {coaches.map((c) => (
        <button key={c} onClick={() => onSelect(c)}>
          {c}
        </button>
      ))}
    </div>
  )
}

export default CoachSelector