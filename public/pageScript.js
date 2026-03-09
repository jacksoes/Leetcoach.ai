function getLeetCodeCode() {
  const editors = window.monaco?.editor?.getModels()

  if (!editors || editors.length === 0) {
    console.log("No Monaco editor found")
    return null
  }

  return editors[0].getValue()
}

window.addEventListener("message", (event) => {
  if (event.source !== window) return
  if (!event.data || event.data.type !== "GET_LEETCODE_CODE") return

  const code = getLeetCodeCode()

  window.postMessage({
    type: "LEETCODE_CODE",
    code
  }, "*")
})