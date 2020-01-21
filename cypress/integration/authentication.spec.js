describe('Authentication tests', () => {
    it('Cannot see unauthorized elements when not logged in', () => {
        cy.visit('/');
        cy.getTestElement('authInfo').should('not.exist');
        cy.getTestElement('lineSearch').should('not.exist');
    });

    it('Can log in with HSL ID', () => {
        cy.hslLoginReadAccess();

        cy.waitUntilLoadingFinishes();

        cy.getTestElement('authInfo').should('exist');

        cy.getTestElement('lineSearch').should('exist');
    });

    it('Can log out', () => {
        cy.hslLoginReadAccess();

        cy.waitUntilLoadingFinishes();

        cy.getTestElement('logoutButton')
            .should('exist')
            .click();

        cy.getTestElement('authInfo').should('not.exist');
        cy.getTestElement('lineSearch').should('not.exist');
    });
});
