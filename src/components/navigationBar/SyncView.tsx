import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import EndpointPath from '~/enums/endpointPath';
import { AlertStore } from '~/stores/alertStore';
import HttpUtils from '~/utils/HttpUtils';
import { Button, Checkbox } from '../controls';
import ModalContainer from '../overlays/ModalContainer';
import Loader from '../shared/loader/Loader';
import * as s from './syncView.scss';

interface ISyncViewProps {
    alertStore?: AlertStore;
}

enum SyncModels {
    LINE = 'line',
    LINE_HEADER = 'lineHeader',
    ROUTE = 'route',
    NODE_AND_LINK = 'nodeAndLink',
    STOP_AREA = 'stopArea',
}

const SyncView = inject('alertStore')(
    observer((props: ISyncViewProps) => {
        const [isSyncViewVisible, setIsSyncViewVisible] = useState<boolean>(false);
        const [selectedModels, setSelectedModels] = useState<string[]>([]);
        const [isSyncRunning, setIsSyncRunning] = useState<boolean>(false);
        const newIntervalIdRef: any = useRef();

        useEffect(() => {
            if (isSyncRunning) {
                newIntervalIdRef.current = setInterval(async () => {
                    const response = await HttpUtils.getRequest(EndpointPath.SYNC_LOCAL_DB_STATUS);
                    if (!response.isDbSyncing) {
                        clearInterval(newIntervalIdRef.current);
                        setIsSyncRunning(false);
                    }
                }, 2000);
            }
        }, [isSyncRunning]);

        const toggleSelectedModel = (modelName: string) => {
            const temp = [...selectedModels];
            if (selectedModels.includes(modelName)) {
                setSelectedModels(temp.filter((e) => e !== modelName));
            } else {
                setSelectedModels(temp.concat(modelName));
            }
        };

        const syncModels = async () => {
            setIsSyncRunning(true);
            const response = await HttpUtils.postRequest(EndpointPath.SYNC_LOCAL_DB_MODELS, {
                models: selectedModels,
            });

            if (response.isDbSyncing) {
                props.alertStore!.setFadeMessage({
                    message: 'Tietojen haku Joresta on jo käynnissä. Yritä myöhemmin uudelleen.',
                });
            }
        };

        return (
            <>
                <div
                    className={s.openSyncViewButton}
                    title={`Avaa uusi ikkuna uusimpien tietojen hakuun Joresta`}
                >
                    <IoIosArrowDown className={s.icon} onClick={() => setIsSyncViewVisible(true)} />
                </div>
                <div>
                    {isSyncViewVisible && (
                        <ModalContainer>
                            <div className={s.syncViewContainer}>
                                <div>Hae uusimmat (alle 24h sisään päivitetyt) tiedot Joresta</div>
                                {isSyncRunning ? (
                                    <>
                                        <div className={s.loaderContainer}>
                                            <div className={s.loadingText}>
                                                Tietoja päivitetään, voit sulkea tämän ikkunan, jos
                                                haluat.
                                            </div>
                                            <Loader hasNoMargin={true} />
                                        </div>
                                    </>
                                ) : (
                                    <div className={s.checkboxContainer}>
                                        <Checkbox
                                            className={s.checkbox}
                                            content='Linjat'
                                            checked={selectedModels.includes(SyncModels.LINE)}
                                            onClick={() => toggleSelectedModel(SyncModels.LINE)}
                                        />
                                        <Checkbox
                                            className={s.checkbox}
                                            content='Linjan otsikot'
                                            checked={selectedModels.includes(
                                                SyncModels.LINE_HEADER
                                            )}
                                            onClick={() =>
                                                toggleSelectedModel(SyncModels.LINE_HEADER)
                                            }
                                        />
                                        <Checkbox
                                            className={s.checkbox}
                                            content='Reitit'
                                            checked={selectedModels.includes(SyncModels.ROUTE)}
                                            onClick={() => toggleSelectedModel(SyncModels.ROUTE)}
                                        />
                                        <Checkbox
                                            className={s.checkbox}
                                            content='Pysäkit, risteykset, linkit'
                                            checked={selectedModels.includes(
                                                SyncModels.NODE_AND_LINK
                                            )}
                                            onClick={() =>
                                                toggleSelectedModel(SyncModels.NODE_AND_LINK)
                                            }
                                        />
                                        <Checkbox
                                            className={s.checkbox}
                                            content='Pysäkkialueet'
                                            checked={selectedModels.includes(SyncModels.STOP_AREA)}
                                            onClick={() =>
                                                toggleSelectedModel(SyncModels.STOP_AREA)
                                            }
                                        />
                                    </div>
                                )}
                                <div className={s.syncButtonContainer}>
                                    <Button
                                        isWide={true}
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
        );
    })
);

export default SyncView;
