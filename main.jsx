
const bulletMarks = {"+":1,"-":1,"*":1}

function getPattern(pattern, src, i){
  for(let j = 0;  j<pattern.length; j++) if(src[i+j]!=pattern[j]) return 0 
  return i+pattern.length
}

function getPatterns(patterns, src, i){
  let v = 0
  for(const p of patterns) if((v=getPattern(p,src,i))!=0) return v
  return 0
}

function BlockQuotes(l, src, MDstyle){
  let res = []
  for(let i = 0; i<l; i++){ 
    res.push(
      <div className={MDstyle.blockQuoteLeftBorder||""} key={res.length} style={{marginRight:"10px", width:"10px"}}>
       <main >{" "}</main>
      </div>
    )
  }
  res.push(
    <article key={res.length} style={{minWidth: "98%", maxWidth: "min-content"}}>
    <main style={{marginLeft:"20px"}}>{src}</main>
    </article>
  )
  return res
}

function tdORth(fnl,row,rows){
  if(fnl) rows.push(<td key={rows.length}><span>{row}</span></td>)
  else rows.push(<th key={rows.length}><span>{row}</span></th>)
} 

function parseTable(src,i,MDstyle){
  let res = [], md=[], rows=[],row=[], rowtxt = "", cols = 0, ws = 0, fnl = 0
  for(let j=i; j<src.length; j++){

    if(!rows.length && src[j]=='\n' && src[j+1]=='\n') return [true, res, j]
    if(src[j]=='\\') {rowtxt+=src[j+1], j+=2}
    if(!ws && src[j]!=' ') ws = 1
    if(src[j]=='|'||src[j]=='\n'){
      if((row.length||rowtxt.length) && ws){
        if(!fnl) cols+=1
        row.push(rowtxt)
        tdORth(fnl,row,rows)
      }
      if(!fnl && src[j]=='\n' && rows.length) fnl = 1
      rowtxt = "" , ws = 0, row = []
    }
    if((fnl && rows.length==cols) || (src[j]=='\n' && rows.length)) res.push(<tr key={res.length}>{rows}</tr>), rows = []
    if(ws){ 
      if(src[j]=='`'|| src[j]=='~'|| src[j]=='[' || src[j]=='_' || bulletMarks.hasOwnProperty(src[j])){
        md = parseMarkdown(src[j],src,j,MDstyle)
        if(md[0]){
          row.push([rowtxt,md[2]]), j = md[1]-1, rowtxt=""
          if(!fnl) cols+=1
        }
      } else rowtxt+=src[j]
    }
  }
  return [false, res, i]
}

function getRange(src, e, i, style, limit, f){
  let res = "", ep = "", j, res2 = [],md=[]
  for(j = i; j<src.length; j++){
    if(limit!=undefined && getPattern(limit,src,j)!=0) return [res,j,res2,false]
    if((ep=getPatterns(e,src,j))!=0 || (f && j==src.length-1)){
      if(ep!=0) j = ep
      res2.push(<span key={res2.length}>{res}</span>)
      return [res,j, res2, true]
    }
    if(style!=undefined && (src[j]=='`'||src[j]=='['|| src[j]=='~' || src[j]=='_' || bulletMarks.hasOwnProperty(src[j]))){
      md = parseMarkdown(src[j],src,j,style)
      if(md[0]){
        res2.push(<span key={res2.length}>{res}</span>)
        res2.push(<span key={res2.length}>{md[2]}</span>)
        j = md[1]-1, res=""
        continue
      }
    }
    res+=src[j]
  }
  return [res, i, [], false]
}

function bulletTypes(s){
  if(s<=2) return String.fromCharCode(0x2022) // circle bullet
  if(s>2 && s<=4) return String.fromCharCode(0x25E6) // empty circle bullet
  if(s>4 && s<=6) return String.fromCharCode(0x25AA) // square bullet
  return '\u{03A9}'  // omega bullet
}

function getExt(link){
  let ext = ""
  for(let i = link.length-1; link[i]!='.' && i>=0; i--) ext+=link[i]
  return ext 
}

function parseMarkdown(char, src, i, MDstyle){
  let res = []
  if(char=='~' && src[(i+1)%src.length].charCodeAt(0)>32){
    let range = getRange(src,[char],i+1,MDstyle)
    if(range[3]){ 
      if(range[2].length>1) res.push(<span className={MDstyle.linethrough||""} key={res.length} style={{textDecoration:"line-through;"}}>{range[2]}</span>)
      else res.push(<span className={MDstyle.linethrough||""} key={res.length} style={{textDecoration:"line-through"}}>{range[0]}</span>)
      return [true,range[1],res]
    }
  }

  if(((char=='*'&& src[i+1]=='*') || (char=='_' && src[i+1]=='_')) && src[(i+2)%src.length].charCodeAt(0)>32){
    let range = getRange(src,[char+char],i+2,MDstyle)
    if(range[2].length>1) res.push(<span className={MDstyle.bold||""} key={res.length} style={{fontWeight:"bold"}}>{range[2]}</span>)
    else res.push(<span className={MDstyle.bold||""} key={res.length} style={{fontWeight:"bold"}}>{range[0]}</span>)
    return [true, range[1], res]
  }

  if((char=='*'||char=='_') && src[(i+1)%src.length].charCodeAt(0)>32){
    let range = getRange(src,[char],i+1,MDstyle)
    if(range[2].length>1) res.push(<span className={MDstyle.italic||""} key={res.length} style={{fontStyle:"italic"}}>{range[2]}</span>)
    else res.push(<span className={MDstyle.italic||""} key={res.length} style={{fontStyle:"italic"}}>{range[0]}</span>)
    return [true, range[1], res]
  }

  if(char=='['){
    let range = getRange(src,[']'],i+1,MDstyle), range2 = ["#",i]
    let j = range[1]
    if(src[j]=="(") range2 = getRange(src,[')'],j+1)
    res.push(<a className={MDstyle.link||""} href={range2[0]} key={res.length}>{range[2]}</a>)
    if(range2[3]) return [true, range2[1], res]
  }

  if(char=='`'){
    let range = getRange(src,[char],i+1, MDstyle), r = []
    if(range[2].length>1) r = range[2]
    else r = range[0]
      res.push(
        <span className={MDstyle.inlineCodeBlock||""} key={res.length} style={{display:"inline",whiteSpace:"nowrap", justifyContent:"center", borderRadius:"5px"}}>
        <span style={{marginInline:"5px"}}>{r}</span>
        </span>
      ) 
    return  [true, range[1], res]
  }
  return [false]
}

function addRem(res, rem, allowHTML){
  if(allowHTML) res.push(<span key={res.length} dangerouslySetInnerHTML={{__html:rem}}/>)
  else res.push(<span key={res.length} >{rem}</span>)
}

 
/**
 * @param {string} src markdown src code
 * @param {Object} MDstyle styles object meant to style some parts of the markdown
 * @param {Function} srcCodeFunction function meant to style or highlight the text within a code block
 * @param {Function} listFunction function that determines what glyph comes before the text within a bullet list
 * @returns an array of jsx components
 */
export function MarkDown2JSX(src, MDstyle, srcCodeFunction, listFunction, allowHTML){
  let res = [],md=[], rem = "", hc = 0, h = 0, gc = 0, g = 0, indent = 0, char = 0, noIndent = 0 
  for(let i = 0; i<src.length; i++){
    if(src[i]=='\\') {rem+=src[i+1], i+=2}
    char = src[i].charCodeAt(0) 

    if(src[i]=='|'){
      let table = parseTable(src,i+1,MDstyle)
      if(table[0]){
        addRem(res,rem,allowHTML)
        res.push(<table className={MDstyle.table||""} style={{margin:"20px", borderCollapse:"collapse"}} key={res.length}><tbody>{table[1]}</tbody></table>)
        rem = "", i=table[2]
      }
    }

    if(!noIndent && src[i]=="#") h = 1 
    if(h && src[i]=="#") hc+=1
    if(h && (src[i]==' ' && src[i-1]=='#' && hc<=6)){
      rem = rem.slice(0,rem.length-hc)
      let range = getRange(src,["\n"],i+1)
      addRem(res,rem,allowHTML)
      res.push(<div className={MDstyle.header||""} key={res.length} style={{marginInline:"10px", minWidth: "98%", maxWidth: "min-content",display:"flex", fontWeight:"bold", fontSize:`${(8-hc)*5}px`}}>{range[0]}</div>)
      h = 0, hc = 0, i = range[1], rem = "", indent = 0, noIndent = 0
    } 

    if(src[i]=='`' && src[i+1]=='`' && src[i+2]=='`'){
      let range = getRange(src,["```"],i+3), lan = ""
      if(srcCodeFunction!=undefined) {
        lan = range[0].split("\n")[0]
        range[0] = range[0].slice(lan.length,range[0].length)
      }
      addRem(res,rem,allowHTML)
      res.push(
      <article className={MDstyle.codeBlock||""} key={res.length} style={{marginInline:"10px", minWidth: "98%", maxWidth: "min-content", borderRadius:"5px"}}>
        <main style={{marginInline:"10px"}}>{srcCodeFunction!=undefined?srcCodeFunction(range[0],lan):range[0]}</main>
        <br></br>
      </article>)
      rem = "", i = range[1]
    }

    if(src[i]=='`'|| src[i]=='~'|| src[i]=='[' || src[i]=='_' || bulletMarks.hasOwnProperty(src[i])){
      md = parseMarkdown(src[i],src,i,MDstyle)
      if(md[0]){
        addRem(res,rem,allowHTML)
        res.push(<span key={res.length}>{md[2]}</span>)
        i = md[1], rem=""
      }
    } 

    if(src[i]=='>' && src[i-1]=='\n') g = 1
    if(g && src[i]==">") gc+=1
    if((g && src[i]=='>' && src[i+1]==" ")){
      let range = getRange(src,["\n\n","\n>"],i+1,MDstyle), r = []
      rem = rem.slice(0,rem.length-gc)
      addRem(res,rem,allowHTML)
      if(range[2].length>1) r = range[2]
      else r = range[0]
      res.push(
        <div className={MDstyle.blockQuoteBackground||""}  key={res.length} style={{marginInline:"10px", display:"flex", width:"96%",}}>
          {BlockQuotes(gc,r,MDstyle)}
        </div>
      )
      rem = "", i = range[1]-1, gc = 0, g = 0
    }
    
    if(src[i]=='!' && src[i+1]=='[') {
      let range = getRange(src,[']'],i+2), range2 = ["#",0]
      i = range[1]
      if(src[i]=="(") range2 = getRange(src,[')'],i+1), i = range2[1]
      addRem(res,rem,allowHTML)
      let ext = getExt(range2[0])
      if(ext=="pgj" || ext=="gnp" || ext=="pbew") res.push(<img src={range2[0]}  key={res.length} style={JSON.parse("{"+range[0]+"}")||{}}/>)
      if(ext=="4pm" || ext=="fig") res.push(<video src={range2[0]} controls={true}  key={res.length} style={JSON.parse("{"+range[0]+"}")||{}}></video>)
      if(ext=="3pm" || ext=="ggo") res.push(<audio src={range2[0]}  key={res.length} style={JSON.parse("{"+range[0]+"}")||{}}></audio>)
      rem = ""
    }

    if(bulletMarks.hasOwnProperty(src[i]) && !noIndent && src[i+1]==" "){
      let range = getRange(src,["\n"],i+1,MDstyle,undefined,1), c = ""
      addRem(res,rem,allowHTML)
      if(range[2].length>1) c = <span>{range[2]}</span>
      else c = <span>{" "+range[0]}</span>
        res.push(
          <span key={res.length} className={MDstyle.bulletList}>
            <span>{listFunction!=undefined?listFunction(indent,range[0].slice(1,range[0].length)):bulletTypes(indent)}</span>
            {c}
          </span>
        )
      rem = "", i = range[1]-1, indent = 0, noIndent = 0
    } 

    if(char<=32, !noIndent) indent+=1
    if(char>32) noIndent = 1
    if(src[i]=='\n') indent = 0, noIndent = 0, h = 0, hc = 0

    if(i<src.length) rem+=src[i]
  }
  
  addRem(res,rem,allowHTML)
  return res
}
