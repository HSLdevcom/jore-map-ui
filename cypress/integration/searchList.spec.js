describe('Search list tests', () => {
    beforeEach(() => {
        cy.hslLoginWriteAccess();
        cy.getTestElement('authInfo').should('exist');
        cy.getTestElement('lineSearch').should('exist');

        cy.waitUntilLoadingFinishes();
    });

    it('Can open all routes from searchList', () => {
        cy.getTestElement('lineToggle').click();
        cy.getTestElement('openAllRoutesButton')
            .first()
            .click();
        cy.getTestElement('routeListView').should('exist');
    });

    it('Can open stop from searchList', () => {
        cy.getTestElement('nodeToggle').click();
        cy.getTestElement('lineSearch').click();
        cy.getTestElement('lineSearch').type('110');

        cy.getTestElement('nodeItemP')
            .first()
            .click();
        cy.getTestElement('nodeView').should('exist');
    });
});
