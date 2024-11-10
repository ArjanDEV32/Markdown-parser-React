# Markdown parse in React
this module converts Markdown into JSX.
It is composed of one function:
```typescript
function MarkDown2JSX(src: String, MDstyle: Object, srcCodeFunction: Function, listFunction: Function): Array
```
and that function takes 4 parameters:

* `src`: the Markdown source code

* `MDstyle`: the styles object composed out of class-names strings with wich you can style some of the markdown components.

 these components are:
  * `header`
  * `link`
  * `codeBlock`
  * `blockQuoteBackground`
  * `blockQuoteLeftBorder`
  * `inlineCodeBlock`
  * `bold`
  * `italic`
  * `linethrough`
  * `bulletList`  

  Each one of these Markdown Components can be given custom styles by giving them a class-name
  and then defining that class-name in a CSS file.

* `srcCodeFunction`: call back function meant to style the source code within a code block.  (optional)
  
  the srcCodeFunction should be a function that looks like this:
  ```typescript
  function srcCodeFunction(src:String, lan:String): JSX
  ```
  Where `src` is the source code and `lan` is the specified language of the source code.

* `listFunction`: call back function meant to determine what glyph comes before the text of a bullet list. (optional)

  the listFunction should be a function that looks like this:  
  ```typescript
  function listFunction(spaces: Number, value: String): String
  ```

  Where `spaces` is the indentation or the amount of spaces that comes before a member of a bullet list and `value` is the text of a particular member of a bullet list.

  # npm install
  `npm i markdown2jsx`
   
