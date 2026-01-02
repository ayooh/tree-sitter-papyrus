#include "tree_sitter/parser.h"
#include <wctype.h>

enum TokenType { EOL };

void *tree_sitter_papyrus_external_scanner_create() { return NULL; }

void tree_sitter_papyrus_external_scanner_destroy(void *payload) {}

unsigned tree_sitter_papyrus_external_scanner_serialize(void *payload,
                                                        char *buffer) {
  return 0;
}

void tree_sitter_papyrus_external_scanner_deserialize(void *payload,
                                                      const char *buffer,
                                                      unsigned lenght) {}

bool tree_sitter_papyrus_external_scanner_scan(void *playload, TSLexer *lexer,
                                               const bool *valid_symbols) {
  if (valid_symbols[EOL]) {
    while (iswspace(lexer->lookahead) && lexer->lookahead != '\n') {
      lexer->advance(lexer, true);
    }

    if (lexer->eof(lexer) || lexer->lookahead == '\n') {
      lexer->result_symbol = EOL;
      return true;
    }
    return false;
  }

  return false;
}
