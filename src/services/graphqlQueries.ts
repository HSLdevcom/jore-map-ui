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

const getAllLinesQuery = () => {
    return (
        gql`{
            allLinjas {
                nodes {
                    ${lineQueryFields}
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
                        ${lineForRoutePathQuery}
                        ${routePathLinksForRoutePathQuery}
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
                ${lineForRoutePathQuery}
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
        gql`query getNodesWithRoutePathLinkStartNodeId($nodeId: String!) {
            solmuBySoltunnus(soltunnus: $nodeId) {
                ${linksByStartNodeQuery}
            }
        }`
    );
};

const getLinksByEndNodeQuery = () => {
    return (
        gql`query getNodesWithRoutePathLinkEndNodeId($nodeId: String!) {
            solmuBySoltunnus(soltunnus: $nodeId) {
                ${linksByEndNodeQuery}
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

const lineQueryFields = `
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
    transittypes
    pysakkiBySoltunnus {
        pyssade
        pysnimi
        pysnimir
        paitunnus
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
reittiByReitunnus {
    lintunnus
}
`;

const linkQueryFields = `
    geojson
    lnkverkko
`;

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
    getAllLinesQuery,
    getRouteQuery,
    getRoutePathQuery,
    getLinksByStartNodeQuery,
    getLinksByStartNodeAndEndNodeQuery,
    getNodeQuery,
    getRoutePathLinkQuery,
    getLinksByEndNodeQuery,
};
