import { IViaName } from '~/models'
import IViaShieldName from '~/models/IViaShieldName'
import IExternalViaName from '~/models/externals/IExternalViaName'
import IExternalViaShieldName from '~/models/externals/IExternalViaShieldName'

class ViaNameFactory {
  public static parseExternalViaName = ({
    viaNameId,
    externalViaName,
  }: {
    viaNameId: number
    externalViaName: IExternalViaName | null
  }): IViaName => {
    return {
      viaNameId: `${viaNameId}`,
      destinationFi1: _parseViaNameValue(externalViaName, 'maaranpaa1'),
      destinationFi2: _parseViaNameValue(externalViaName, 'maaranpaa2'),
      destinationSw1: _parseViaNameValue(externalViaName, 'maaranpaa1R'),
      destinationSw2: _parseViaNameValue(externalViaName, 'maaranpaa2R'),
    }
  }

  public static parseExternalViaShieldName = ({
    viaShieldNameId,
    externalViaShieldName,
  }: {
    viaShieldNameId: number
    externalViaShieldName: IExternalViaShieldName | null
  }): IViaShieldName => {
    return {
      viaShieldNameId: `${viaShieldNameId}`,
      destinationShieldFi: _parseViaNameValue(externalViaShieldName, 'viasuomi'),
      destinationShieldSw: _parseViaNameValue(externalViaShieldName, 'viaruotsi'),
    }
  }
}

const _parseViaNameValue = (targetObject: object | null, propertyName: string) => {
  return targetObject && targetObject[propertyName] ? targetObject[propertyName] : ''
}

export default ViaNameFactory
