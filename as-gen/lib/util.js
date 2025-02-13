"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalize = void 0;
function capitalize(word) {
    return word
        .toLowerCase()
        .replace(/\w/, firstLetter => firstLetter.toUpperCase());
}
exports.capitalize = capitalize;
