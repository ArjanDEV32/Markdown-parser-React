import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MarkDown2JSX } from './mth.jsx'
import "./Example/example.css"

function handleSrcCode(src, lan){
  return <span style={{color:"black"}}>{src}</span>
}

function ListIndent(spaces, value){
  if(value=="pi") return String.fromCharCode(0x03C0) // pi symbol 
  if(spaces<=2) return String.fromCharCode(0x2022) // circle bullet
  if(spaces>2 && spaces<=4) return String.fromCharCode(0x25E6) // empty circle bullet
  if(spaces>4 && spaces<=6) return String.fromCharCode(0x25AA) // square bullet
  return '\u{03A9}'
}

const MarkDownStyle = {
  header:"md-header",
  link:"md-link",
  codeBlock:"md-code-block",
  blockQuoteBackground:"md-block-quote-bg",
  blockQuoteLeftBorder:"md-block-quote-lb",
  inlineCodeBlock:"md-inine-code-block"
}

function App(){  
  const [jsx, setJSX] = useState(MarkDown2JSX(`
  # Markdown Example

  # This is a Heading h1
  ## This is a Heading h2

  ### This is a Heading h3
  #### This is a Heading h4
  ##### This is a Heading h5
  ###### This is a Heading h6
  
  * list Item 1 
    * list Item 2
      * list Item 3
        * pi
      * list Item 3
    * list Item 2
  * list Item 1
  
  \`Inline Code Block\`

  *Italic*
  _Italic_

  **Bold**
  __Bold__

  **_bold_ _italic_**

  __\`bold inline code block\`__ 

  **\`_italic_ _bold_ _inline_ _code_ _block_\`**

  [MarkDown link](https://www.markdownguide.org/getting-started/)

  !["width":"100px", "height":"100px"](./src/markdown-icon.webp)

 ### Code Block 
  
\`\`\` javascript
const a = 10
let b = 30
if (b==30) b = 20
\`\`\`



### BlockQuotes


>  Markdown is a lightweight markup language with plain-text-formatting syntax, created in 2004 by John Gruber with Aaron Swartz.

> 

>> Markdown is often used to format readme files, for writing messages in online discussion forums, and to create rich text using a plain text editor.


 ### Escape Examples

  a = 2\\*3*6
  \\#1
  \\\`hello\\\`

  ### Pure HTML Elements

   <input type="search"/>

   <input type="range"/>

`, MarkDownStyle, handleSrcCode, ListIndent))

  return(
   <div style={{
    width:"60vw",
    height:"80vh", 
    boxShadow:" 0 0 4px rgb(200,200,200)", 
    borderRadius:"10px", 
    position:"absolute", 
    left:"calc((100vw - 60vw) / 2)",
    top:"calc((100vh - 80vh) / 2)",
    whiteSpace:"pre-wrap",
    overflowWrap: "break-word",
    color:"rgb(20,10,80)",
    fontFamily:`-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"`,
    overflowY:"scroll",
    overflowX:"hidden"
    }}>
    {jsx}
   </div>
  )
}


createRoot(document.getElementById('md-example-root')).render(
    <App />
)
