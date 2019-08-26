enum SubSites {
    current = '',
    home = '/',
    line = '/line/:id',
    newLine = '/line/new',
    lineHeader = '/line/:id/lineHeader/:startDate',
    newLineHeader = '/line/:id/lineHeader/new',
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
