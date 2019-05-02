import gql from 'graphql-tag';

// tslint:disable:max-line-length

const getLineQuery = () => {
    return (
        gql`query getLineByLintunnus ($lineId: String!) {
            linjaByLintunnus(lintunnus:$lineId) {
                ${lineQueryFields}
                reittisByLintunnus(orderBy: REIVIIMPVM_DESC) {
                    nodes {
                        reinimi
                        reiviimpvm
                    }
                }
            }
        }`
    );
};

const getSearchLineQuery = () => {
    return (
        gql`query getLineByLintunnus ($lineId: String!) {
            linjaByLintunnus(lintunnus:$lineId) {
                ${searchLineQueryFields}
                reittisByLintunnus(orderBy: REIVIIMPVM_DESC) {
                    nodes {
                        reinimi
                        reiviimpvm
                    }
                }
            }
        }`
    );
};

const getAllSearchLinesQuery = () => {
    return (
        gql`{
            allLinjas {
                nodes {
                    ${searchLineQueryFields}
                    reittisByLintunnus(orderBy: REIVIIMPVM_DESC) {
                        nodes {
                            reinimi
                            reitunnus
                            reiviimpvm
                        }
                    }
                }
            }
        }`
    );
};

const getRouteQuery = () => {
    return (
        gql`query getLineDetails($routeId: String!) {
            route: reittiByReitunnus(reitunnus: $routeId) {
                ${routeQueryFields}
                reitinsuuntasByReitunnus{
                    nodes {
                        ${routePathQueryFields}
                        ${routePathLinksForRoutePathQuery}
                        ${routeForRoutePathQuery}
                    }
                }
            }
        }`
    );
};

const getRoutePathQuery = () => {
    return (
        gql`query getRoutePath($routeId: String!, $startDate: Datetime!, $direction: String!) {
            routePath: reitinsuuntaByReitunnusAndSuuvoimastAndSuusuunta(reitunnus: $routeId, suuvoimast: $startDate, suusuunta: $direction) {
                ${routePathQueryFields}
                ${routeForRoutePathQuery}
                ${routePathLinksForRoutePathQuery}
            }
        }`
    );
};

const getRoutePathLinkQuery = () => {
    return (
        gql`query getRoutePathLink($routeLinkId: Int!) {
            routePathLink: reitinlinkkiByRelid(relid: $routeLinkId) {
                ${routePathLinkQueryFields}
            }
        }`
    );
};

const getLinksByStartNodeQuery = () => {
    return (
        gql`query getNodesWithRoutePathLinkStartNodeId($nodeId: String!, $date: Datetime!) {
            solmuBySoltunnus(soltunnus: $nodeId) {
                ${linksWithNodeUsageByStartNodeQuery}
            }
        }`
    );
};

const getLinkQuery = () => {
    return (
        gql`query getLink($startNodeId: String!, $endNodeId: String!, $transitType:String!) {
            link: linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu(lnkverkko: $transitType, lnkalkusolmu: $startNodeId, lnkloppusolmu: $endNodeId) {
                ${linkQueryFields}
            }
        }`
    );
};

const getLinksQuery = () => {
    return (
        gql`query getLinks($startNodeId: String!, $endNodeId: String!) {
            getLinks(startnodeid: $startNodeId, endnodeid: $endNodeId) {
                nodes {
                    ${linkQueryFields}
                }
            }
        }`
    );
};

const getLinksByEndNodeQuery = () => {
    return (
        gql`query getNodesWithRoutePathLinkEndNodeId($nodeId: String!, $date: Datetime!) {
            solmuBySoltunnus(soltunnus: $nodeId) {
                ${linksWithNodeUsageByEndNodeQuery}
            }
        }`
    );
};

const getLinksByStartNodeAndEndNodeQuery = () => {
    return (
        gql`query getNodesWithRoutePathLinkStartNodeAndEndNodeId($nodeId: String!) {
            solmuBySoltunnus(soltunnus: $nodeId) {
                ${linksByStartNodeQuery}
                ${linksByEndNodeQuery}
            }
        }`
    );
};

const getAllNodesQuery = () => {
    return (
        gql`
            query getAllNodes {
                allNodes: allSolmus{
                    nodes {
                        soltunnus
                        soltyyppi
                        sollistunnus
                        solkirjain
                    }
                }
            }
        `
    );
};

const getNodeQuery = () => {
    return (
        gql`
        query getNodeDetails($nodeId: String!) {
            node: solmuBySoltunnus(soltunnus: $nodeId) {
                ${nodeQueryFields}
            }
        }`
    );
};

const getAllCodeLists = () => {
    return (
        gql`
        query getAllCodeLists {
            node: allKoodistos{
                nodes {
                    koolista
                    koojarjestys
                    kookoodi
                    kooselite
                }
            }
        }`
    );
};

const getRoutePathsUsingLinkFromDate = () => {
    return (
        gql`
        query routepathsUsingLinkFromDate($startNodeId:String!, $endNodeId:String!, $date: Datetime!, $transitType: String!) {
            routePaths: routepathsUsingLinkFromDate(startnodeid: $startNodeId, endnodeid: $endNodeId, date: $date, transittype: $transitType) {
                nodes {
                    ${routePathQueryFields}
                    ${routeForRoutePathQuery}
                }
            }
        }`
    );
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
    nimiviimpvm
    vyohyke
    postinro
`;

const nodeQueryFields = `
    solx
    soly
    soltunnus
    sollistunnus
    solkirjain
    soltyyppi
    solkirjain
    mittpvm
    geojson
    geojsonManual
    geojsonProjection
    transittypes
    pysakkiBySoltunnus {
        ${stopQueryFields}
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
    lnkverkko
    ajantaspys
    suusuunta
    suuvoimast
    reitunnus
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
    lnksuunta
    lnkosnro
    katkunta
    kaoosnro
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

// tslint:enable:max-line-length

export default {
    getLineQuery,
    getSearchLineQuery,
    getAllSearchLinesQuery,
    getLinkQuery,
    getLinksQuery,
    getRouteQuery,
    getRoutePathQuery,
    getLinksByStartNodeQuery,
    getLinksByStartNodeAndEndNodeQuery,
    getNodeQuery,
    getAllNodesQuery,
    getRoutePathLinkQuery,
    getLinksByEndNodeQuery,
    getAllCodeLists,
    getRoutePathsUsingLinkFromDate,
};
