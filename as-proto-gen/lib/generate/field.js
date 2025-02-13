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
exports.getFieldWireType = exports.isManagedFieldType = exports.generateFieldTypeInstruction = exports.generateFieldDefaultValue = exports.generateFieldDefaultComparison = exports.generateFieldType = exports.generateFieldTypeBasic = exports.generateFieldName = exports.generateFieldDecodeInstruction = exports.generateFieldEncodeInstruction = void 0;
const descriptor_pb_1 = require("google-protobuf/google/protobuf/descriptor_pb");
const assert = __importStar(require("assert"));
const ref_1 = require("./ref");
var Type = descriptor_pb_1.FieldDescriptorProto.Type;
var Label = descriptor_pb_1.FieldDescriptorProto.Label;
function generateFieldEncodeInstruction(fieldDescriptor, scopeContext) {
    const isRepeated = fieldDescriptor.getLabel() === Label.LABEL_REPEATED;
    const isMessage = fieldDescriptor.getType() === Type.TYPE_MESSAGE;
    const isPacked = fieldDescriptor.getOptions()?.hasPacked();
    const fieldTag = getFieldTag(fieldDescriptor);
    const fieldName = generateFieldName(fieldDescriptor);
    const fieldVariable = 'unique_name_' + scopeContext.getFreeName(fieldName);
    const fieldTypeInstruction = generateFieldTypeInstruction(fieldDescriptor);
    if (isMessage) {
        const Message = (0, ref_1.generateRef)(fieldDescriptor, scopeContext.getFileContext());
        if (isRepeated && isPacked) {
            return `
        const ${fieldVariable} = message.${fieldName};
        writer.uint32(${fieldTag});
        writer.fork();
        for (let i = 0; i < ${fieldVariable}.length; ++i) {
          ${Message}.encode(${fieldVariable}[i], writer);
        }
        writer.ldelim();
      `;
        }
        else if (isRepeated) {
            return `
        const ${fieldVariable} = message.${fieldName};
        for (let i = 0; i < ${fieldVariable}.length; ++i) {
          writer.uint32(${fieldTag});
          writer.fork();
          ${Message}.encode(${fieldVariable}[i], writer);
          writer.ldelim();
        }
      `;
        }
        else {
            return `
        const ${fieldVariable} = message.${fieldName};
        if (${fieldVariable} !== null) {
          writer.uint32(${fieldTag});
          writer.fork();
          ${Message}.encode(${fieldVariable}, writer);
          writer.ldelim();
        }
      `;
        }
    }
    else {
        if (isRepeated && isPacked) {
            return `
        const ${fieldVariable} = message.${fieldName};
        if (${fieldVariable}.length !== 0) {
          writer.uint32(${fieldTag});
          writer.fork();
          for (let i = 0; i < ${fieldVariable}.length; ++i) {
            writer.${fieldTypeInstruction}(${fieldVariable}[i]);
          }
          writer.ldelim();
        }
      `;
        }
        else if (isRepeated) {
            return `
        const ${fieldVariable} = message.${fieldName};
        if (${fieldVariable}.length !== 0) {
          for (let i = 0; i < ${fieldVariable}.length; ++i) {
            writer.uint32(${fieldTag});
            writer.${fieldTypeInstruction}(${fieldVariable}[i]);
          }
        }
      `;
        }
        else if (isManagedFieldType(fieldDescriptor)) {
            return `
        const ${fieldVariable} = message.${fieldName};
        if (${fieldVariable} !== null) {
          writer.uint32(${fieldTag});
          writer.${fieldTypeInstruction}(${fieldVariable});
        }
      `;
        }
        else {
            let defaultCmp = generateFieldDefaultComparison(fieldName, fieldDescriptor, scopeContext);
            return `
        if (${defaultCmp}) {
          writer.uint32(${fieldTag});
          writer.${fieldTypeInstruction}(message.${fieldName});
        }
      `;
        }
    }
}
exports.generateFieldEncodeInstruction = generateFieldEncodeInstruction;
function generateFieldDecodeInstruction(fieldDescriptor, scopeContext) {
    const fileContext = scopeContext.getFileContext();
    const isRepeated = fieldDescriptor.getLabel() === Label.LABEL_REPEATED;
    const isMessage = fieldDescriptor.getType() === Type.TYPE_MESSAGE;
    const isPacked = fieldDescriptor.getOptions()?.hasPacked();
    const fieldNumber = fieldDescriptor.getNumber();
    assert.ok(fieldNumber !== undefined);
    const fieldName = generateFieldName(fieldDescriptor);
    const fieldTypeInstruction = generateFieldTypeInstruction(fieldDescriptor);
    if (isMessage) {
        const Message = (0, ref_1.generateRef)(fieldDescriptor, fileContext);
        if (isRepeated && isPacked) {
            return `
        case ${fieldNumber}:
          const repeatedEnd: usize = reader.ptr + reader.uint32();
          while (reader.ptr < repeatedEnd) {
            message.${fieldName}.push(${Message}.decode(reader, reader.uint32()));
          }
          break;
      `;
        }
        else if (isRepeated) {
            return `
        case ${fieldNumber}:
          message.${fieldName}.push(${Message}.decode(reader, reader.uint32()));
          break;
      `;
        }
        else {
            return `
        case ${fieldNumber}:
          message.${fieldName} = ${Message}.decode(reader, reader.uint32());
          break;
      `;
        }
    }
    else {
        if (isRepeated && isPacked) {
            return `
        case ${fieldNumber}:
          const repeatedEnd: usize = reader.ptr + reader.uint32();
          while (reader.ptr < repeatedEnd) {
            message.${fieldName}.push(reader.${fieldTypeInstruction}());
          }
          break;
      `;
        }
        else if (isRepeated) {
            return `
        case ${fieldNumber}:
          message.${fieldName}.push(reader.${fieldTypeInstruction}());
          break;
      `;
        }
        else {
            return `
        case ${fieldNumber}:
          message.${fieldName} = reader.${fieldTypeInstruction}();
          break;
      `;
        }
    }
}
exports.generateFieldDecodeInstruction = generateFieldDecodeInstruction;
function generateFieldName(fieldDescriptor) {
    const fieldName = fieldDescriptor.getName();
    assert.ok(fieldName);
    return fieldName;
}
exports.generateFieldName = generateFieldName;
function generateFieldTypeBasic(fieldDescriptor, fileContext) {
    switch (fieldDescriptor.getType()) {
        case Type.TYPE_INT32:
        case Type.TYPE_SINT32:
        case Type.TYPE_FIXED32:
        case Type.TYPE_SFIXED32:
            return "i32";
        case Type.TYPE_UINT32:
            return "u32";
        case Type.TYPE_INT64:
        case Type.TYPE_SINT64:
        case Type.TYPE_FIXED64:
        case Type.TYPE_SFIXED64:
            return "i64";
        case Type.TYPE_UINT64:
            return "u64";
        case Type.TYPE_FLOAT:
            return "f32";
        case Type.TYPE_DOUBLE:
            return "f64";
        case Type.TYPE_BOOL:
            return "bool";
        case Type.TYPE_STRING:
            return "string";
        case Type.TYPE_BYTES:
            return "Uint8Array";
        case Type.TYPE_MESSAGE:
        case Type.TYPE_ENUM:
            return (0, ref_1.generateRef)(fieldDescriptor, fileContext);
        default:
            throw new Error(`Type "${fieldDescriptor.getTypeName()}" is not supported by as-proto-gen`);
    }
}
exports.generateFieldTypeBasic = generateFieldTypeBasic;
function generateFieldType(fieldDescriptor, fileContext) {
    const isRepeated = fieldDescriptor.getLabel() === Label.LABEL_REPEATED;
    let typeCode = generateFieldTypeBasic(fieldDescriptor, fileContext);
    if (isRepeated) {
        typeCode = `Array<${typeCode}>`;
    }
    else if (isManagedFieldType(fieldDescriptor)) {
        typeCode = `${typeCode} | null`;
    }
    return typeCode;
}
exports.generateFieldType = generateFieldType;
function generateFieldDefaultComparison(fieldName, fieldDescriptor, scopeContext) {
    const isRepeated = fieldDescriptor.getLabel() === Label.LABEL_REPEATED;
    const defaultValue = fieldDescriptor.getDefaultValue();
    let typeCode = generateFieldTypeBasic(fieldDescriptor, scopeContext.getFileContext());
    if (isRepeated) {
        return `message.${fieldName}.length != 0`;
    }
    else if (defaultValue) {
        return `message.${fieldName} != ${defaultValue}`;
    }
    else {
        switch (fieldDescriptor.getType()) {
            case Type.TYPE_INT32:
            case Type.TYPE_SINT32:
            case Type.TYPE_FIXED32:
            case Type.TYPE_SFIXED32:
            case Type.TYPE_UINT32:
            case Type.TYPE_INT64:
            case Type.TYPE_SINT64:
            case Type.TYPE_FIXED64:
            case Type.TYPE_SFIXED64:
            case Type.TYPE_UINT64:
            case Type.TYPE_ENUM:
                return `message.${fieldName} != 0`;
            case Type.TYPE_FLOAT:
            case Type.TYPE_DOUBLE:
                return `message.${fieldName} != 0.0`;
            case Type.TYPE_BOOL:
                return `message.${fieldName} != false`;
            case Type.TYPE_STRING:
            case Type.TYPE_BYTES:
            case Type.TYPE_MESSAGE:
                return `message.${fieldName} != null`;
            default:
                throw new Error(`Type "${fieldDescriptor.getTypeName()}" is not supported by as-proto-gen`);
        }
    }
}
exports.generateFieldDefaultComparison = generateFieldDefaultComparison;
function generateFieldDefaultValue(fieldDescriptor) {
    const isRepeated = fieldDescriptor.getLabel() === Label.LABEL_REPEATED;
    const defaultValue = fieldDescriptor.getDefaultValue();
    if (isRepeated) {
        return "[]";
    }
    else if (defaultValue) {
        return defaultValue;
    }
    else {
        switch (fieldDescriptor.getType()) {
            case Type.TYPE_INT32:
            case Type.TYPE_SINT32:
            case Type.TYPE_FIXED32:
            case Type.TYPE_SFIXED32:
            case Type.TYPE_UINT32:
            case Type.TYPE_INT64:
            case Type.TYPE_SINT64:
            case Type.TYPE_FIXED64:
            case Type.TYPE_SFIXED64:
            case Type.TYPE_UINT64:
            case Type.TYPE_ENUM:
                return "0";
            case Type.TYPE_FLOAT:
            case Type.TYPE_DOUBLE:
                return "0.0";
            case Type.TYPE_BOOL:
                return "false";
            case Type.TYPE_STRING:
            case Type.TYPE_BYTES:
            case Type.TYPE_MESSAGE:
                return "null";
            default:
                throw new Error(`Type "${fieldDescriptor.getTypeName()}" is not supported by as-proto-gen`);
        }
    }
}
exports.generateFieldDefaultValue = generateFieldDefaultValue;
function generateFieldTypeInstruction(fieldDescriptor) {
    switch (fieldDescriptor.getType()) {
        case Type.TYPE_INT32:
            return "int32";
        case Type.TYPE_SINT32:
            return "sint32";
        case Type.TYPE_FIXED32:
            return "fixed32";
        case Type.TYPE_SFIXED32:
            return "sfixed32";
        case Type.TYPE_UINT32:
            return "uint32";
        case Type.TYPE_INT64:
            return "int64";
        case Type.TYPE_SINT64:
            return "sint64";
        case Type.TYPE_FIXED64:
            return "fixed64";
        case Type.TYPE_SFIXED64:
            return "sfixed64";
        case Type.TYPE_UINT64:
            return "uint64";
        case Type.TYPE_FLOAT:
            return "float";
        case Type.TYPE_DOUBLE:
            return "double";
        case Type.TYPE_BOOL:
            return "bool";
        case Type.TYPE_STRING:
            return "string";
        case Type.TYPE_BYTES:
            return "bytes";
        case Type.TYPE_ENUM:
            return "int32";
        case Type.TYPE_MESSAGE:
            return undefined;
        default:
            throw new Error(`Type "${fieldDescriptor.getTypeName()}" is not supported by as-proto-gen`);
    }
}
exports.generateFieldTypeInstruction = generateFieldTypeInstruction;
function isManagedFieldType(fieldDescriptor) {
    const fieldType = fieldDescriptor.getType();
    assert.ok(fieldType !== undefined);
    switch (fieldType) {
        case Type.TYPE_INT32:
        case Type.TYPE_SINT32:
        case Type.TYPE_FIXED32:
        case Type.TYPE_SFIXED32:
        case Type.TYPE_UINT32:
        case Type.TYPE_INT64:
        case Type.TYPE_SINT64:
        case Type.TYPE_FIXED64:
        case Type.TYPE_SFIXED64:
        case Type.TYPE_UINT64:
        case Type.TYPE_FLOAT:
        case Type.TYPE_DOUBLE:
        case Type.TYPE_BOOL:
        case Type.TYPE_ENUM:
            return false;
        default:
            return true;
    }
}
exports.isManagedFieldType = isManagedFieldType;
function getFieldWireType(fieldDescriptor) {
    const isRepeated = fieldDescriptor.getLabel() === Label.LABEL_REPEATED;
    const isPacked = fieldDescriptor.getOptions()?.hasPacked();
    if (isRepeated && isPacked) {
        return 2;
    }
    const fieldType = fieldDescriptor.getType();
    assert.ok(fieldType !== undefined);
    switch (fieldType) {
        case Type.TYPE_INT32:
        case Type.TYPE_UINT32:
        case Type.TYPE_SINT32:
        case Type.TYPE_INT64:
        case Type.TYPE_UINT64:
        case Type.TYPE_SINT64:
        case Type.TYPE_BOOL:
        case Type.TYPE_ENUM:
            return 0;
        case Type.TYPE_FIXED64:
        case Type.TYPE_SFIXED64:
        case Type.TYPE_DOUBLE:
            return 1;
        case Type.TYPE_FIXED32:
        case Type.TYPE_SFIXED32:
        case Type.TYPE_FLOAT:
            return 5;
        case Type.TYPE_STRING:
        case Type.TYPE_BYTES:
        case Type.TYPE_MESSAGE:
            return 2;
        default:
            throw new Error("Invalid type " + fieldType);
    }
}
exports.getFieldWireType = getFieldWireType;
function getFieldTag(fieldDescriptor) {
    const fieldNumber = fieldDescriptor.getNumber();
    assert.ok(fieldNumber !== undefined);
    return (fieldNumber << 3) | getFieldWireType(fieldDescriptor);
}
