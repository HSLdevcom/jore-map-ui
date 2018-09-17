import routeBuilder from '../routing/routeBuilder';

class StyleHelper {
    public static getSideBarWidth() {
        const currentUrl = routeBuilder.getCurrentLocation();
        switch (currentUrl) {
        case '/routes/': {
            return 400;
        }
        case '/node/': {
            return 400;
        }
        case '/link/': {
            return 500;
        }
        default: {
            return 400;
        }
        }
    }
}

export default StyleHelper;
