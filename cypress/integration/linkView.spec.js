const openLink = () => {
    cy.getTestElement('authInfo').should('exist');
    cy.getTestElement('lineSearch').should('exist');

    // Have to use different link for dev / stage to prevent local db out-of-sync errors
    if (Cypress.config().baseUrl.includes('dev')) {
        cy.visit('link/1270003,1270103,1');
    } else {
        cy.visit('link/1260011,1260105,1');
    }
    cy.getTestElement('linkView').should('exist');
};

describe('LinkView tests - read access user', () => {
    it('Can open link and close it to return home page', () => {
        cy.hslLoginReadAccess();
        openLink();

        cy.getTestElement('editButton').should('not.exist');

        cy.getTestElement('sidebarHeaderView')
            .find('[data-cy=closeButton]')
            .first()
            .click();
        cy.getTestElement('linkView').should('not.exist');
    });
});

describe('LinkView tests - write access user', () => {
    it('Can save link', () => {
        cy.hslLoginWriteAccess();
        openLink();

        cy.getTestElement('editButton').should('exist');
        cy.getTestElement('editButton').click();

        cy.getTestElement('measuredLength')
            .invoke('val')
            .then(value => {
                const newInputValue = parseInt(value) + 1;
                cy.getTestElement('measuredLength')
                    .clear()
                    .type(newInputValue);

                cy.saveButtonShouldBeActive();

                cy.getTestElement('saveButton').click();
                cy.getTestElement('savePromptView').should('exist');
                cy.getTestElement('confirmButton').click();

                cy.getTestElement('measuredLength').contains(newInputValue);
            });
    });
});
