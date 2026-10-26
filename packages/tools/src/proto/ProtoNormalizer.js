import Assert from '../core/Assert.js';

const EXTENSIONS_FILE = 'valveextensions.proto';

const ADDITIONAL_INCLUDES_PATTERN = /^[ \t]*option additional_includes = "[^"]*";[ \t]*\r?\n/gm;
const FIELD_OPTIONS_PATTERN = /\[([^[\]]*)\]/g;
const IMPORT_PATTERN = /^import (?:public )?"([^"]+)";/gm;
const OPTION_USAGE_PATTERN = /\((?:boxed_type|synthetic_default)\)\s*=/;
const OPTION_DECLARATION_PATTERN = /\boptional string boxed_type\s*=/;

const VALVE_FIELD_OPTIONS = [ 'boxed_type', 'synthetic_default' ];

const OPTION_DECLARATIONS = `
extend .google.protobuf.FieldOptions {
	optional string boxed_type = 61500;
	optional string synthetic_default = 61501;
}
`;

/**
 * Normalizes .proto files to ensure compatibility with buf.
 */
class ProtoNormalizer {
    /**
     * @public
     * @static
     * @param {string} file
     * @param {string} text
     * @returns {string}
     */
    static normalize(file, text) {
        Assert.isTrue(typeof file === 'string' && typeof text === 'string');

        const chain = [
            stripAdditionalIncludes,
            wrapFieldOptions,
            declareFieldOptions,
            importFieldOptions
        ];

        return chain.reduce((normalized, fn) => {
            return fn(file, normalized);
        }, text);
    }

    /**
     * @public
     * @static
     * @param {string} content
     * @returns {Array<string>}
     */
    static getImports(content) {
        return Array.from(content.matchAll(IMPORT_PATTERN), match => match[1]);
    }
}

/**
 * Removes `option additional_includes`: C++ headers.
 *
 * @param {string} file
 * @param {string} content
 * @returns {string}
 */
function stripAdditionalIncludes(file, content) {
    Assert.isTrue(typeof content === 'string');

    return content.replace(ADDITIONAL_INCLUDES_PATTERN, '');
}

/**
 * Wraps field options in parentheses: `buf` reads them as the extensions.
 *
 * @example
 *
 * Input:
 *
 * optional fixed32 player = 1 [default = 16777215, boxed_type = "CEHandleNetworkableInt", synthetic_default = "16777215"];
 *
 * Output:
 *
 * optional fixed32 player = 1 [default = 16777215, (boxed_type) = "CEHandleNetworkableInt", (synthetic_default) = "16777215"];
 *
 * @param {string} file
 * @param {string} content
 * @returns {string}
 */
function wrapFieldOptions(file, content) {
    Assert.isTrue(typeof content === 'string');

    return content.replace(FIELD_OPTIONS_PATTERN, (match, fieldOptions) => {
        const wrapped = VALVE_FIELD_OPTIONS.reduce((result, option) => {
            const pattern = new RegExp(
                `(^|[\\s,])${option}(\\s*=)`,
                'g'
            );

            return result.replace(pattern, `$1(${option})$2`);
        }, fieldOptions);

        return `[${wrapped}]`;
    });
}

/**
 * Declares field options in `valveextensions.proto` as `FieldOptions` extensions 61500 and 61501.
 *
 * @param {string} file
 * @param {string} content
 * @returns {string}
 */
function declareFieldOptions(file, content) {
    if (file !== EXTENSIONS_FILE) {
        return content;
    }

    return OPTION_DECLARATION_PATTERN.test(content) ? content : `${content.trimEnd()}\n${OPTION_DECLARATIONS}`;
}

/**
 * Imports `valveextensions.proto` into a file that uses field options.
 *
 * @param {string} file
 * @param {string} content
 * @returns {string}
 */
function importFieldOptions(file, content) {
    const hasFieldOptions = OPTION_USAGE_PATTERN.test(content);

    if (!hasFieldOptions) {
        return content;
    }

    const imports = ProtoNormalizer.getImports(content);

    if (imports.includes(EXTENSIONS_FILE)) {
        return content;
    }

    return addImport(content, EXTENSIONS_FILE);
}

/**
 * Adds the import after the last one, or at the top of the file.
 *
 * @param {string} content
 * @param {string} importedFile
 * @returns {string}
 */
function addImport(content, importedFile) {
    const imports = Array.from(content.matchAll(IMPORT_PATTERN));
    const line = `import "${importedFile}";`;

    if (imports.length === 0) {
        return `${line}\n\n${content}`;
    }

    const last = imports[imports.length - 1];
    const position = last.index + last[0].length;

    return `${content.slice(0, position)}\n${line}${content.slice(position)}`;
}

export default ProtoNormalizer;
