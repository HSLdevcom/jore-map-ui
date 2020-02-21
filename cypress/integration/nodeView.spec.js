const openNode = () => {
    cy.getTestElement('authInfo').should('exist');
    cy.getTestElement('lineSearch').should('exist');

    cy.getTestElement('nodeItem')
        .first()
        .click();
    cy.getTestElement('nodeView').should('exist');
};

describe('NodeView tests - read access user', () => {
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

describe('NodeView tests - write access user', () => {
    it.only('Can edit node', () => {
        cy.hslLoginWriteAccess();
        openNode();

        cy.getTestElement('editButton').should('exist');
        cy.getTestElement('editButton').click();

        cy.getTestElement('saveButton').should($el => {
            expect($el).to.have.css('pointer-events', 'none');
        });

        cy.getTestElement('measurementDate').type('1'); // Currently 1 sets whole date

        cy.getTestElement('saveButton').should($el => {
            expect($el).not.have.css('pointer-events', 'none');
        });

        cy.getTestElement('saveButton').click();
        cy.getTestElement('savePromptView').should('exist');
    });
});
