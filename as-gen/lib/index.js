"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
//
const plugin_pb_1 = require("google-protobuf/google/protobuf/compiler/plugin_pb");
const fs = __importStar(require("fs"));
const prettier_1 = __importDefault(require("prettier"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const util_1 = require("./util");
const input = fs.readFileSync(process.stdin.fd);
const { GENERATE_AUTHORIZE_ENTRY_POINT, RETURN_BUFFER_SIZE } = process.env;
let classTemplate = fs.readFileSync(path_1.default.resolve(__dirname, '../templates/contract-class-template.ts'), 'utf8').toString();
let indexTemplate = fs.readFileSync(path_1.default.resolve(__dirname, '../templates/index-template.ts'), 'utf8').toString();
try {
    const codeGenRequest = plugin_pb_1.CodeGeneratorRequest.deserializeBinary(input);
    const codeGenResponse = new plugin_pb_1.CodeGeneratorResponse();
    // there should be only 1 proto file
    if (codeGenRequest.getFileToGenerateList().length !== 1) {
        throw new Error("Only 1 proto file can be used to generate an ABI");
    }
    codeGenResponse.setSupportedFeatures(plugin_pb_1.CodeGeneratorResponse.Feature.FEATURE_PROTO3_OPTIONAL);
    // there can be only 1 ABI file to generate,
    // so the first file to generate is always the one used to generate the contract class
    const protoFileName = codeGenRequest.getFileToGenerateList()[0];
    let protoFileDescriptor;
    // iterate over the proto files to find the one that will be used to generate the contract class
    for (const fileDescriptor of codeGenRequest.getProtoFileList()) {
        const fileDescriptorName = fileDescriptor.getName();
        if (fileDescriptorName && fileDescriptorName === protoFileName) {
            protoFileDescriptor = fileDescriptor;
        }
    }
    if (protoFileDescriptor === undefined) {
        throw new Error(`Could not find a fileDescriptor for ${protoFileName}`);
    }
    const protoPackage = protoFileDescriptor.getPackage();
    if (!protoPackage) {
        throw new Error(`Could not find a package in ${protoFileName}, this is required`);
    }
    // get the messages comments
    const protoComments = new Map();
    const sourceCodeInfo = protoFileDescriptor.getSourceCodeInfo();
    if (sourceCodeInfo) {
        for (const locationList of sourceCodeInfo.getLocationList()) {
            // the path to a comment is represented as:
            // the comment type: a message comment is always 4
            // the index of the message in the proto file, starting from 0
            const pathToComments = locationList.getPathList();
            if (locationList.getLeadingComments()) {
                protoComments.set(pathToComments.join('.'), locationList.getLeadingComments());
            }
        }
    }
    const contractClassName = (0, util_1.capitalize)(path_1.default.parse(protoFileName).base.replace(".proto", ""));
    // @ts-ignore
    classTemplate = classTemplate.replaceAll('##_CONTRACT_NAME_##', contractClassName);
    // @ts-ignore
    classTemplate = classTemplate.replaceAll('##_PROTO_PACKAGE_##', protoPackage);
    // @ts-ignore
    indexTemplate = indexTemplate.replaceAll('##_CONTRACT_NAME_##', contractClassName);
    // @ts-ignore
    indexTemplate = indexTemplate.replaceAll('##_PROTO_PACKAGE_##', protoPackage);
    let classEntryPoints = '';
    let indexEntryPoints = '';
    // if need to generate the autorize entry point
    if (GENERATE_AUTHORIZE_ENTRY_POINT) {
        classEntryPoints += `
      authorize(args: authority.authorize_arguments): authority.authorize_result {
        // const call = args.call;
        // const type = args.type;

        // YOUR CODE HERE

        const res = new authority.authorize_result();
        res.value = true;

        return res;
      }
      `;
        indexEntryPoints += `
      case 0x4a2dbd90: {
        const args = Protobuf.decode<authority.authorize_arguments>(contractArgs.args, authority.authorize_arguments.decode);
        const res = c.authorize(args);
        retbuf = Protobuf.encode(res, authority.authorize_result.encode);
        break;
      }
      `;
    }
    const messageDescriptors = protoFileDescriptor.getMessageTypeList();
    for (let index = 0; index < messageDescriptors.length; index++) {
        const messageDescriptor = messageDescriptors[index];
        const messageName = messageDescriptor.getName();
        // only parse the messages ending with '_arguments'
        if (messageName?.endsWith('_arguments')) {
            const argumentsMessageDescriptor = messageDescriptor;
            const argumentsMessageName = messageName;
            const methodName = argumentsMessageName.replace('_arguments', '');
            let resultMessageName = `${methodName}_result`;
            const commentsStr = protoComments.get(`4.${index}`);
            if (commentsStr) {
                const comments = commentsStr.split('\n');
                comments.forEach(comment => {
                    if (comment.includes('@result')) {
                        resultMessageName = comment.replace('@result', '').trim();
                    }
                });
            }
            // get the '_result' message
            // @ts-ignore: protoFileDescriptor cannot be undefined here
            const resultMessageDescriptor = protoFileDescriptor.getMessageTypeList().find(md => md.getName() === resultMessageName);
            if (resultMessageDescriptor === undefined) {
                throw new Error(`Could not find the message "${resultMessageName}", this is required`);
            }
            const args = `${protoPackage}.${argumentsMessageName}`;
            const res = `${protoPackage}.${resultMessageName}`;
            const argsFields = [];
            for (const fieldDescriptor of argumentsMessageDescriptor.getFieldList()) {
                const fieldName = fieldDescriptor.getName();
                if (fieldName) {
                    argsFields.push(fieldName);
                }
            }
            const resFields = [];
            for (const fieldDescriptor of resultMessageDescriptor.getFieldList()) {
                const fieldName = fieldDescriptor.getName();
                if (fieldName) {
                    resFields.push(fieldName);
                }
            }
            // generate entry points for the CONTRACT.boilerplate.ts file
            classEntryPoints += `
      ${methodName}(args: ${args}): ${res} {
        ${argsFields.map(field => `// const ${field} = args.${field};`).join('\n')}

        // YOUR CODE HERE

        const res = new ${res}();
        ${resFields.map(field => `// res.${field} = ;`).join('\n')}

        return res;
      }
      `;
            // generate entry points for the index.ts file
            const entryPoindIndex = `0x${crypto_1.default.createHash('sha256').update(methodName).digest('hex')}`.slice(0, 10);
            indexEntryPoints += `
      case ${entryPoindIndex}: {
        const args = Protobuf.decode<ProtoNamespace.${argumentsMessageName}>(contractArgs.args, ProtoNamespace.${argumentsMessageName}.decode);
        const res = c.${methodName}(args);
        retbuf = Protobuf.encode(res, ProtoNamespace.${resultMessageName}.encode);
        break;
      }
      `;
        }
    }
    // @ts-ignore
    classTemplate = classTemplate.replaceAll('##_ENTRY_POINTS_##', classEntryPoints);
    // @ts-ignore
    indexTemplate = indexTemplate.replaceAll('##_ENTRY_POINTS_##', indexEntryPoints);
    const returnBufferSize = RETURN_BUFFER_SIZE || "1024";
    // @ts-ignore
    indexTemplate = indexTemplate.replaceAll('##_RETURN_BUFFER_SIZE_##', returnBufferSize);
    let formattedClassTemplate = classTemplate;
    try {
        formattedClassTemplate = prettier_1.default.format(classTemplate, {
            parser: "typescript",
        });
    }
    catch (error) {
        console.error(error);
    }
    let formattedIndexTemplate = indexTemplate;
    try {
        formattedIndexTemplate = prettier_1.default.format(indexTemplate, {
            parser: "typescript",
        });
    }
    catch (error) {
        console.error(error);
    }
    const outputClassFile = new plugin_pb_1.CodeGeneratorResponse.File();
    outputClassFile.setName(contractClassName + ".boilerplate.ts");
    outputClassFile.setContent(formattedClassTemplate);
    codeGenResponse.addFile(outputClassFile);
    const outputIndexFile = new plugin_pb_1.CodeGeneratorResponse.File();
    outputIndexFile.setName("index.ts");
    outputIndexFile.setContent(formattedIndexTemplate);
    codeGenResponse.addFile(outputIndexFile);
    process.stdout.write(Buffer.from(codeGenResponse.serializeBinary().buffer));
}
catch (error) {
    console.log("An error occurred in koinos-abi-proto-gen generator plugin.");
    console.error(error);
    process.exit(1);
}
