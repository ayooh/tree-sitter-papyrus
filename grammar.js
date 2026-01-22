/**
 * @file Papyrus grammar for tree-sitter
 * @author ayooh
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  ASSIGNMENT: 1,
  LOGICAL_OR: 2,
  LOGICAL_AND: 3,
  COMPARE: 4,
  PLUS: 5,
  TIMES: 6,
  NEG: 7,
  CAST: 8,
  MEMBER: 9,
  PARENTHESIS: 10,
}

export default grammar({
  name: "papyrus",

  extras: $ => [
    /[ \t\r]/,
    $.comment,
    $.line_terminator,
  ],

  externals: $ => [$.eol],

  supertypes: $ => [
    $.expression,
  ],

  reserved: {
    global: _ => [
      /As/i, /Auto/i, /AutoReadOnly/i, /Bool/i, /Else/i, /ElseIf/i, /EndEvent/i,
      /EndFunction/i, /EndIf/i, /EndProperty/i, /EndState/i, /EndWhile/i, /Event/i,
      /Extends/i, /False/i, /Float/i, /Function/i, /Global/i, /If/i, /Import/i,
      /Int/i, /Length/i, /Native/i, /New/i, /None/i, /Property/i, /Return/i,
      /ScriptName/i, /State/i, /String/i, /True/i, /While/i,

      // keywords added in Fallout 4
      // /BetaOnly/i, /Const/i, /CustomEvent/i, /CustomEventName/i, /DebugOnly/i,
      // /EndGroup/i, /EndStruct/i, /Group/i, /Is/i, /ScriptEventName/i, /Struct/i,
      // /StructVarName/i, /Var/i,
    ],
  },

  word: $ => $.identifier,

  rules: {
    source_file: $ => seq(
      repeat($._newline),
      with_doc($.header_line),
      repeat(choice($._top_level_item, $._newline)),
    ),

    header_line: $ => seq(
      keyword("ScriptName"),
      $._full_identifier,
      optional(seq(keyword("Extends"), field("parent", $.identifier))),
      repeat($._script_flag),
      $.eol,
    ),

    _top_level_item: $ => choice(
      $.import,
      $.variable_definition,
      $.struct_definition,
      $.custom_event_definition,
      $._property_definition,
      $.group_definition,
      $.state_definition,
      $._function_definition,
      $._event_definition,
    ),

    import: $ => seq(keyword("Import"), $._full_identifier, $.eol),

    variable_definition: $ => seq(
      field("type", $.type),
      field("name", $.identifier),
      optional(seq(
        "=",
        field("value", $.literal),
      )),
      repeat($._variable_flag),
      $.eol,
    ),

    struct_definition: $ => seq(
      keyword("Struct"),
      field("name", $.identifier),
      $.eol,
      repeat(choice(
        with_doc($.variable_definition),
        $._newline,
      )),
      keyword("EndStruct"),
      $.eol,
    ),

    custom_event_definition: $ => seq(
      keyword("CustomEvent"),
      field("name", $.identifier),
      $.eol,
    ),

    _property_definition: $ => choice(
      $.property_definition,
      with_doc(alias($._auto_property_definition, $.property_definition)),
    ),

    property_definition: $ => seq(
      with_doc(seq(
        field("type", $.type),
        keyword("Property"),
        field("name", $.identifier),
        repeat($._property_flag),
        $.eol,
      )),
      // at least one function must exist.
      repeat(choice(
        // normal function
        $.function_definition,
        $._newline,
      )),
      keyword("EndProperty"),
      $.eol,
    ),

    _auto_property_definition: $ => seq(
      field("type", $.type),
      keyword("Property"),
      field("name", $.identifier),
      optional(seq("=", field("value", $.literal))),
      repeat($._property_flag), // it just work
      choice(
        keyword("Auto"),
        keyword("AutoReadOnly"),
      ),
      repeat($._property_flag),
      $.eol,
    ),

    group_definition: $ => seq(
      with_doc(seq(
        keyword("Group"),
        field("name", $.identifier),
        optional($._group_flag),
        $.eol,
      )),
      // must contain at least one property.
      repeat(choice($._property_definition, $._newline)),
      keyword("EndGroup"),
      $.eol,
    ),

    state_definition: $ => seq(
      optional(keyword("Auto")),
      keyword("State"),
      field("name", $.identifier),
      $.eol,
      repeat(choice(
        $._function_definition,
        $._event_definition,
        $._newline,
      )),
      keyword("EndState"),
      $.eol,
    ),

    _function_definition: $ => choice(
      $.function_definition,
      with_doc(alias($._native_function_definition, $.function_definition)),
    ),

    function_definition: $ => seq(
      with_doc(seq(
        $._function_definition_header,
        repeat(choice(
          $._function_flag,
          keyword("Global"),
        )),
        $.eol,
      )),
      field("body", alias(repeat($._statement), $.block)),
      keyword("EndFunction"),
      $.eol,
    ),

    _native_function_definition: $ => seq(
      $._function_definition_header,
      optional(keyword("Global")),
      keyword("Native"),
      repeat(choice(
        $._function_flag,
        keyword("Global"),
      )),
      $.eol,
    ),

    _function_definition_header: $ => seq(
      optional(field("return_type", $.type)),
      keyword("Function"),
      field("name", $.identifier),
      field("parameters", $.parameters),
    ),

    _event_definition: $ => choice(
      $.event_definition,
      with_doc(alias($._native_event_definition, $.event_definition)),
    ),

    event_definition: $ => seq(
      with_doc(seq(
        $._event_definition_header,
        repeat($._function_flag),
        $.eol,
      )),
      field("body", alias(repeat($._statement), $.block)),
      keyword("EndEvent"),
      $.eol,
    ),

    _native_event_definition: $ => seq(
      $._event_definition_header,
      keyword("Native"),
      repeat($._function_flag),
      $.eol,
    ),

    _event_definition_header: $ => seq(
      keyword("Event"),
      optional(seq(field("object", $.identifier), ".")),
      field("name", $.identifier),
      field("parameters", $.parameters),
    ),

    parameters: $ => seq(
      "(",
      optional(sep1($.parameter, ",")),
      ")",
    ),

    parameter: $ => seq(
      field("type", $.type),
      // field("type", choice(
      //   $.type,
      //   alias(keyword("CustomEventName"), $.type),
      //   alias(keyword("ScriptEventName"), $.type),
      //   alias(keyword("StructVarName"), $.type),
      // )),
      field("name", $.identifier),
      optional(seq("=", field("value", $.literal))),
    ),

    _statement: $ => choice(
      $._simple_statement,
      $._compound_statement,
      $._newline,
    ),

    _simple_statement: $ => choice(
      $.define_statement,
      $.assign_statement,
      $.return_statement,
      $.expression_statement,
    ),

    expression: $ => choice(
      $.binary_operator,
      $.comparison_operator,
      $.unary_operator,
      $.cast_operator,
      $.type_check_operator,
      $.dot_operator,
      $.literal,
      $.array_expression,
      $.parenthesized_expression,
      $.new_expression,
      $.call_expression,
      $.identifier,
    ),

    _compound_statement: $ => choice(
      $.if_statement,
      $.while_statement,
    ),

    if_statement: $ => seq(
      keyword("If"),
      field("condition", $.expression),
      $.eol,
      alias(repeat($._statement), $.block),
      repeat(field("alternative", $.else_if_clause)),
      optional(field("alternative", $.else_clause)),
      keyword("EndIf"),
      $.eol,
    ),

    else_if_clause: $ => seq(
      keyword("ElseIf"),
      field("condition", $.expression),
      $.eol,
      alias(repeat($._statement), $.block),
    ),

    else_clause: $ => seq(
      keyword("Else"),
      alias(repeat($._statement), $.block),
    ),

    while_statement: $ => seq(
      keyword("While"),
      field("condition", $.expression),
      $.eol,
      alias(repeat($._statement), $.block),
      keyword("EndWhile"),
      $.eol,
    ),

    define_statement: $ => seq(
      field("type", $.type),
      field("name", $.identifier),
      optional(seq(
        "=",
        field("value", $.expression),
      )),
      $.eol,
    ),

    assign_statement: $ => prec.left(PREC.ASSIGNMENT, seq(
      field("left", $._l_value),
      field("operator", choice(
        "=",
        "+=",
        "-=",
        "*=",
        "/=",
        "%="
      )),
      field("right", $.expression),
      $.eol,
    )),

    _l_value: $ => choice(
      $.identifier,
      $.dot_operator,
      $.array_expression,
    ),

    return_statement: $ => seq(
      keyword("Return"),
      optional($.expression),
      $.eol,
    ),

    expression_statement: $ => seq(
      $.expression,
      $.eol,
    ),

    binary_operator: $ => choice(
      ...[
        ["||", PREC.LOGICAL_OR],
        ["&&", PREC.LOGICAL_AND],
        ["+", PREC.PLUS],
        ["-", PREC.PLUS],
        ["*", PREC.TIMES],
        ["/", PREC.TIMES],
        ["%", PREC.TIMES],
      ].map(([op, p]) => prec.left(p, seq(
        field("left", $.expression),
        // @ts-ignore
        field("operator", op),
        field("right", $.expression),
      )))
    ),

    comparison_operator: $ => prec.left(PREC.COMPARE, seq(
      $.expression,
      field("operator",
        choice("==", "!=", ">", "<", ">=", "<=")
      ),
      $.expression,
    )),

    unary_operator: $ => prec.left(PREC.NEG, seq(
      field("operator", choice("-", "!")),
      field("argument", $.expression),
    )),

    cast_operator: $ => prec.left(PREC.CAST, seq(
      $.expression, keyword("As"), $.type,
    )),

    type_check_operator: $ => prec.left(PREC.CAST, seq(
      $.expression, keyword("Is"), $.type,
    )),

    dot_operator: $ => prec.left(PREC.MEMBER, seq(
      field("object", $.expression),
      ".",
      field("member", choice($.identifier, alias(keyword("Length"), $.identifier))),
    )),

    literal: $ => choice(
      $.true,
      $.false,
      $.integer,
      $.float,
      $.string,
      $.none,
    ),

    true: _ => /True/i,

    false: _ => /False/i,

    integer: _ => choice(
      /-?\d+/,
      /0[xX][0-9a-fA-F]+/,
    ),

    float: _ => /-?\d+\.\d+/,

    string: _ => token(seq('"', token.immediate(/([^\"\n\\]|\\.)*/), '"')),

    none: _ => /None/i,

    array_expression: $ => seq(
      $.expression, "[", $.expression, "]"
    ),

    parenthesized_expression: $ => prec.left(PREC.PARENTHESIS, seq(
      "(",
      $.expression,
      ")",
    )),

    new_expression: $ => prec.right(seq(
      keyword("New"),
      alias($._element_type, $.type),
      optional(seq("[", $.expression, "]")),
    )),

    call_expression: $ => prec.left(PREC.PARENTHESIS, seq(
      field("function", choice($.dot_operator, $.identifier)),
      field("arguments", $.arguments),
    )),

    arguments: $ => seq(
      "(",
      optional(sep1(choice($.expression, $.keyword_argument), ",")),
      ")",
    ),

    keyword_argument: $ => seq(
      $.identifier, "=", $.expression,
    ),

    _script_flag: _ => choice(
      keyword("Native"),
      keyword("Hidden"),
      keyword("Conditional"),
      keyword("Const"),
      keyword("Default"),
      keyword("DebugOnly"),
      keyword("BetaOnly"),
    ),

    _property_flag: _ => choice(
      keyword("Hidden"),
      keyword("Mandatory"),

      // for auto property
      keyword("Conditional"),
      keyword("Const"),
    ),

    _variable_flag: _ => choice(
      keyword("Conditional"),
      keyword("Const"),
      keyword("Hidden"),
    ),

    _group_flag: _ => choice(
      keyword("CollapsedOnRef"),
      keyword("CollapsedOnBase"),
      keyword("Collapsed"),
    ),

    _function_flag: _ => choice(
      keyword("DebugOnly"),
      keyword("BetaOnly"),
    ),

    type: $ => seq(
      $._element_type,
      optional("[]"),
    ),

    _element_type: $ => choice(
      keyword("Bool"),
      keyword("Int"),
      keyword("Float"),
      keyword("String"),
      keyword("Var"),
      $._full_identifier,
    ),


    _full_identifier: $ => seq(
      field("namespaces", alias(repeat(seq($.identifier, ":")), $.namespaces)),
      field("name", $.identifier),
    ),

    comment: _ => token(choice(
      seq(";", /.*/),
      seq(";/", /[^/]*\/*([^;/][^/]*\/*)*/, "/;"),
    )),

    documentation_comment: _ => token(seq("{", /[^}]*/, "}")),

    _newline: _ => "\n",

    line_terminator: $ => seq("\\", $._newline),

    identifier: _ => /[a-zA-Z_][a-zA-Z_0-9]*/,
  }
});

/**
 * @param {string} word
 * @param {boolean} aliasAsWord
 */
function keyword(word, aliasAsWord = true) {
  let result = new RegExp(word, "i");
  if (aliasAsWord)
    return alias(result, word);
  return result;
}

/**
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} separator
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

/**
 * @param {RuleOrLiteral} rule
 */
function with_doc(rule) {
  return seq(rule, repeat(token(prec(0, "\n"))), optional(sym("documentation_comment")))
}
