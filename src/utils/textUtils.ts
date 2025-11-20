import textCodeList from '~/codeLists/textCodeList';

/**
 * @param {keyValueMap} { key: value } - key is the same as ${key} in textCodeList, ${key} is replaced with value
 **/
const getText = (key: string, keyValueMap?: Object) => {
    let lineString = textCodeList[key];
    const regexRule = /\$\{(\w+)\}/g; // ${...}

    if (!keyValueMap) return lineString;

    const replacer = (match: any, name: string) => {
        return name in keyValueMap ? keyValueMap[name] : match;
    };
    lineString = lineString.replace(regexRule, replacer);
    return lineString;
};

export { getText };
