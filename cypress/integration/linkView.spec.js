const openLink = () => {
    cy.getTestElement('authInfo').should('exist');
    cy.getTestElement('lineSearch').should('exist');

    cy.visit('link/0000002,1000002,1');
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
    it('Can edit link', () => {
        cy.hslLoginWriteAccess();
        openLink();

        cy.getTestElement('editButton').should('exist');
        cy.getTestElement('editButton').click();

        cy.getTestElement('saveButton').should($el => {
            expect($el).to.have.css('pointer-events', 'none');
        });

        cy.getTestElement('measuredLength').type(123);

        cy.getTestElement('saveButton').should($el => {
            expect($el).not.have.css('pointer-events', 'none');
        });

        cy.getTestElement('saveButton').click();
        cy.getTestElement('savePromptView').should('exist');
    });
});
