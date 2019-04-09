const linkValidationModel = {
    lintunnus: 'required|min:4|max:6|string',
    linperusreitti: 'required|min:4|max:6|string',
    linvoimast: 'required|min:1|max:99999|string', // TODO: timestamp max length?
    linvoimviimpvm: 'required|min:1|max:99999|string', // TODO: timestamp max length?
    linjoukkollaji: 'required|min:2|max:2|string',
    lintilorg: 'required|min:3|max:3|string',
    linverkko: 'required|min:1|max:1|string',
    linryhma: 'required|min:3|max:3|string',
    linjlkohde: 'required|min:1|max:6|string',
    vaihtoaika: 'required|min:0|max:99999|numeric', // TODO: integer max length?
    linkorvtyyppi: 'required|min:0|max:2|string',
};

export default linkValidationModel;
