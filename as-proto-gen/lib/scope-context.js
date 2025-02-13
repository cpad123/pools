"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeContext = void 0;
const reserved_keywords_1 = require("./reserved-keywords");
class ScopeContext {
    constructor(fileContext, reservedNames = []) {
        this.fileContext = fileContext;
        this.reservedNames = new Set(reservedNames);
    }
    getFileContext() {
        return this.fileContext;
    }
    getFreeName(preferredName) {
        let freeName = this.getSafeName(preferredName);
        let freeSuffix = 2;
        while (this.reservedNames.has(freeName)) {
            freeName = `${preferredName}_${freeSuffix++}`;
        }
        return freeName;
    }
    getSafeName(name) {
        return (0, reserved_keywords_1.isReservedKeyword)(name) ? `${name}_` : name;
    }
}
exports.ScopeContext = ScopeContext;
