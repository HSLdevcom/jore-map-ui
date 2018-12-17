import gql from 'graphql-tag';

// tslint:disable:max-line-length

function getLineQuery() {
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
}

function getAllLinesQuery() {
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
}

function getRouteQuery() {
    return (
        gql`query getLineDetails($routeId: String!) {
            route: reittiByReitunnus(reitunnus: $routeId) {
                ${routeQueryFields}
                reitinsuuntasByReitunnus{
                    nodes {
                        ${routePathQueryFields}
                        ${routePathLinksForRoutePathQuery}
                    }
                }
            }
        }`
    );
}

function getRoutePathQuery() {
    return (
        gql`query getRoutePath($routeId: String!, $startDate: Datetime!, $direction: String!) {
            routePath: reitinsuuntaByReitunnusAndSuuvoimastAndSuusuunta(reitunnus: $routeId, suuvoimast: $startDate, suusuunta: $direction) {
                ${routePathQueryFields}
                reittiByReitunnus {
                    lintunnus
                }
                ${routePathLinksForRoutePathQuery}
            }
        }`
    );
}

function getRoutePathLinkQuery() {
    return (
        gql`query getRoutePathLink($routeLinkId: Int!) {
            routePathLink: reitinlinkkiByRelid(relid: $routeLinkId) {
                ${routePathLinkQueryFields}
            }
        }`
    );
}

function getLinksQuery() {
    return (
        gql`query getNodesWithRoutePathLinkStartNodeId($nodeId: String!) {
            solmuBySoltunnus(soltunnus: $nodeId) {
                linkkisByLnkalkusolmu {
                    nodes {
                        ${routeLinkQueryFields}
                        solmuByLnkalkusolmu {
                            ${startNodeQueryFields}
                        }
                        solmuByLnkloppusolmu {
                            ${endNodeQueryFields}
                        }
                    }
                }
            }
        }`
    );
}

function getNodeQuery() {
    return (
        gql`
        query getNodeDetails($nodeId: String!) {
            node: solmuBySoltunnus(soltunnus: $nodeId) {
                ${nodeQueryFields}
            }
        }`
    );
}

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
    solx,
    soly,
    soltunnus,
    sollistunnus,
    solkirjain,
    soltyyppi,
    solkirjain,
    geojson,
    geojsonManual,
    pysakkiBySoltunnus {
        pyssade,
        pysnimi,
        pysnimir,
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

const routeLinkQueryFields = `
    geojson
    lnkverkko
`;

// tslint:enable:max-line-length

export default {
    getLineQuery,
    getAllLinesQuery,
    getRouteQuery,
    getRoutePathQuery,
    getLinksQuery,
    getNodeQuery,
    getRoutePathLinkQuery,
};
