import FormValidator from '../FormValidator'
import regexRules from '../regexRules'

// Very simple testing that regex rules work, main testing is done in backend.
describe('Validator.validate - regexRules', () => {
  it('works with valid input using rule: upperCaseOrNumbersOrSpace', () => {
    const validationResult = FormValidator.validate(
      'A123',
      regexRules.upperCaseOrNumbersOrSpace
    )
    expect(validationResult.isValid).toEqual(true)
  })

  it('throws on invalid input using rule: upperCaseOrNumbersOrSpace', () => {
    const validationResult = FormValidator.validate(
      'a123',
      regexRules.upperCaseOrNumbersOrSpace
    )
    expect(validationResult.isValid).toEqual(false)
  })
})
