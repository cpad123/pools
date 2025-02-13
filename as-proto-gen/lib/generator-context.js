"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorContext = void 0;
const names_1 = require("./names");
class GeneratorContext {
    constructor() {
        this.fileNameToFileDescriptor = new Map();
        this.typeNameToFileDescriptor = new Map();
        this.typeNameToMessageDescriptor = new Map();
    }
    registerFile(fileDescriptor) {
        const fileName = fileDescriptor.getName();
        if (fileName) {
            this.fileNameToFileDescriptor.set(fileName, fileDescriptor);
        }
        for (const messageDescriptor of fileDescriptor.getMessageTypeList()) {
            this.registerMessage(fileDescriptor, messageDescriptor);
        }
        for (const enumDescriptor of fileDescriptor.getEnumTypeList()) {
            this.registerEnum(fileDescriptor, enumDescriptor);
        }
    }
    registerMessage(fileDescriptor, messageDescriptor, messageNamespace) {
        const filePackage = fileDescriptor.getPackage();
        const messageName = messageDescriptor.getName();
        if (!messageName) {
            throw new Error(`Unknown name of the message in ${fileDescriptor.getName()} file.`);
        }
        const messageNameWithNamespace = messageNamespace
            ? `${messageNamespace}.${messageName}`
            : messageName;
        const fieldTypeName = (0, names_1.getFieldTypeName)(filePackage, messageNameWithNamespace);
        this.typeNameToFileDescriptor.set(fieldTypeName, fileDescriptor);
        this.typeNameToMessageDescriptor.set(fieldTypeName, messageDescriptor);
        for (const nestedMessageDescriptor of messageDescriptor.getNestedTypeList()) {
            this.registerMessage(fileDescriptor, nestedMessageDescriptor, messageNameWithNamespace);
        }
        for (const enumDescriptor of messageDescriptor.getEnumTypeList()) {
            this.registerEnum(fileDescriptor, enumDescriptor, messageNameWithNamespace);
        }
    }
    registerEnum(fileDescriptor, enumDescriptor, enumNamespace) {
        const filePackage = fileDescriptor.getPackage();
        const enumName = enumDescriptor.getName();
        if (!enumName) {
            throw new Error(`Unknown name of the enum in ${fileDescriptor.getName()} file.`);
        }
        const enumNameWithNamespace = enumNamespace
            ? `${enumNamespace}.${enumName}`
            : enumName;
        const fieldTypeName = (0, names_1.getFieldTypeName)(filePackage, enumNameWithNamespace);
        this.typeNameToFileDescriptor.set(fieldTypeName, fileDescriptor);
    }
    getFileDescriptorByFileName(fileName) {
        return this.fileNameToFileDescriptor.get(fileName);
    }
    getFileDescriptorByFieldTypeName(fieldTypeName) {
        return this.typeNameToFileDescriptor.get(fieldTypeName);
    }
    getMessageDescriptorByFieldTypeName(fieldTypeName) {
        return this.typeNameToMessageDescriptor.get(fieldTypeName);
    }
}
exports.GeneratorContext = GeneratorContext;
