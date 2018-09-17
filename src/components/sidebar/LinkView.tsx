import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { SidebarStore } from '../../stores/sidebarStore';
import SidebarViewHeader from './SidebarViewHeader';
import * as s from './linkView.scss';

interface ILinkViewState {
}

interface ILinkViewProps {
    sidebarStore?: SidebarStore;
}

@inject('sidebarStore')
@observer
class LinkView extends React.Component
<ILinkViewProps, ILinkViewState> {
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    public componentDidMount() {
        if (this.props.sidebarStore) {
            // TODO: fetch GraphSQL with linkId
            // const linkId = this.props.sidebarStore!.openLinkId;
        }
    }

    private closeLinkView = () => {
        this.props.sidebarStore!.setOpenLinkId(null);
    }

    public render(): any {
        return (
        <div className={s.linkView}>
            <SidebarViewHeader
                header='Reitin 1016 linkki'
                closeSidebarView={this.closeLinkView}
            />
            <div className={classnames(s.flexInnerColumn, s.subTopic)}>
                REITIN SUUNNAN TIEDOT
            </div>
            <div className={s.flexInnerColumn}>
                <div className={s.flexInnerRow}>
                    <div>
                        <div className={classnames(s.subTopic)}>
                            REITTITUNNUS
                        </div>
                        <input
                            placeholder='1016'
                            type='text'
                            className={s.inputField}
                        />
                    </div>
                    <div>
                        <div className={classnames(s.subTopic)}>
                            SUUNTA
                        </div>
                        <input
                            placeholder='Suunta 1'
                            type='text'
                            className={s.inputField}
                        />
                    </div>
                </div>
                <div className={s.flexInnerRow}>
                    <div>
                        <div className={classnames(s.subTopic)}>
                            VOIM. AST
                        </div>
                        <input
                            placeholder='01.09.2017'
                            type='text'
                            className={s.inputField}
                        />
                    </div>
                    <div>
                        <div className={classnames(s.subTopic)}>
                            VIIM. VOIM
                        </div>
                        <input
                            placeholder='31.12.2050'
                            type='text'
                            className={s.inputField}
                        />
                    </div>
                </div>
                <div className={s.flexInnerColumn}>
                    <div className={classnames(s.subTopic)}>
                        NIMI
                    </div>
                    <input
                        placeholder='Rautatientori - Korkeasaari'
                        type='text'
                        className={s.inputField}
                    />
                </div>
            </div>
        </div>
        );
    }
}
export default LinkView;
