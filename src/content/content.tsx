import { render } from "preact"
import { App } from "../app"
import css from "./content.css?inline"


const host = document.createElement("div")
host.id = "leetcode-overlay-host"

const shadow = host.attachShadow({ mode: "open" })

// inject styles into shadow root
const style = document.createElement("style")
style.textContent = css
shadow.appendChild(style)

const root = document.createElement("div")
root.id = "leetcode-overlay-root"

shadow.appendChild(root)
document.body.appendChild(host)

export const problemSlug = window.location.pathname.split("/")[2]
console.log(problemSlug) // two-sum

const script = document.createElement("script")
script.src = chrome.runtime.getURL("dist/pageScript.js")
script.onload = () => script.remove()
document.documentElement.appendChild(script)


window.addEventListener("message", (event) => {
  if (event.source !== window) return
  if (!event.data || event.data.type !== "LEETCODE_CODE") return

  console.log("User code:", event.data.code)
})

render(<App />, root)
