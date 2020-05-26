const promisify   = require('util').promisify
, jsYaml      = require('js-yaml')
, fs          = require('fs')
, getTypeRelativeFileName = require('../Panwriter/Settings').getTypeRelativeFileName;

// reads the right default yaml file
async function defaultMeta(currentFilePath, type) {
    try {
        const [str, fileName] = await readDocumentTypeFile(currentFilePath, type, '.yaml');
        return [ jsYaml.safeLoad(str) || {}, ['--metadata-file', fileName] ]
    } catch(e) {
        console.warn("Error loading or parsing YAML file." + e.message);
        return [ {}, [] ];
    }
}

// reads file from data directory, or relative to current file, throws exception when not found
async function readDocumentTypeFile(filename, type, suffix) {
    const fileName = getTypeRelativeFileName(filename, type, suffix);
    const str = await promisify(fs.readFile)(fileName, 'utf8');
    return [str, fileName];
}

async function getOutputFormats(filePath, docMeta) {
    const [extMeta, fileArg] = await defaultMeta(filePath, docMeta.type)
    const formats = []
    const meta = Object.assign( extMeta, docMeta );
    if(meta && meta.output && typeof meta.output === 'object') {
      Object.keys(meta.output).forEach(key => {
        let formatConf = meta.output[key];
        if(formatConf['output']) {
          let format = Object.assign( formatConf );
          let targetName = formatConf['output'];
          format.type = key;
          format.name = targetName;
          formats.push(format);
        }
      });
    }
    return formats
}

module.exports.defaultMeta = defaultMeta;
module.exports.getOutputFormats = getOutputFormats;