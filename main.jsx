
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

function getRange(src, e, i, style, limit, f){
  let res = "", j, ep = "", res2 = [], m = 0
  for(j = i; j<src.length; j++){
    if(limit!=undefined && getPattern(limit,src,j)!=0) return [res,j,res2,false]
    if(!m && (src[j]=='`' || src[j]=='_' || bulletMarks.hasOwnProperty(src[j]))) m = 1
    if((ep=getPatterns(e,src,j))!=0 || (f && j==src.length-1)){
      if(ep!=0) j = ep
      if(style!=undefined && m) res2 = MarkDown2JSX(res,style)
      return [res,j+(!ep), res2, true]
    }
    res+=src[j]
  }
  return [res,i,res2, false]
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
 
/**
 * @param {String} src markdown src code
 * @param {Object} MDstyle styles object meant to style some parts of the markdown
 * @param {Function} srcCodeFunction function meant to style or highlight the text within a code block
 * @param {Function} listFunction function that determines what glyph comes before the text within a bullet list
 * @returns an array of jsx components
 */
export function MarkDown2JSX(src, MDstyle, srcCodeFunction, listFunction){
  let res = [], rem = "", hc = 0, h = 0, gc = 0, g = 0, indent = 0, char = 0, noIndent = 0 
  for(let i = 0; i<src.length; i++){
    if(src[i]=='\\') {rem+=src[i+1], i+=2}
    
    char = src[i].charCodeAt(0) 

    if(!noIndent && src[i]=="#") h = 1 
    if(h && src[i]=="#") hc+=1
    if(h && (src[i]==' ' && src[i-1]=='#' && hc<=6)){
      rem = rem.slice(0,rem.length-hc)
      let range = getRange(src,["\n"],i+1)
      res.push(<span key={res.length} dangerouslySetInnerHTML={{__html:rem}}/>)
      res.push(<div className={MDstyle.header||""} key={res.length} style={{marginInline:"10px", minWidth: "98%", maxWidth: "min-content",display:"flex", fontWeight:"bold", fontSize:`${(8-hc)*5}px`}}>{range[0]}</div>)
      h = 0, hc = 0, i = range[1], rem = "", indent = 0, noIndent = 0
    } 

    if(src[i]=='`' && src[i+1]=='`' && src[i+2]=='`'){
      let range = getRange(src,["```"],i+3), lan = ""
      if(srcCodeFunction!=undefined) {
        lan = range[0].split("\n")[0]
        range[0] = range[0].slice(lan.length,range[0].length)
      }
      res.push(<span key={res.length} dangerouslySetInnerHTML={{__html:rem}}/>)
      res.push(
      <article className={MDstyle.codeBlock||""} key={res.length} style={{marginInline:"10px", minWidth: "98%", maxWidth: "min-content", borderRadius:"5px"}}>
        <main style={{marginInline:"10px"}}>{srcCodeFunction!=undefined?srcCodeFunction(range[0],lan):range[0]}</main>
        <br></br>
      </article>)
      rem = "", i = range[1]
    }

    if(src[i]=='`'){
      let range = getRange(src,[src[i]],i+1, MDstyle)
      res.push(<span key={res.length} dangerouslySetInnerHTML={{__html:rem}}/>)
      if(range[2].length>1){
        res.push(
          <span className={MDstyle.inlineCodeBlock||""} key={res.length} style={{display:"inline",whiteSpace:"nowrap", justifyContent:"center", borderRadius:"5px"}}>
           <span style={{marginInline:"5px"}}>{range[2]}</span>
          </span>
        )
      } else{ 
        res.push(
          <span className={MDstyle.inlineCodeBlock||""} key={res.length} style={{display:"inline",whiteSpace:"nowrap", justifyContent:"center", borderRadius:"5px"}}>
            <span style={{marginInline:"5px"}}>{range[0]}</span>
          </span>
        )
      }
      rem = "", i = range[1]
    }

    if(src[i]=='>' && src[i-1]=='\n') g = 1
    if(g && src[i]==">") gc+=1
    if((g && src[i]=='>' && src[i+1]==" ")){
      let range = getRange(src,["\n\n","\n>"],i+1,MDstyle)
      rem = rem.slice(0,rem.length-gc)
      res.push(<span key={res.length} dangerouslySetInnerHTML={{__html:rem}}/>)
      if(range[2].length>1){
        res.push(
          <div className={MDstyle.blockQuoteBackground||""}  key={res.length} style={{marginInline:"10px", display:"flex", width:"96%",}}>
          {BlockQuotes(gc,range[2],MDstyle)}
          </div>
        )
      } else{
          res.push(
            <div className={MDstyle.blockQuoteBackground||""} key={res.length} style={{marginInline:"10px", display:"flex", width:"96%",}}>
            {BlockQuotes(gc,range[0],MDstyle)}
            </div>
          )
        }
      rem = "", i = range[1]-1, gc = 0, g = 0
    }
    
    if(src[i]=='!' && src[i+1]=='['){
      let range = getRange(src,[']'],i+2), range2 = ["#",0]
      i = range[1]
      if(src[i]=="(") range2 = getRange(src,[')'],i+1), i = range2[1]
      res.push(<span key={res.length} dangerouslySetInnerHTML={{__html:rem}}/>)
      let ext = getExt(range2[0])
      if(ext=="pgj" || ext=="gnp" || ext=="pbew") res.push(<img src={range2[0]}  key={res.length} style={JSON.parse("{"+range[0]+"}")||{}}/>)
      if(ext=="4pm" || ext=="fig") res.push(<video src={range2[0]} controls={true}  key={res.length} style={JSON.parse("{"+range[0]+"}")||{}}></video>)
      if(ext=="3pm" || ext=="ggo") res.push(<audio src={range2[0]}  key={res.length} style={JSON.parse("{"+range[0]+"}")||{}}></audio>)
      rem = ""
    }

    if(src[i]=='['){
      let range = getRange(src,[']'],i+1), range2 = ["#",0]
      i = range[1]
      if(src[i]=="(") range2 = getRange(src,[')'],i+1), i = range2[1]
      res.push(<span key={res.length} dangerouslySetInnerHTML={{__html:rem}}/>)
      res.push(<a className={MDstyle.link||""} href={range2[0]} key={res.length}>{range[0]}</a>)
      rem = ""
    }

    if(((src[i]=='*'&& src[i+1]=='*') || (src[i]=='_' && src[i+1]=='_')) && src[(i+2)%src.length].charCodeAt(0)>32){
      let range = getRange(src,[src[i]+src[i]],i+2,MDstyle)
      res.push(<span key={res.length} dangerouslySetInnerHTML={{__html:rem}}/>)
      if(range[2].length>1) res.push(<span className={MDstyle.bold||""} key={res.length} style={{fontWeight:"bold"}}>{range[2]}</span>)
      else res.push(<span className={MDstyle.bold||""} key={res.length} style={{fontWeight:"bold"}}>{range[0]}</span>)
      rem = "", i = range[1]
    }

    if(src[i]=='~' && src[(i+1)%src.length].charCodeAt(0)>32){
      let range = getRange(src,[src[i]],i+1,MDstyle," ")
      if(range[3]){ 
        res.push(<span key={res.length} dangerouslySetInnerHTML={{__html:rem}}/>)
        if(range[2].length>1) res.push(<span className={MDstyle.linethrough||""} key={res.length} style={{textDecoration:"line-through;"}}>{range[2]}</span>)
        else res.push(<span className={MDstyle.linethrough||""} key={res.length} style={{textDecoration:"line-through"}}>{range[0]}</span>)
        rem = "", i = range[1]
      }
    }     

    if((src[i]=='*'||src[i]=='_') && src[(i+1)%src.length].charCodeAt(0)>32){
      let range = getRange(src,[src[i]],i+1,MDstyle," ")
      if(range[3]){ 
        res.push(<span key={res.length} dangerouslySetInnerHTML={{__html:rem}}/>)
        if(range[2].length>1) res.push(<span className={MDstyle.italic||""} key={res.length} style={{fontStyle:"italic"}}>{range[2]}</span>)
        else res.push(<span className={MDstyle.italic||""} key={res.length} style={{fontStyle:"italic"}}>{range[0]}</span>)
        rem = "", i = range[1]
      }
    }

    if(bulletMarks.hasOwnProperty(src[i]) && !noIndent && src[i+1]==" "){
      let range = getRange(src,["\n"],i+1,MDstyle,undefined,1), c = ""
      res.push(<span key={res.length} dangerouslySetInnerHTML={{__html:rem}}/>)
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
  
  res.push(<span key={res.length} dangerouslySetInnerHTML={{__html:rem}}/>)
  return res
}
