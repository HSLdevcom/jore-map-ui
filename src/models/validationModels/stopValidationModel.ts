const nameRule = 'required|min:1|max:20|string'; // TODO: These are just made up

const stopValidationModel = {
    nameFi: nameRule,
    nameSe: nameRule,
    radius: 'required|min:0|max:99999|numeric' // TODO: These are just made up
};

export default stopValidationModel;
