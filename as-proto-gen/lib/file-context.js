"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileContext = void 0;
const path = __importStar(require("path"));
class FileContext {
    constructor(generatorContext, fileDescriptor) {
        this.registeredImports = new Map();
        this.registeredDefinitions = new Set();
        this.importNames = new Set();
        this.generatorContext = generatorContext;
        this.fileDescriptor = fileDescriptor;
    }
    getGeneratorContext() {
        return this.generatorContext;
    }
    getFileDescriptor() {
        return this.fileDescriptor;
    }
    registerImport(importNamePath, importPath) {
        const [importName, ...importNamespace] = importNamePath.split(".");
        if (!importName) {
            throw new Error(`Cannot register empty import of ${importNamePath} from ${importPath}.`);
        }
        const importNames = this.registeredImports.get(importPath) || new Map();
        const uniqueImportName = importNames.get(importName) || this.getUniqueName(importName);
        importNames.set(importName, uniqueImportName);
        this.registeredImports.set(importPath, importNames);
        return [uniqueImportName, ...importNamespace].join(".");
    }
    registerDefinition(definitionNamePath) {
        const [definitionName] = definitionNamePath.split(".");
        if (!this.registeredDefinitions.has(definitionName)) {
            if (this.importNames.has(definitionName)) {
                // update import to prevent name collision
                const nextUniqueImportName = this.getUniqueName(definitionName);
                for (const [importPath, importNames] of this.registeredImports) {
                    for (const [importName, uniqueImportName] of importNames) {
                        if (uniqueImportName === definitionName) {
                            importNames.set(importName, nextUniqueImportName);
                        }
                    }
                }
            }
            this.registeredDefinitions.add(definitionName);
        }
        // reserve this name
        this.importNames.add(definitionName);
        return definitionNamePath;
    }
    getImportsCode() {
        let importLines = [];
        for (const [importPath, importNames] of this.registeredImports) {
            let relativeImportPath = importPath === 'as-proto' ? importPath : path.relative(this.fileDescriptor.getName(), importPath);
            const relativeImportPathSlices = relativeImportPath.split('/');
            if (relativeImportPathSlices.length > 2) {
                relativeImportPath = relativeImportPath.replace(/\.\.\//, '');
            }
            else if (relativeImportPathSlices.length > 1) {
                relativeImportPath = relativeImportPath.replace(/\.\.\//, './');
            }
            const importFields = [];
            for (const [importName, uniqueImportName] of importNames) {
                const isAliased = importName !== uniqueImportName;
                importFields.push(isAliased ? `${importName} as ${uniqueImportName}` : `${importName}`);
            }
            importLines.push(`import { ${importFields.join(", ")} } from ${JSON.stringify(relativeImportPath)};`);
        }
        return importLines.join("\n");
    }
    getUniqueName(importName) {
        let uniqueImportName = importName;
        let uniqueSuffix = 2;
        while (this.importNames.has(uniqueImportName)) {
            uniqueImportName = `${importName}_${uniqueSuffix++}`;
        }
        return uniqueImportName;
    }
}
exports.FileContext = FileContext;
