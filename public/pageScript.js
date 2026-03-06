function getLeetCodeCode() {
  const editors = window.monaco?.editor?.getModels()

  if (!editors || editors.length === 0) {
    console.log("No Monaco editor found")
    return
  }
  
  const code = editors[0].getValue()

  console.log("Current code:", code)

  window.postMessage({
    type: "LEETCODE_CODE",
    code: code
  })
}

setTimeout(getLeetCodeCode, 2000)