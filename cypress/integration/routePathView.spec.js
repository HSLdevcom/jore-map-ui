import constants from '../constants';

describe('RoutePathView tests - read access user', () => {
    it('Can open routePath and close it to return home page', () => {
        cy.hslLoginReadAccess();

        _openRoutePath();

        cy.getTestElement('routePathView').should('exist');
        cy.getTestElement('editButton').should('not.exist');

        cy.getTestElement('sidebarHeaderView').find('[data-cy=closeButton]').first().click();
        cy.getTestElement('routePathView').should('not.exist');
    });
});

describe('RoutePathView tests - write access user', () => {
    it('Can save routePath', () => {
        cy.hslLoginWriteAccess();

        _openRoutePath();

        cy.getTestElement('routePathView').should('exist');
        cy.getTestElement('editButton').should('exist');

        cy.getTestElement('editButton').click();
        cy.getTestElement('nameFi')
            .invoke('val')
            .then((value) => {
                let newInputValue;
                if (isNaN(value)) {
                    newInputValue = 1;
                } else {
                    newInputValue = parseInt(value) + 1;
                }
                cy.getTestElement('nameFi').clear().type(newInputValue);

                _saveRoutePath();

                cy.getTestElement('nameFi').contains(newInputValue);
            });
    });

    it('Can save routePath links', () => {
        cy.hslLoginWriteAccess();

        _openRoutePath();

        cy.getTestElement('routePathView').should('exist');
        cy.getTestElement('editButton').should('exist');

        cy.getTestElement('editButton').click();

        cy.getTestElement('tab').contains('Solmut ja linkit').click();

        cy.getTestElement('itemHeader').first().click();

        cy.incrementInputValue('destinationFi1').then((newInputValueDestinationFi1) => {
            cy.incrementInputValue('destinationShieldFi').then(
                (newInputValueDestinationShieldFi) => {

                    _saveRoutePath();

                    cy.getTestElement('itemHeader').first().click();

                    cy.getTestElement('destinationFi1').contains(newInputValueDestinationFi1);
                    cy.getTestElement('destinationShieldFi').contains(
                        newInputValueDestinationShieldFi
                    );
                }
            );
        });
    });

    it('Can remove routePathLink and use copy routePath segment tool', () => {
        cy.hslLoginWriteAccess();

        _openRoutePath();

        cy.getTestElement('routePathView').should('exist');
        cy.getTestElement('editButton').should('exist');

        cy.getTestElement('tab').contains('Solmut ja linkit').click();

        cy.getTestElement('linksToggle').click();

        cy.getTestElement('RemoveRoutePathLinkTool').click();

        cy.getTestElement('rpListLink').eq(3).click();
        cy.getTestElement('CopyRoutePathSegmentTool').click();
        cy.wait(100);
        cy.getTestElement('rpListNode').eq(3).click();
        cy.wait(100);
        cy.getTestElement('rpListNode').eq(4).click();
        cy.getTestElement('copyRoutePathSegmentButton').first().click();

        cy.getTestElement('routePathSaveButton').click();

        cy.getTestElement('modalContainer').should('exist');
    });
});

const _saveRoutePath = () => {
    cy.saveButtonShouldBeActive();

    cy.getTestElement('routePathSaveButton').click();

    cy.getTestElement('modalContainer').then((modal) => {
        // unmeasuredStopGapPrompt is not guaranteed to show up
        if (modal[0].innerHTML.includes('unmeasuredStopGapPrompt')) {
            cy.getTestElement('confirmButton').click();
        }

        cy.getTestElement('savePromptView').should('exist');
        cy.getTestElement('confirmButton').click();
    });
}

const _openRoutePath = () => {
    cy.getTestElement('lineToggle').click();
    cy.getTestElement('lineSearch').click();
    cy.getTestElement('lineSearch').type(constants.ROUTE_PATH_UPDATE_LINE_ID);
    cy.wait(1000);
    cy.getTestElement('routeItem').first().click();

    cy.getTestElement('routeListView').should('exist');
    cy.getTestElement('openRoutePathViewButton').first().click();
};
