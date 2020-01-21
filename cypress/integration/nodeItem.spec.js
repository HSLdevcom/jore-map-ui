const openNode = () => {
    cy.getTestElement('authInfo').should('exist');
    cy.getTestElement('lineSearch').should('exist');

    cy.getTestElement('nodeItem')
        .first()
        .click();
    cy.getTestElement('nodeView').should('exist');
};

describe('NodeItemView tests - read access user', () => {
    it('Can open node and close it to return home page', () => {
        cy.hslLoginReadAccess();
        openNode();

        cy.getTestElement('editButton').should('not.exist');

        cy.getTestElement('sidebarHeaderView')
            .find('[data-cy=closeButton]')
            .first()
            .click();
        cy.getTestElement('nodeView').should('not.exist');
    });
});

describe('NodeItemView tests - write access user', () => {
    it.only('Can edit node', () => {
        cy.hslLoginWriteAccess();
        openNode();

        cy.getTestElement('editButton').should('exist');
        cy.getTestElement('editButton').click();

        cy.getTestElement('saveButton').should($el => {
            expect($el).to.have.css('pointer-events', 'none');
        });

        cy.getTestElement('nodeTypeDropdown').type('-');
        cy.getTestElement('nodeTypeDropdown')
            .click()
            .type('{downarrow}{enter}'); // we send the Enter to the input field

        cy.getTestElement('saveButton').should($el => {
            expect($el).not.have.css('pointer-events', 'none');
        });

        cy.getTestElement('saveButton').click();
        cy.getTestElement('savePromptView').should('exist');
    });
});
