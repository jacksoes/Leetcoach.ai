import { COACHES } from "../models/coaches"


function CoachSelector({ onSelect }) {
  return (
    <div className="coach-selector">
      <h3>Select your coach</h3>

      {COACHES.map((c) => (
        <button key={c.id} onClick={() => onSelect(c)} className="coach-option">
          <span className="coach-avatar">{c.avatar}</span>

          <div>
            <div>{c.name}</div>
            <small>{c.type}</small>
          </div>
        </button>
      ))}
    </div>
  )
}

export default CoachSelector