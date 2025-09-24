import { isEmpty } from 'lodash'
import { observable } from 'mobx'
import FormValidator, { IValidationResult } from '~/validation/FormValidator'

interface ICustomValidatorObject {
  validators: Function[] // If left empty, dependentProperties will still be validated
  // TODO: use typings so that each element in dependentProperties should be key in ValidationModel
  dependentProperties?: string[] // List of properties that also need to be validated when the main property is validated
}

interface ICustomValidatorMap {
  [key: string]: ICustomValidatorObject
}

/**
 * Generic validation store to be used by other stores.
 * Call init() when validationObject changes
 * Call updateProperty() always when validationObject's value is changed
 * Call validateAllProperties() when isEditingDisabled of a View is changed
 * Call clear() to release memory when a store using validation store is cleared
 * @param {Object} ValidationObject - object to validate (e.g. ILink)
 * @param {Object} ValidationModel - { property: string}, where property = validation string (e.g. IValidationModel)
 */
class ValidationStore<ValidationObject, ValidationModel> {
  @observable private _invalidPropertiesMap: object
  private _validationObject: ValidationObject | null
  private _validationModel: ValidationModel | null
  private _customValidatorMap: ICustomValidatorMap | null
  private _hasValidatedAllProperties: boolean

  public init = (
    validationObject: ValidationObject,
    validationModel: ValidationModel,
    customValidatorsMap?: ICustomValidatorMap
  ) => {
    this.clear()
    this._validationObject = validationObject
    this._validationModel = validationModel
    this._customValidatorMap = customValidatorsMap ? customValidatorsMap : null

    this.validateAllProperties()
  }

  public updateProperty = (property: string, value: any) => {
    this._validationObject![property] = value
    this.validateProperty(property)
  }

  /**
   * @param {boolean} isDependentPropertiesValidationPrevented - if true, prevents validating dependent properties of a dependent property (to prevent infinite validation loop)
   */
  public validateProperty = (
    property: string,
    isDependentPropertiesValidationPrevented?: boolean
  ) => {
    const validatorRule = this._validationModel![property]
    const value = this._validationObject![property]
    let validatorResult: IValidationResult | undefined
    const customValidationResult:
      | IValidationResult
      | undefined = this.validateWithCustomValidator(property, value)
    const defaultValidationResult: IValidationResult | undefined = validatorRule
      ? FormValidator.validateProperty(validatorRule, value)
      : undefined

    if (customValidationResult && defaultValidationResult) {
      // There are 3 types of validationResults severities, rank them with scores of
      // 1 = "isValid, 2 = isWarning, 3 = isErrored"
      const getValidationResultSeverity = (validationResult: IValidationResult) => {
        return !validationResult.isValid
          ? 3
          : // ValidationResult is warning if it is valid and it has an error message
          !isEmpty(validationResult.errorMessage)
          ? 2
          : 1
      }
      const defaultValidationResultSeverity = getValidationResultSeverity(
        defaultValidationResult
      )
      const customValidationResultSeverity = getValidationResultSeverity(
        customValidationResult
      )

      // We always want to output the worst validationResult as the validationResult
      // If custom and default validation severities are equivalent, we want to use customValidationResult
      if (customValidationResultSeverity > defaultValidationResultSeverity) {
        validatorResult = customValidationResult
      } else if (customValidationResultSeverity === defaultValidationResultSeverity) {
        validatorResult = customValidationResult
      } else {
        validatorResult = defaultValidationResult
      }
    } else if (customValidationResult) {
      validatorResult = customValidationResult
    } else if (defaultValidationResult) {
      validatorResult = defaultValidationResult
    }

    if (validatorResult) {
      this._invalidPropertiesMap[property] = validatorResult
    }

    if (!isDependentPropertiesValidationPrevented) {
      this.validateDependentProperties(property)
    }
  }

  public validateAllProperties = () => {
    if (!this._validationModel) return
    if (this._hasValidatedAllProperties) return
    this._hasValidatedAllProperties = true

    Object.entries(this._validationModel).forEach(([property, validatorRule]) => {
      this.validateProperty(property)
    })
  }

  public isValid = () => {
    return !Object.values(this._invalidPropertiesMap).some(
      (validatorResult) => !validatorResult.isValid
    )
  }

  public getInvalidPropertiesMap = () => {
    return this._invalidPropertiesMap
  }

  public clear = () => {
    this._validationObject = null
    this._validationModel = null
    this._hasValidatedAllProperties = false
    this._invalidPropertiesMap = {}
  }

  private validateWithCustomValidator = (property: string, value: any) => {
    const customValidatorObject = this._customValidatorMap?.[property]
    let validatorResult: IValidationResult | undefined
    const validators = customValidatorObject?.validators

    if (this._customValidatorMap && validators && validators.length > 0) {
      validators.some((validator) => {
        const tempValidatiorResult = validator(this._validationObject!, property, value)
        if (tempValidatiorResult) {
          validatorResult = tempValidatiorResult
          return true
        }
        return false
      })
    }
    return validatorResult
  }

  private validateDependentProperties = (property: string) => {
    const customValidatorObject = this._customValidatorMap?.[property]
    if (customValidatorObject && customValidatorObject.dependentProperties) {
      customValidatorObject.dependentProperties.forEach((prop) =>
        this.validateProperty(prop, true)
      )
    }
  }
}

export default ValidationStore

export { ICustomValidatorMap }
