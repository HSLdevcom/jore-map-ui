describe('RouteListView tests - read access user', () => {
    beforeEach(() => {
        cy.hslLoginReadAccess();
        cy.getTestElement('authInfo').should('exist');
        cy.getTestElement('lineSearch').should('exist');

        cy.getTestElement('routeItem')
            .first()
            .click();
        cy.getTestElement('routeListView').should('exist');
        cy.getTestElement('editButton').should('not.exist');
    });

    it('Can open route and close it to return home page', () => {
        cy.getTestElement('sidebarHeaderView')
            .find('[data-cy=closeButton]')
            .first()
            .click();
        cy.getTestElement('routeListView').should('not.exist');
    });

    it('Can open a second route to routeList and close one route', () => {
        cy.getTestElement('lineSearch').click();
        cy.getTestElement('lineSearch').type('550');
        cy.wait(1000);
        cy.getTestElement('routeItem')
            .first()
            .click();

        cy.getTestElement('editButton').should('not.exist');
        cy.getTestElement('routeListView').should('exist');
        cy.getTestElement('routeListView')
            .find('[data-cy=routeId]')
            .should('have.length', 2);

        cy.getTestElement('sidebarHeaderView')
            .find('[data-cy=closeButton]')
            .first()
            .click();

        cy.getTestElement('routeListView').should('exist');
        cy.getTestElement('routeListView')
            .find('[data-cy=routeId]')
            .should('have.length', 1);
    });
});
