"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelativeImport = exports.getTypeName = exports.getFieldTypeName = exports.getProtoFilename = exports.getPathWithoutProto = void 0;
function getPathWithoutProto(fileName) {
    const extension = ".proto";
    return fileName.endsWith(extension)
        ? fileName.slice(0, -extension.length)
        : fileName;
}
exports.getPathWithoutProto = getPathWithoutProto;
function getProtoFilename(fileName) {
    const extension = ".proto";
    const fileNameSlices = fileName.split('/');
    return fileNameSlices[fileNameSlices.length - 1].replace('.proto', '');
}
exports.getProtoFilename = getProtoFilename;
function getFieldTypeName(filePackage, typeName) {
    let fieldTypeName = ".";
    if (filePackage) {
        fieldTypeName += filePackage + ".";
    }
    fieldTypeName += typeName;
    return fieldTypeName;
}
exports.getFieldTypeName = getFieldTypeName;
function getTypeName(fieldTypeName) {
    const fieldTypeNameSlices = fieldTypeName.split('.');
    return fieldTypeNameSlices[fieldTypeNameSlices.length - 1];
}
exports.getTypeName = getTypeName;
function getRelativeImport(importName) {
    return importName.startsWith(".") ? importName : `./${importName}`;
}
exports.getRelativeImport = getRelativeImport;
