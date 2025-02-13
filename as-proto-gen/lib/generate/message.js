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
exports.generateMessage = void 0;
const descriptor_pb_1 = require("google-protobuf/google/protobuf/descriptor_pb");
const field_1 = require("./field");
const enum_1 = require("./enum");
const assert = __importStar(require("assert"));
const scope_context_1 = require("../scope-context");
function generateMessage(messageDescriptor, fileContext, messageNamespace) {
    const messageName = messageDescriptor.getName();
    assert.ok(messageName);
    const messageNameWithNamespace = messageNamespace
        ? `${messageNamespace}.${messageName}`
        : messageName;
    const messageOptions = messageDescriptor.getOptions();
    if (messageOptions !== undefined && messageOptions.getMapEntry()) {
        // TODO: ???
        // this message type is the entry tuple for a map - don't output it
        return "";
    }
    const Message = fileContext.registerDefinition(messageName);
    const MessageClass = `
    ${canMessageByUnmanaged(messageDescriptor, fileContext) ? "@unmanaged" : ""}
    export class ${Message} {      
      ${generateEncodeMethod(messageDescriptor, fileContext)}
      ${generateDecodeMethod(messageDescriptor, fileContext)}
      
      ${generateMessageFieldsDeclarations(messageDescriptor, fileContext)}
      
      ${generateMessageConstructor(messageDescriptor, fileContext)}
    }
  `;
    const nested = [];
    for (const nestedMessageDescriptor of messageDescriptor.getNestedTypeList()) {
        nested.push(generateMessage(nestedMessageDescriptor, fileContext, messageNameWithNamespace));
    }
    for (const nestedEnumDescriptor of messageDescriptor.getEnumTypeList()) {
        nested.push((0, enum_1.generateEnum)(nestedEnumDescriptor, fileContext));
    }
    const MessageNamespace = nested.length
        ? `
      export namespace ${Message} {
        ${nested.join("\n\n")}
      }
    `
        : "";
    return `
    ${MessageClass}
    ${MessageNamespace}
  `;
}
exports.generateMessage = generateMessage;
function generateEncodeMethod(messageDescriptor, fileContext) {
    const messageName = messageDescriptor.getName();
    assert.ok(messageName);
    const Writer = fileContext.registerImport("Writer", "as-proto");
    const Message = fileContext.registerDefinition(messageName);
    const scopeContext = new scope_context_1.ScopeContext(fileContext, ["message", "writer"]);
    return `
    static encode(message: ${Message}, writer: ${Writer}): void {
      ${messageDescriptor
        .getFieldList()
        .map((fieldDescriptor) => `${(0, field_1.generateFieldEncodeInstruction)(fieldDescriptor, scopeContext)}`)
        .join("\n")}
    }
  `;
}
function generateDecodeMethod(messageDescriptor, fileContext) {
    const messageName = messageDescriptor.getName();
    assert.ok(messageName);
    const Reader = fileContext.registerImport("Reader", "as-proto");
    const Message = fileContext.registerDefinition(messageName);
    const scopeContext = new scope_context_1.ScopeContext(fileContext, [
        "reader",
        "length",
        "end",
        "message",
        "tag",
    ]);
    return `
    static decode(reader: ${Reader}, length: i32): ${Message} {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new ${Message}();
      
      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          ${messageDescriptor
        .getFieldList()
        .map((fieldDescriptor) => `${(0, field_1.generateFieldDecodeInstruction)(fieldDescriptor, scopeContext)}`)
        .join("\n")}
          
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
              
      return message;
    }
  `;
}
function generateMessageFieldsDeclarations(messageDescriptor, fileContext) {
    const fields = messageDescriptor.getFieldList();
    return fields
        .map((fieldDescriptor) => `${(0, field_1.generateFieldName)(fieldDescriptor)}: ${(0, field_1.generateFieldType)(fieldDescriptor, fileContext)}`)
        .join(";\n");
}
function generateMessageConstructor(messageDescriptor, fileContext) {
    const fields = messageDescriptor.getFieldList();
    const scopeContext = new scope_context_1.ScopeContext(fileContext);
    const constructorParams = fields
        .map((fieldDescriptor) => `${scopeContext.getSafeName((0, field_1.generateFieldName)(fieldDescriptor))}: ${(0, field_1.generateFieldType)(fieldDescriptor, fileContext)} = ${(0, field_1.generateFieldDefaultValue)(fieldDescriptor)}`)
        .join(",\n");
    const fieldsAssignments = fields
        .map((fieldDescriptor) => `this.${(0, field_1.generateFieldName)(fieldDescriptor)} = ${scopeContext.getSafeName((0, field_1.generateFieldName)(fieldDescriptor))}`)
        .join(";\n");
    return `
    constructor(
      ${constructorParams}
    ) {
     ${fieldsAssignments}
    }
  `;
}
function canMessageByUnmanaged(messageDescriptor, fileContext) {
    return messageDescriptor.getFieldList().every((fieldDescriptor) => {
        if (fieldDescriptor.getLabel() === descriptor_pb_1.FieldDescriptorProto.Label.LABEL_REPEATED) {
            // message with repeated field is not supported as unmanaged
            return false;
        }
        else if (!(0, field_1.isManagedFieldType)(fieldDescriptor)) {
            // not managed type - we're good
            return true;
        }
        else if (fieldDescriptor.getType() === descriptor_pb_1.FieldDescriptorProto.Type.TYPE_MESSAGE) {
            // message type - if message itself is unmanaged, we're good
            const typeName = fieldDescriptor.getTypeName();
            assert.ok(typeName !== undefined);
            const relatedMessageDescriptor = fileContext
                .getGeneratorContext()
                .getMessageDescriptorByFieldTypeName(typeName);
            return relatedMessageDescriptor
                ? canMessageByUnmanaged(relatedMessageDescriptor, fileContext)
                : false;
        }
        else {
            // unsupported managed type
            return false;
        }
    });
}
