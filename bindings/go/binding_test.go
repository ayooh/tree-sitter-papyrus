package tree_sitter_papyrus_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_papyrus "github.com/ayooh/tree-sitter-papyrus/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_papyrus.Language())
	if language == nil {
		t.Errorf("Error loading Papyrus grammar")
	}
}
