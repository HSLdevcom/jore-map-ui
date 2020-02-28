describe('Search list tests', () => {
    beforeEach(() => {
        cy.hslLoginWriteAccess();
        cy.getTestElement('authInfo').should('exist');
        cy.getTestElement('lineSearch').should('exist');

        cy.waitUntilLoadingFinishes();
    });

    it('Can open all routes from searchList', () => {
        cy.getTestElement('nodeToggle').click();
        cy.getTestElement('openAllRoutesButton')
            .first()
            .click();
        cy.getTestElement('routeListView').should('exist');
    });
});
