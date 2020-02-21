describe('RoutePathView tests - read access user', () => {
    it('Can open routePath and close it to return home page', () => {
        cy.hslLoginReadAccess();
        cy.getTestElement('authInfo').should('exist');
        cy.getTestElement('lineSearch').should('exist');

        cy.getTestElement('nodeToggle').click();
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

        cy.getTestElement('routePathView').should('exist');
        cy.getTestElement('editButton').should('not.exist');

        cy.getTestElement('sidebarHeaderView')
            .find('[data-cy=closeButton]')
            .first()
            .click();
        cy.getTestElement('routePathView').should('not.exist');
    });
});
