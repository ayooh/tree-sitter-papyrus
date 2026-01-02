import XCTest
import SwiftTreeSitter
import TreeSitterPapyrus

final class TreeSitterPapyrusTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_papyrus())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Papyrus grammar")
    }
}
