describe('Authentication tests - read access user', () => {
    it('Cannot see unauthorized elements when not logged in', () => {
        cy.visit('/');
        cy.getTestElement('authInfo').should('not.exist');
        cy.getTestElement('lineSearch').should('not.exist');
    });

    it('Can log in with HSL ID', () => {
        cy.hslLoginReadAccess();

        cy.getTestElement('authInfo').should('exist');
        cy.getTestElement('authInfo').contains('Selauskäyttäjä');
        cy.getTestElement('lineSearch').should('exist');
    });

    it('Can log out', () => {
        cy.hslLoginReadAccess();

        cy.getTestElement('logoutButton')
            .should('exist')
            .click();

        cy.getTestElement('authInfo').should('not.exist');
        cy.getTestElement('lineSearch').should('not.exist');
    });
});

describe('Authentication tests - write access user', () => {
    it('Cannot see unauthorized elements when not logged in', () => {
        cy.visit('/');
        cy.getTestElement('authInfo').should('not.exist');
        cy.getTestElement('lineSearch').should('not.exist');
    });

    it('Can log in with HSL ID', () => {
        cy.hslLoginWriteAccess();

        cy.getTestElement('authInfo').should('exist');
        cy.getTestElement('authInfo').contains('Pääkäyttäjä');
        cy.getTestElement('lineSearch').should('exist');
    });

    it('Can log out', () => {
        cy.hslLoginWriteAccess();

        cy.getTestElement('logoutButton')
            .should('exist')
            .click();

        cy.getTestElement('authInfo').should('not.exist');
        cy.getTestElement('lineSearch').should('not.exist');
    });
});
