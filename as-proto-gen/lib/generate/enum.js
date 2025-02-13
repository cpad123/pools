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
exports.generateEnum = void 0;
const assert = __importStar(require("assert"));
function generateEnum(enumDescriptor, fileContext) {
    const enumName = enumDescriptor.getName();
    assert.ok(enumName !== undefined);
    const Enum = fileContext.registerDefinition(enumName);
    const enumValues = enumDescriptor.getValueList();
    return `
    export enum ${Enum} {
      ${enumValues
        .map((valueDescriptor) => generateEnumValue(valueDescriptor))
        .join(",\n")}
    }
  `;
}
exports.generateEnum = generateEnum;
function generateEnumValue(valueDescriptor) {
    const valueName = valueDescriptor.getName();
    assert.ok(valueName !== undefined);
    const valueNumber = valueDescriptor.getNumber();
    assert.ok(valueNumber !== undefined);
    return `${valueName} = ${valueNumber}`;
}
