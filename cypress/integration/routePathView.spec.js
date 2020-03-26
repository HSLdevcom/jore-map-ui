describe('RoutePathView tests - read access user', () => {
    it('Can open routePath and close it to return home page', () => {
        cy.hslLoginReadAccess();

        _openRoutePath();

        cy.getTestElement('routePathView').should('exist');
        cy.getTestElement('editButton').should('not.exist');

        cy.getTestElement('sidebarHeaderView')
            .find('[data-cy=closeButton]')
            .first()
            .click();
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
            .then(value => {
                let newInputValue;
                if (isNaN(value)) {
                    newInputValue = 1;
                } else {
                    newInputValue = parseInt(value) + 1;
                }
                cy.getTestElement('nameFi')
                    .clear()
                    .type(newInputValue);

                cy.saveButtonShouldBeActive();

                cy.getTestElement('saveButton').click();
                cy.getTestElement('savePromptView').should('exist');
                cy.getTestElement('confirmButton').click();

                cy.getTestElement('nameFi').contains(newInputValue);
            });
    });

    it('Can save routePath links', async () => {
        cy.hslLoginWriteAccess();

        _openRoutePath();

        cy.getTestElement('routePathView').should('exist');
        cy.getTestElement('editButton').should('exist');

        cy.getTestElement('editButton').click();

        cy.getTestElement('tab')
            .contains('Solmut ja linkit')
            .click();

        cy.getTestElement('itemHeader')
            .first()
            .click();

        cy.incrementInputValue('destinationFi1').then(newInputValueDestinationFi1 => {
            cy.incrementInputValue('destinationShieldFi').then(newInputValueDestinationShieldFi => {
                cy.saveButtonShouldBeActive();

                cy.getTestElement('saveButton').click();
                cy.getTestElement('savePromptView').should('exist');
                cy.getTestElement('confirmButton').click();

                cy.getTestElement('destinationFi1').contains(newInputValueDestinationFi1);
                cy.getTestElement('destinationShieldFi').contains(newInputValueDestinationShieldFi);
            });
        });
    });
});

const _openRoutePath = () => {
    cy.getTestElement('lineToggle').click();
    cy.getTestElement('lineSearch').click();
    cy.getTestElement('lineSearch').type('550');
    cy.wait(1000);
    cy.getTestElement('routeItem')
        .first()
        .click();

    cy.getTestElement('routeListView').should('exist');
    cy.getTestElement('openRoutePathViewButton')
        .first()
        .click();
};
