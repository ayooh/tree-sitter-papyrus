((identifier) @variable (#set! priority 95))

(header_line [
  name: (identifier)
  parent: (identifier)
] @type)

(import
	(identifier) @module)

(namespaces
	(identifier) @module)

(function_definition
  name: (identifier) @function)

(event_definition
  name: (identifier) @function)

(type) @type

(struct_definition
	name: (identifier) @constructor)

(parameter
  (identifier) @variable.parameter)

(keyword_argument
  name: (identifier) @variable.parameter)

((identifier) @variable.builtin
  (#match? @variable.builtin "^([Ss][Ee][Ll][Ff]|[Pp][Aa][Rr][Ee][Nn][Tt])$"))

(none) @constant.builtin

[
  (true)
  (false)
] @boolean

(integer) @number

(float) @number.float

(string) @string

(comment) @comment @spell
(documentation_comment) @string.documentation @spell

[
	"Auto"
  "AutoReadOnly"
  "BetaOnly"
  "Collapsed"
  "CollapsedOnBase"
  "CollapsedOnRef"
  "Conditional"
  "Const"
  "Default"
  "DebugOnly"
  "Global"
  "Hidden"
  "Mandatory"
  "Native"
] @keyword.modifier

[
  "%"
  "/"
  "*"
  "-"
  "+"
  "<="
  ">="
  "<"
  ">"
  "!="
  "=="
	"&&"
	"||"
	"!"
	"%="
  "/="
  "*="
  "-="
  "+="
  "="
] @operator

[
  "("
  ")"
  "["
  "]"
] @punctuation.bracket

[
  ":"
  "."
] @punctuation.delimiter

[
  "ScriptName"
  "Extends"
  "Property"
  "EndProperty"
	"Group"
	"EndGroup"
  "CustomEvent"
] @keyword

[
  "Function"
  "EndFunction"
  "Event"
  "EndEvent"
] @keyword.function

[
  "State"
  "EndState"
	"Struct"
	"EndStruct"
] @keyword.type

[
 "As"
 "Is"
 "New"
] @keyword.operator

"Return" @keyword.return

"Import" @keyword.import

[
  "If"
  "ElseIf"
  "Else"
  "EndIf"
] @keyword.conditional

[
  "While"
  "EndWhile"
] @keyword.repeat

(dot_operator
	member: (identifier) @variable.member)

(call_expression
	function: [
		(identifier) @function.call
		(dot_operator
			member: (identifier) @function.call)
])
