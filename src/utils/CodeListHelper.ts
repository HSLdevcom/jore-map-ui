import textCodeList from '~/codeLists/textCodeList';

class CodeListHelper {
    /**
     * @param {keyValueMap} { key: value } - key is the same as ${key} in textCodeListKey, ${key} is replaced with value
     **/
    public static getText = (textCodeListKey: string, keyValueMap?: Object) => {
        let lineString = textCodeList[textCodeListKey];
        const regexRule = /\$\{(\w+)\}/g; // ${...}

        if (!keyValueMap) return lineString;

        const replacer = (match: any, name: string) => {
            return name in keyValueMap ? keyValueMap[name] : match;
        };
        lineString = lineString.replace(regexRule, replacer);
        return lineString;
    };
}

export default CodeListHelper;
