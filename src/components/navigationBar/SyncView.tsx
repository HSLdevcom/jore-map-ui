import { inject, observer } from 'mobx-react'
import React, { useEffect, useRef, useState } from 'react'
import { IoIosArrowDown } from 'react-icons/io'
import EndpointPath from '~/enums/endpointPath'
import { AlertStore } from '~/stores/alertStore'
import HttpUtils from '~/utils/HttpUtils'
import { Button, Checkbox } from '../controls'
import ModalContainer from '../overlays/ModalContainer'
import Loader from '../shared/loader/Loader'
import * as s from './syncView.scss'

interface ISyncViewProps {
  alertStore?: AlertStore
}

enum SyncModels {
  LINE = 'line',
  LINE_HEADER = 'lineHeader',
  ROUTE = 'route',
  NODE_LINK_ROUTE_PATH = 'nodeLinkRoutePath',
  STOP_AREA_HASTUS = 'stopAreaHastus',
}

const SyncView = inject('alertStore')(
  observer((props: ISyncViewProps) => {
    const [isSyncViewVisible, setIsSyncViewVisible] = useState<boolean>(false)
    const [selectedModels, setSelectedModels] = useState<string[]>([])
    const [isSyncRunning, setIsSyncRunning] = useState<boolean>(false)
    const newIntervalIdRef: any = useRef()

    useEffect(() => {
      if (isSyncRunning) {
        newIntervalIdRef.current = setInterval(async () => {
          const response = await HttpUtils.getRequest(EndpointPath.SYNC_LOCAL_DB_STATUS)
          if (!response.isDbSyncing) {
            clearInterval(newIntervalIdRef.current)
            setIsSyncRunning(false)
            // Refresh the page once sync is complete
            location.reload()
          }
        }, 2000)
      }
    }, [isSyncRunning])

    const toggleSelectedModel = (modelName: string) => {
      const temp = [...selectedModels]
      if (selectedModels.includes(modelName)) {
        setSelectedModels(temp.filter((e) => e !== modelName))
      } else {
        setSelectedModels(temp.concat(modelName))
      }
    }

    const syncModels = async () => {
      setIsSyncRunning(true)
      const response = await HttpUtils.postRequest(EndpointPath.SYNC_LOCAL_DB_MODELS, {
        models: selectedModels,
      })

      if (response.isDbSyncing) {
        props.alertStore!.setFadeMessage({
          message: 'Tietojen haku Joresta on jo käynnissä. Yritä myöhemmin uudelleen.',
        })
      }
    }

    return (
      <>
        <div
          onClick={() => setIsSyncViewVisible(true)}
          className={s.openSyncViewButton}
          title={`Avaa uusi ikkuna uusimpien tietojen hakuun Joresta`}
        >
          Päivitä
          <IoIosArrowDown className={s.icon} />
        </div>
        <div>
          {isSyncViewVisible && (
            <ModalContainer>
              <div className={s.syncViewContainer}>
                <div>
                  Hae alle 24h sisään päivitetyt tiedot Joresta. Sivu ladataan automaattisesti
                  uudestaan haun jälkeen.
                </div>
                {isSyncRunning ? (
                  <>
                    <div className={s.loaderContainer}>
                      <div className={s.loadingText}>Tietoja päivitetään...</div>
                      <Loader hasNoMargin={true} />
                    </div>
                  </>
                ) : (
                  <div className={s.checkboxContainer}>
                    <Checkbox
                      className={s.checkbox}
                      content="Linjat"
                      checked={selectedModels.includes(SyncModels.LINE)}
                      onClick={() => toggleSelectedModel(SyncModels.LINE)}
                    />
                    <Checkbox
                      className={s.checkbox}
                      content="Linjan otsikot"
                      checked={selectedModels.includes(SyncModels.LINE_HEADER)}
                      onClick={() => toggleSelectedModel(SyncModels.LINE_HEADER)}
                    />
                    <Checkbox
                      className={s.checkbox}
                      content="Reitit"
                      checked={selectedModels.includes(SyncModels.ROUTE)}
                      onClick={() => toggleSelectedModel(SyncModels.ROUTE)}
                    />
                    <Checkbox
                      className={s.checkbox}
                      content="Pysäkit, risteykset, linkit, reitinsuunnat"
                      checked={selectedModels.includes(SyncModels.NODE_LINK_ROUTE_PATH)}
                      onClick={() => toggleSelectedModel(SyncModels.NODE_LINK_ROUTE_PATH)}
                    />
                    <Checkbox
                      className={s.checkbox}
                      content="Pysäkkialueet ja hastukset"
                      checked={selectedModels.includes(SyncModels.STOP_AREA_HASTUS)}
                      onClick={() => toggleSelectedModel(SyncModels.STOP_AREA_HASTUS)}
                    />
                  </div>
                )}
                <div className={s.syncButtonContainer}>
                  <Button
                    isWide={true}
                    disabled={isSyncRunning}
                    onClick={() => setIsSyncViewVisible(false)}
                  >
                    Sulje
                  </Button>
                  <Button
                    isWide={true}
                    disabled={selectedModels.length === 0 || isSyncRunning}
                    onClick={() => syncModels()}
                  >
                    Hae valitut tiedot
                  </Button>
                </div>
              </div>
            </ModalContainer>
          )}
        </div>
      </>
    )
  })
)

export default SyncView
