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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_pb_1 = require("google-protobuf/google/protobuf/compiler/plugin_pb");
const generator_context_1 = require("./generator-context");
const file_1 = require("./generate/file");
const names_1 = require("./names");
const file_context_1 = require("./file-context");
const prettier_1 = __importDefault(require("prettier"));
const fs = __importStar(require("fs"));
const assert = __importStar(require("assert"));
const input = fs.readFileSync(process.stdin.fd);
try {
    const codeGenRequest = plugin_pb_1.CodeGeneratorRequest.deserializeBinary(input);
    const codeGenResponse = new plugin_pb_1.CodeGeneratorResponse();
    const generatorContext = new generator_context_1.GeneratorContext();
    codeGenResponse.setSupportedFeatures(plugin_pb_1.CodeGeneratorResponse.Feature.FEATURE_PROTO3_OPTIONAL);
    for (const fileDescriptor of codeGenRequest.getProtoFileList()) {
        const fileDescriptorName = fileDescriptor.getName();
        assert.ok(fileDescriptorName);
        generatorContext.registerFile(fileDescriptor);
    }
    for (const fileName of codeGenRequest.getFileToGenerateList()) {
        const fileDescriptor = generatorContext.getFileDescriptorByFileName(fileName);
        assert.ok(fileDescriptor);
        const generatedCode = (0, file_1.generateFile)(fileDescriptor, new file_context_1.FileContext(generatorContext, fileDescriptor));
        let formattedCode = generatedCode;
        try {
            formattedCode = prettier_1.default.format(generatedCode, {
                parser: "typescript",
            });
        }
        catch (error) {
            console.error(error);
        }
        const outputFile = new plugin_pb_1.CodeGeneratorResponse.File();
        outputFile.setName((0, names_1.getPathWithoutProto)(fileName) + ".ts");
        outputFile.setContent(formattedCode);
        codeGenResponse.addFile(outputFile);
    }
    process.stdout.write(Buffer.from(codeGenResponse.serializeBinary().buffer));
}
catch (error) {
    console.log("An error occurred in as-proto generator plugin.");
    console.error(error);
    process.exit(1);
}
