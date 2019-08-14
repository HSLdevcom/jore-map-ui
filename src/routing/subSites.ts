enum SubSites {
    current = '',
    home = '/',
    line = '/line/:id',
    newLine = '/line/new',
    lineTopic = '/line/:id/lineTopic/:startDate',
    newLineTopic = '/line/:id/lineTopic/new',
    route = '/route/:id',
    newRoute = '/route/new',
    routes = '/routes/',
    link = '/link/:id',
    splitLink = '/splitLink/:id',
    newLink = '/link/new/:id',
    routePath = '/routePath/:id',
    newRoutePath = '/routePath/new',
    node = '/node/:id',
    newNode = '/node/new/:id',
    login = '/login',
    afterLogin = '/afterLogin'
}

export default SubSites;
