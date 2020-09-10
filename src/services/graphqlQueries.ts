import gql from 'graphql-tag';

const getLineQuery = () => {
    return gql`query getLineByLintunnus ($lineId: String!) {
            linjaByLintunnus(lintunnus:$lineId) {
                ${lineQueryFields}
            }
        }`;
};

const getLineAndRoutesQuery = () => {
    return gql`query getLineByLintunnus ($lineId: String!) {
            linjaByLintunnus(lintunnus:$lineId) {
                ${lineQueryFields}
                reittisByLintunnus(orderBy: REIVIIMPVM_DESC) {
                    nodes {
                        ${routeQueryFields}
                    }
                }
            }
        }`;
};

const getAllSearchLinesQuery = () => {
    return gql`{
            allLinjas {
                nodes {
                    ${searchLineQueryFields}
                    reittisByLintunnus(orderBy: REIVIIMPVM_DESC) {
                        nodes {
                            ${searchRouteQueryFields}
                        }
                    }
                }
            }
        }`;
};

const getRouteQuery = (areRoutePathLinksExcluded: boolean) => {
    return gql`query getLineDetails($routeId: String!) {
            route: reittiByReitunnus(reitunnus: $routeId) {
                ${routeQueryFields}
                reitinsuuntasByReitunnus{
                    nodes {
                        ${routePathQueryFields}
                        ${areRoutePathLinksExcluded ? '' : routePathLinksForRoutePathQuery}
                        ${routeForRoutePathQuery}
                    }
                }
            }
        }`;
};

const getAllRoutesQuery = () => {
    return gql`
        {
            allReittis {
                nodes {
                    reitunnus
                    lintunnus
                }
            }
        }
    `;
};

const getRoutePathQuery = () => {
    return gql`query getRoutePath($routeId: String!, $startDate: Datetime!, $direction: String!) {
            routePath: reitinsuuntaByReitunnusAndSuuvoimastAndSuusuunta(reitunnus: $routeId, suuvoimast: $startDate, suusuunta: $direction) {
                ${routePathQueryFields}
                ${routeForRoutePathQuery}
                ${routePathLinksForRoutePathQuery}
            }
        }`;
};

const getFirstStopNameOfRoutePath = () => {
    return gql`
        query getFirstStopNameOfRoutePath(
            $routeId: String!
            $startDate: Datetime!
            $direction: String!
        ) {
            get_first_stop_name_of_route_path: getFirstStopNameOfRoutePath(
                routeid: $routeId
                startdate: $startDate
                direction: $direction
            ) {
                nodes
            }
        }
    `;
};

const getLastStopNameOfRoutePath = () => {
    return gql`
        query getLastStopNameOfRoutePath(
            $routeId: String!
            $startDate: Datetime!
            $direction: String!
        ) {
            get_last_stop_name_of_route_path: getLastStopNameOfRoutePath(
                routeid: $routeId
                startdate: $startDate
                direction: $direction
            ) {
                nodes
            }
        }
    `;
};

const getRoutePathLinkQuery = () => {
    return gql`query getRoutePathLink($routeLinkId: Int!) {
            routePathLink: reitinlinkkiByRelid(relid: $routeLinkId) {
                ${routePathLinkQueryFields}
            }
        }`;
};

const getRoutePathSegmentQuery = () => {
    return gql`query getRoutePathLinksFromRoutePathSegment($startNodeId: String, $endNodeId: String, $transitType: String) {
            links_with_route_path_info: getRoutePathLinksFromRoutePathSegment(startnodeid: $startNodeId, endnodeid: $endNodeId, transittype: $transitType) {
                nodes {
                    ${routePathSegmentQueryFields}
                }
            }
        }`;
};

const getRoutePathsUsingLinkQuery = () => {
    return gql`query getRoutePathsUsingLink($startNodeId: String, $endNodeId: String, $transitType: String) {
        get_route_paths_using_link: getRoutePathsUsingLink(startnodeid: $startNodeId, endnodeid: $endNodeId, transittype: $transitType) {
            nodes {
                ${routePathQueryFields}
                ${routeForRoutePathQuery}
            }
        }
    }`;
};

const getRoutePathsUsingNodeQuery = () => {
    return gql`query getRoutePathsUsingNode($nodeId: String) {
        get_route_paths_using_node: getRoutePathsUsingNode(nodeid: $nodeId) {
            nodes {
                ${routePathQueryFields}
                ${routeForRoutePathQuery}
            }
        }
    }`;
};

const getLinksByStartNodeQuery = () => {
    return gql`query getNodesWithRoutePathLinkStartNodeId($nodeId: String!, $date: Datetime!) {
            solmuBySoltunnus(soltunnus: $nodeId) {
                ${linksWithNodeUsageByStartNodeQuery}
            }
        }`;
};

const getNetworkNodesFromPointQuery = () => {
    return gql`
        query getNetworkNodesFromPoint($lon: Float, $lat: Float, $bufferSize: Float) {
            get_network_nodes_from_point: getNetworkNodesFromPoint(
                lon: $lon
                lat: $lat
                buffersize: $bufferSize
            ) {
                nodes {
                    soltunnus
                    soltyyppi
                    geojson
                    geojsonManual
                    transitTypes
                    dateRanges
                }
            }
        }
    `;
};

const getNetworkLinksFromPointQuery = () => {
    return gql`
        query getNetworkLinksFromPoint($lat: Float, $lon: Float, $bufferSize: Float) {
            get_network_links_from_point: getNetworkLinksFromPoint(
                lat: $lat
                lon: $lon
                buffersize: $bufferSize
            ) {
                nodes {
                    lnkverkko
                    geojson
                    lnkalkusolmu
                    lnkloppusolmu
                    dateRanges
                    startNodeTransitTypes
                    startNodeType
                    endNodeTransitTypes
                    endNodeType
                }
            }
        }
    `;
};

const getLinkQuery = () => {
    return gql`query getLink($startNodeId: String!, $endNodeId: String!, $transitType:String!) {
            link: linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu(lnkverkko: $transitType, lnkalkusolmu: $startNodeId, lnkloppusolmu: $endNodeId) {
                ${linkQueryFields}
            }
        }`;
};

const getLinksQuery = () => {
    return gql`query getLinks($startNodeId: String!, $endNodeId: String!) {
            getLinks(startnodeid: $startNodeId, endnodeid: $endNodeId) {
                nodes {
                    ${linkQueryFields}
                }
            }
        }`;
};

const getLinksByEndNodeQuery = () => {
    return gql`query getNodesWithRoutePathLinkEndNodeId($nodeId: String!, $date: Datetime!) {
            solmuBySoltunnus(soltunnus: $nodeId) {
                ${linksWithNodeUsageByEndNodeQuery}
            }
        }`;
};

const getLinksByStartNodeAndEndNodeQuery = () => {
    return gql`query getNodesWithRoutePathLinkStartNodeAndEndNodeId($nodeId: String!) {
            solmuBySoltunnus(soltunnus: $nodeId) {
                ${linksByStartNodeQuery}
                ${linksByEndNodeQuery}
            }
        }`;
};

const getNodeQuery = () => {
    return gql`
        query getNodeDetails($nodeId: String!) {
            node: solmuBySoltunnus(soltunnus: $nodeId) {
                ${nodeQueryFields}
            }
        }`;
};

const getSearchNodeQuery = () => {
    return gql`
        query getNodeDetails($nodeId: String!) {
            node: solmuBySoltunnus(soltunnus: $nodeId) {
                ${nodeSearchQueryFields}
            }
        }
    `;
};

const getAllSearchNodesQuery = () => {
    return gql`
        query getAllNodes {
            allNodes: allSolmus {
                nodes {
                    ${nodeSearchQueryFields}
                }
            }
        }
    `;
};

const getAllStopsQuery = () => {
    return gql`
        query getAllStopItems {
            node: allPysakkis {
                nodes {
                    ${stopQueryFields}
                }
            }
        }
    `;
};

const getArmamentInfoQuery = () => {
    return gql`
        query getArmamentInfoQuery($nodeId: String!) {
            node: varustelutiedotUusiByTunnus(tunnus: $nodeId) {
                nousijat
            }
        }
    `;
};

const getAllCodeLists = () => {
    return gql`
        query getAllCodeLists {
            node: allKoodistos {
                nodes {
                    koolista
                    koojarjestys
                    kookoodi
                    kooselite
                }
            }
        }
    `;
};

const getRoutePathsUsingLinkFromDate = () => {
    return gql`
        query routepathsUsingLinkFromDate($startNodeId:String!, $endNodeId:String!, $date: Datetime!, $transitType: String!) {
            routePaths: routepathsUsingLinkFromDate(startnodeid: $startNodeId, endnodeid: $endNodeId, date: $date, transittype: $transitType) {
                nodes {
                    ${routePathQueryFields}
                    ${routeForRoutePathQuery}
                }
            }
        }`;
};

const getStopAreaQuery = () => {
    return gql`
        query getStopArea($stopAreaId: String!) {
            stopArea: pysakkialueByPysalueid(pysalueid: $stopAreaId) {
                ${stopAreaQueryFields}
            }
        }
    `;
};

const getAllStopAreas = () => {
    return gql`
        query getAllStopAreas {
            node: allPysakkialues {
                nodes {
                    ${stopAreaQueryFields}
                }
            }
        }
    `;
};

const getAllStopItems = () => {
    return gql`
        query getAllStopItems {
            node: allPysakkis {
                nodes {
                    soltunnus
                    pysalueid
                    pysnimi
                    pysnimir
                }
            }
        }
    `;
};

const getAllTerminalAreas = () => {
    return gql`
        query getAllTerminalAreas {
            node: allTerminaalialues {
                nodes {
                    termid
                    nimi
                }
            }
        }
    `;
};

const getAllStopSections = () => {
    return gql`
        query getAllStopSections {
            node: allVyohykes {
                nodes {
                    selite
                }
            }
        }
    `;
};

const getAllHastusAreas = () => {
    return gql`
        query getAllHastusAreas {
            node: allPaikkas {
                nodes {
                    paitunnus
                    nimi
                }
            }
        }
    `;
};

const getReservedShortIds = () => {
    return gql`
        query getReservedShortIds($shortIdLetter: String) {
            getReservedShortIds: allSolmus(condition: { solkirjain: $shortIdLetter }) {
                nodes {
                    soltunnus
                    sollistunnus
                }
            }
        }
    `;
};

const getLineHeaderQuery = () => {
    return gql`query getLineHeader($lineId: String!, $startDate: Datetime!) {
            lineHeader: linjannimetByLintunnusAndLinalkupvm(lintunnus: $lineId, linalkupvm: $startDate) {
                ${lineHeaderQueryFields}
            }
        }`;
};

const getAllLineHeadersQuery = () => {
    return gql`
        query getAllLineHeaders {
            node: allLinjannimets {
                nodes {
                    ${lineHeaderQueryFields}
                }
            }
        }
    `;
};

const getViaNameQuery = () => {
    return gql`
        query getViaNames($routeId: String, $startDate: Datetime, $direction: String) {
            get_via_names: getViaNames(
                routeid: $routeId
                startdate: $startDate
                direction: $direction
            ) {
                nodes {
                    relid
                    maaranpaa1
                    maaranpaa2
                    maaranpaa1R
                    maaranpaa2R
                }
            }
        }
    `;
};

const getViaShieldNameQuery = () => {
    return gql`
        query getViaShieldNames($routeId: String, $startDate: Datetime, $direction: String) {
            get_via_shield_names: getViaShieldNames(
                routeid: $routeId
                startdate: $startDate
                direction: $direction
            ) {
                nodes {
                    relid
                    viasuomi
                    viaruotsi
                }
            }
        }
    `;
};

const getAllSchedulesQuery = () => {
    return gql`
        {
            allAikataulus {
                nodes {
                    reitunnus
                    lavoimast
                    laviimvoi
                    lakuka
                    laviimpvm
                }
            }
        }
    `;
};

const lineQueryFields = `
    lintunnus
    linperusreitti
    linvoimast
    linvoimviimpvm
    linjoukkollaji
    lintilorg
    linverkko
    linkuka
    linviimpvm
    linjlkohde
    vaihtoaika
    linkorvtyyppi
`;

const searchLineQueryFields = `
    lintunnus
    linjoukkollaji
    linverkko
`;

const searchRouteQueryFields = `
    reinimi
    isUsedByRoutePath
    reitunnus
    reiviimpvm
`;

const routeQueryFields = `
    reitunnus
    reinimi
    reinimilyh
    reinimir
    reinimilyhr
    lintunnus
    reikuka
    reiviimpvm
`;

const routePathQueryFields = `
    reitunnus
    suusuunta
    suunimi
    suunimir
    suunimilyh
    suunimilyhr
    suuvoimast
    suuviimpvm
    suuvoimviimpvm
    suulahpaik
    suulahpaikr
    suupaapaik
    suukuka
    suupaapaikr
    suupituus
    poikkeusreitti
    kirjaan
    kirjasarake
`;

const routePathSegmentQueryFields = `
    reitunnus
    suusuunta
    suuvoimast
    relid
    reljarjnro
    lnkalkusolmu
    lnkloppusolmu
    suuvoimviimpvm
    suulahpaik
    suupaapaik
    geom
`;

const stopQueryFields = `
    soltunnus
    pyskunta
    pysnimi
    pysnimir
    pyspaikannimi
    pyspaikannimir
    pysosoite
    pysosoiter
    pysvaihtopys
    pyskuka
    pysviimpvm
    pyslaituri
    pyskatos
    pystyyppi
    pyssade
    pyssuunta
    paitunnus
    terminaali
    kutsuplus
    kutsuplusvyo
    kulkusuunta
    kutsuplusprior
    id
    pysalueid
    tariffi
    elynumero
    pysnimipitka
    pysnimipitkar
    vyohyke
    postinro
`;

const stopAreaQueryFields = `
    pysalueid
    verkko
    nimi
    nimir
    termid
    tallpvm
    tallentaja
    pysakkialueryhma
`;

const nodeQueryFields = `
    soltunnus
    sollistunnus
    solkirjain
    soltyyppi
    solkirjain
    mittpvm
    geojson
    geojsonManual
    geojsonProjection
    transitTypes
    solotapa
    solkuka
    solviimpvm
    pysakkiBySoltunnus {
        ${stopQueryFields}
    }
`;

const nodeSearchQueryFields = `
    soltunnus
    soltyyppi
    sollistunnus
    solkirjain
    geojson
    geojsonManual
    transitTypes
    dateRanges
    pysakkiBySoltunnus {
        soltunnus
        pysnimi
    }
`;

const startNodeQueryFields = `
    ${nodeQueryFields}
`;

const endNodeQueryFields = `
    ${nodeQueryFields}
`;

const routePathLinkQueryFields = `
    relid
    lnkalkusolmu
    lnkloppusolmu
    relpysakki
    reljarjnro
    relohaikpys
    lnkverkko
    ajantaspys
    paikka
    kirjaan
    kirjasarake
    suusuunta
    suuvoimast
    reitunnus
    relkuka
    relviimpvm
    linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu {
        geojson
    }
    solmuByLnkalkusolmu {
        ${startNodeQueryFields}
    }
    solmuByLnkloppusolmu {
        ${endNodeQueryFields}
    }
`;

const lineHeaderQueryFields = `
    lintunnus
    linalkupvm
    linloppupvm
    linnimi
    linnimilyh
    linnimir
    linnimilyhr
    linlahtop1
    linlahtop1R
    linlahtop2
    linlahtop2R
    linkuka
    linviimpvm
`;

const routePathLinksForRoutePathQuery = `
reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta {
    nodes {
        ${routePathLinkQueryFields}
    }
}`;

const lineForRoutePathQuery = `
linjaByLintunnus {
    lintunnus
    linverkko
}
`;

const routeForRoutePathQuery = `
reittiByReitunnus {
    ${lineForRoutePathQuery}
}
`;

const linkQueryFields = `
    geojson
    lnkverkko
    lnkalkusolmu
    lnkloppusolmu
    lnkmitpituus
    lnkpituus
    katnimi
    katkunta
    speed
    lnkkuka
    lnkviimpvm
    solmuByLnkalkusolmu {
        ${startNodeQueryFields}
    }
    solmuByLnkloppusolmu {
        ${endNodeQueryFields}
    }
`;

const linksWithNodeUsageByStartNodeQuery = `
linkkisByLnkalkusolmu {
    nodes {
        ${linkQueryFields}
        solmuByLnkalkusolmu {
            ${startNodeQueryFields}
        }
        solmuByLnkloppusolmu {
            ${endNodeQueryFields}
            usageDuringDate(date: $date, isstartnode: false) {
                nodes {
                    ${routeForRoutePathQuery}
                    ${routePathQueryFields}
                }
            }
        }
    }
}`;

const linksWithNodeUsageByEndNodeQuery = `
linkkisByLnkloppusolmu {
    nodes {
        ${linkQueryFields}
        solmuByLnkalkusolmu {
            ${startNodeQueryFields}
            usageDuringDate(date: $date, isstartnode: false) {
                nodes {
                    ${routeForRoutePathQuery}
                    ${routePathQueryFields}
                }
            }
        }
        solmuByLnkloppusolmu {
            ${endNodeQueryFields}
        }
    }
}`;

const linksByStartNodeQuery = `
linkkisByLnkalkusolmu {
    nodes {
        ${linkQueryFields}
        solmuByLnkalkusolmu {
            ${startNodeQueryFields}
        }
        solmuByLnkloppusolmu {
            ${endNodeQueryFields}
        }
    }
}`;

const linksByEndNodeQuery = `
linkkisByLnkloppusolmu {
    nodes {
        ${linkQueryFields}
        solmuByLnkalkusolmu {
            ${startNodeQueryFields}
        }
        solmuByLnkloppusolmu {
            ${endNodeQueryFields}
        }
    }
}`;

export default {
    getLineQuery,
    getLineAndRoutesQuery,
    getAllSearchLinesQuery,
    getLinkQuery,
    getLinksQuery,
    getRouteQuery,
    getAllRoutesQuery,
    getRoutePathQuery,
    getFirstStopNameOfRoutePath,
    getLastStopNameOfRoutePath,
    getRoutePathLinkQuery,
    getRoutePathSegmentQuery,
    getRoutePathsUsingLinkQuery,
    getRoutePathsUsingNodeQuery,
    getLinksByStartNodeQuery,
    getNetworkNodesFromPointQuery,
    getNetworkLinksFromPointQuery,
    getLinksByStartNodeAndEndNodeQuery,
    getNodeQuery,
    getSearchNodeQuery,
    getAllSearchNodesQuery,
    getAllStopsQuery,
    getArmamentInfoQuery,
    getLinksByEndNodeQuery,
    getAllCodeLists,
    getRoutePathsUsingLinkFromDate,
    getStopAreaQuery,
    getAllStopAreas,
    getAllStopItems,
    getAllTerminalAreas,
    getLineHeaderQuery,
    getAllLineHeadersQuery,
    getAllStopSections,
    getAllHastusAreas,
    getReservedShortIds,
    getViaNameQuery,
    getViaShieldNameQuery,
    getAllSchedulesQuery,
};
