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
        cy.openCrossroad();

        cy.getTestElement('editButton').should('not.exist');

        cy.getTestElement('sidebarHeaderView')
            .find('[data-cy=closeButton]')
            .first()
            .click();
        cy.getTestElement('nodeView').should('not.exist');
    });
});

describe('NodeView tests - write access user', () => {
    it('Can edit crossroad', () => {
        cy.hslLoginWriteAccess();
        cy.openCrossroad();

        cy.getTestElement('editButton').should('exist');
        cy.getTestElement('editButton').click();

        cy.saveButtonShouldNotBeActive();
        cy.getTestElement('measurementDate').type('1'); // Currently 1 sets whole date
        cy.saveButtonShouldBeActive();

        cy.getTestElement('saveButton').click();
        cy.getTestElement('savePromptView').should('exist');
    });

    it('Can edit municipality', () => {
        cy.hslLoginWriteAccess();
        cy.getTestElement('lineToggle').click();
        cy.getTestElement('lineSearch').click();
        cy.getTestElement('lineSearch').type('101');

        cy.getTestElement('nodeItem-')
            .first()
            .click();
        cy.getTestElement('nodeView').should('exist');

        cy.getTestElement('editButton').should('exist');
        cy.getTestElement('editButton').click();

        cy.saveButtonShouldNotBeActive();
        cy.getTestElement('measurementDate').type('1'); // Currently 1 sets whole date
        cy.saveButtonShouldBeActive();

        cy.getTestElement('saveButton').click();
        cy.getTestElement('savePromptView').should('exist');
    });

    it('Can edit stop', () => {
        cy.hslLoginWriteAccess();
        cy.openStop();

        cy.getTestElement('editButton').should('exist');
        cy.getTestElement('editButton').click();

        cy.saveButtonShouldNotBeActive();
        cy.getTestElement('longNameInput').type('foo');
        cy.saveButtonShouldBeActive();

        cy.getTestElement('saveButton').click();
        cy.getTestElement('savePromptView').should('exist');
    });

    it('Can edit hastus-paikka', () => {
        cy.hslLoginWriteAccess();
        cy.openStop();

        cy.getTestElement('editHastusButton').click();
        cy.getTestElement('hastusAreaForm').should('exist');

        cy.saveButtonShouldNotBeActive('confirmView');
        cy.getTestElement('hastusNameInput').type('asd123');
        cy.saveButtonShouldBeActive('confirmView');
    });
});
