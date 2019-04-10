import React from 'react';
import { observer, inject } from 'mobx-react';
import { FiChevronRight } from 'react-icons/fi';
import classnames from 'classnames';
import { IRoutePathLink } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import { CodeListStore } from '~/stores/codeListStore';
import { Button, Checkbox, Dropdown } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import RoutePathListItem from './RoutePathListItem';
import MultiTabTextarea from '../../linkView/MultiTabTextarea';
import TextContainer from '../../TextContainer';
import * as s from './routePathListItem.scss';

interface IRoutePathListLinkProps {
    routePathStore?: RoutePathStore;
    codeListStore?: CodeListStore;
    routePathLink: IRoutePathLink;
    reference: React.RefObject<HTMLDivElement>;
}

@inject('routePathStore', 'codeListStore')
@observer
class RoutePathListLink extends React.Component<IRoutePathListLinkProps> {
    private renderHeader = () => {
        const id = this.props.routePathLink.id;
        const isExtended = this.props.routePathStore!.isListItemExtended(
            id,
        );
        return (
            <div
                className={
                    classnames(
                        s.itemHeader,
                        isExtended ? s.itemExtended : null,
                    )
                }
            >
                <div className={s.headerContent}>
                    <div className={s.headerNodeTypeContainer}>
                        Reitinlinkki
                    </div>
                    <div className={s.label} />
                    </div>
                    <div className={s.itemToggle}>
                        {isExtended && <FaAngleDown />}
                        {!isExtended && <FaAngleRight />}
                </div>
            </div>
        );
    }

    private renderBody = () => {
        return (
            <div className={s.extendedContent}>
                {
                    this.renderRoutePathLinkView(this.props.routePathLink)
                }
                <div className={s.footer}>
                    <Button
                        onClick={this.openInNetworkView}
                        type={ButtonType.SQUARE}
                    >
                        Avaa linkki verkkonäkymässä
                        <FiChevronRight />
                    </Button>
                </div>
            </div>
        );
    }

    private renderRoutePathLinkView = (rpLink: IRoutePathLink) => {
        return (
            <div className={s.nodeContent}>
                Reitinlinkin tiedot
                <div className={s.flexRow}>
                    <TextContainer
                        label='ALKUSOLMU'
                        value={rpLink.startNode.id}
                    />
                    <TextContainer
                        label='LOPPUSOLMU'
                        value={rpLink.endNode.id}
                    />
                </div>
                <div className={s.flexRow}>
                    <TextContainer
                        label='JÄRJESTYSNUMERO'
                        value={rpLink.orderNumber.toString()}
                    />
                    <TextContainer
                        label='AJANTASAUSPYSÄKKI'
                        value={rpLink.isStartNodeTimeAlignmentStop ? 'Kyllä' : 'ei'}
                    />
                </div>
                <div className={s.flexRow}>
                    <div className={s.inputLabel}>
                        ALKUSOLMUN SARAKE NRO
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRow}>
                        <input
                            placeholder='1'
                            type='text'
                            className={s.smallInput}
                        />
                        <Checkbox
                            checked={false}
                            text='Ohitusaika kirja-aikat.'
                            onClick={this.onChange}
                        />
                    </div>
                    <div className={s.flexInnerRow}>
                        <input
                            placeholder='1'
                            type='text'
                            className={s.smallInput}
                        />
                        <Checkbox
                            checked={false}
                            text='Ohitusaika nettiaikat.'
                            onClick={this.onChange}
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.inputLabel}>
                        VIIM. LINKIN LOPPUSOLMU SARAKE NRO
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRow}>
                        <input
                            placeholder='1'
                            type='text'
                            className={s.smallInput}
                        />
                        <Checkbox
                            checked={false}
                            text='Ohitusaika nettiaikat.'
                            onClick={this.onChange}
                        />
                    </div>
                    <div className={s.flexInnerRow}>
                        <input
                            placeholder='1'
                            type='text'
                            className={s.smallInput}
                        />
                        <Checkbox
                            checked={false}
                            text='Ohitusaika kirja-aikat.'
                            onClick={this.onChange}
                        />
                    </div>

                </div>
                <div className={s.flexRow}>
                    <Dropdown
                        label='SOLMU HASTUS-PAIKKANA'
                        items={this.props.codeListStore!.getCodeList('Kyllä/Ei')}
                        selected='Kyllä'
                        onChange={this.onChange}
                    />
                </div>
                <MultiTabTextarea
                    tabs={['Tariffialueet', 'Määränpäät']}
                />
            </div>
        );
    }

    // TODO:
    private onChange = () => {};

    private openInNetworkView = () => {
        const routeLink = this.props.routePathLink;
        const routeLinkViewLink = routeBuilder
            .to(SubSites.link)
            .toTarget([
                routeLink.startNode.id,
                routeLink.endNode.id,
                routeLink.transitType,
            ].join(','))
            .toLink();
        navigator.goTo(routeLinkViewLink);
    }

    private renderListIcon = () => <div className={s.linkIcon} />;

    render() {
        const geometry = this.props.routePathStore!.getLinkGeom(this.props.routePathLink.id);
        return (
            <RoutePathListItem
                reference={this.props.reference}
                id={this.props.routePathLink.id}
                geometry={geometry}
                header={this.renderHeader()}
                body={this.renderBody()}
                listIcon={this.renderListIcon()}
            />
        );
    }
}

export default RoutePathListLink;
