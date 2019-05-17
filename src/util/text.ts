import textCodeList from '~/codeLists/textCodeList';

/**
 * @param {keyValueMap} { key: value } - key is the same as ${key} in textCodeListKey, ${key} is replaced with value
 **/
const text = (textCodeListKey: string, keyValueMap?: Object) => {
    let s = textCodeList[textCodeListKey];
    const re = /\$\{(\w+)\}/g; // ${...}

    if (!keyValueMap) return s;

    const replacer = (match: any, name: string) => {
        return name in keyValueMap ? keyValueMap[name] : match;
    };
    s = s.replace(re, replacer);
    return s;
};

export default text;
