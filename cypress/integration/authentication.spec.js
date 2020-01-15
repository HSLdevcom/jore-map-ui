describe('Authentication smoke tests', () => {
    it('Cannot see unauthorized elements when not logged in', () => {
        cy.visit('/');
        cy.getTestElement('authInfo').should('not.exist');
        cy.getTestElement('lineSearch').should('not.exist');
    });

    it('Can log in with HSL ID', () => {
        cy.hslLogin();

        cy.getTestElement('authInfo').should('exist');

        cy.waitUntilLoadingFinishes();

        cy.getTestElement('lineSearch').should('exist');
    });

    it('Can log out', () => {
        cy.hslLogin();

        cy.waitUntilLoadingFinishes();

        cy.getTestElement('logoutButton')
            .should('exist')
            .click();

        cy.waitUntilLoadingFinishes();

        cy.getTestElement('authInfo').should('not.exist');
        cy.getTestElement('lineSearch').should('not.exist');
    });
});
