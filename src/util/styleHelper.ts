import routeBuilder from '../routing/routeBuilder';
import * as s from './styleHelper.scss';

class StyleHelper {
    public static getSidebarClassName() {
        const currentUrl = routeBuilder.getCurrentLocation();
        switch (currentUrl) {
        case '/routes/': {
            return s.sidebarViewDefaultWidth;
        }
        case '/node/': {
            return s.sidebarViewNodeWidth;
        }
        case '/link/': {
            return s.sidebarViewLinkWidth;
        }
        default: {
            return s.sidebarViewDefaultWidth;
        }
        }
    }

    public static getMapClassName() {
        const currentUrl = routeBuilder.getCurrentLocation();
        switch (currentUrl) {
        case '/routes/': {
            return s.mapViewDefaultWidth;
        }
        case '/node/': {
            return s.mapViewNodeWidth;
        }
        case '/link/': {
            return s.mapViewLinkWidth;
        }
        default: {
            return s.mapViewDefaultWidth;
        }
        }
    }
}

export default StyleHelper;
