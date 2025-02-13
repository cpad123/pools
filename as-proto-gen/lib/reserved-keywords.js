"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReservedKeyword = exports.RESERVED_KEYWORDS = void 0;
exports.RESERVED_KEYWORDS = new Set([
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "enum",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "new",
    "null",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
]);
function isReservedKeyword(word) {
    return exports.RESERVED_KEYWORDS.has(word);
}
exports.isReservedKeyword = isReservedKeyword;
