describe('NodeView tests - read access user', () => {
    it('Can open node and close it to return home page', () => {
        cy.hslLoginReadAccess();
        _openCrossroad();

        cy.getTestElement('editButton').should('not.exist');

        cy.getTestElement('sidebarHeaderView').find('[data-cy=closeButton]').first().click();
        cy.getTestElement('nodeView').should('not.exist');
    });
});

describe('NodeView tests - write access user', () => {
    it('Can save new node - id available', () => {
        cy.hslLoginWriteAccess();

        // Center map to Vantaa
        cy.getTestElement('coordinateControlY').clear().type(60.306);
        cy.getTestElement('coordinateControlX').clear().type(25.023).type('{enter}');

        cy.getTestElement('newNodeTool').click();

        cy.getTestElement('mapView').click(300, 300);

        cy.getTestElement('nodeView').find('[data-cy=showBus]').click();

        _fillStopRequiredFields();

        cy.saveButtonShouldBeActive();
    });

    it('Can save new node - id space ran out', () => {
        cy.hslLoginWriteAccess();

        // Center map to Kirkkonummi
        cy.getTestElement('coordinateControlY').clear().type(60.1226);
        cy.getTestElement('coordinateControlX').clear().type(24.44).type('{enter}');

        cy.getTestElement('newNodeTool').click();

        cy.getTestElement('mapView').click(300, 300);

        cy.getTestElement('nodeView').find('[data-cy=showBus]').click();

        cy.getTestElement('closeAlertButton').click();

        // Type in custom node id. Beginning of 1234, idSuffix option 1
        cy.getTestElement('nodeId').type('1234');
        cy.getTestElement('idSuffix').click();
        cy.getTestElement('dropdownOption').eq(1).click();

        _fillStopRequiredFields();

        cy.saveButtonShouldBeActive();
    });

    it('Can save new node - area data json not found with given node coordinates', () => {
        cy.hslLoginWriteAccess();

        // Center map to a lake near Lahti (so that area data json will return empty data)
        cy.getTestElement('coordinateControlY').clear().type(61.016);
        cy.getTestElement('coordinateControlX').clear().type(25.609).type('{enter}');

        cy.getTestElement('newNodeTool').click();

        cy.getTestElement('mapView').click(300, 300);

        cy.getTestElement('closeAlertButton').click();

        cy.getTestElement('nodeView').find('[data-cy=showBus]').click();

        // Type in custom node id. Beginning of 1234, idSuffix option 1
        cy.getTestElement('nodeId').type('1234');
        cy.getTestElement('idSuffix').click();
        cy.getTestElement('dropdownOption').eq(1).click();

        _fillStopRequiredFields();

        cy.saveButtonShouldBeActive();
    });

    it('Can edit crossroad', () => {
        cy.hslLoginWriteAccess();
        _openCrossroad();

        cy.getTestElement('editButton').should('exist');
        cy.getTestElement('editButton').click();

        cy.saveButtonShouldNotBeActive();
        cy.getTestElement('longitudeInput').clear().type('24.952279');
        cy.saveButtonShouldBeActive();

        cy.getTestElement('saveButton').click();
        cy.getTestElement('savePromptView').should('exist');
    });

    it('Can edit municipality', () => {
        cy.hslLoginWriteAccess();
        _openMunicipality();

        cy.getTestElement('editButton').should('exist');
        cy.getTestElement('editButton').click();

        cy.saveButtonShouldNotBeActive();
        cy.getTestElement('longitudeInput').clear().type('24.952279');

        cy.saveButtonShouldBeActive();

        cy.getTestElement('saveButton').click();
        cy.getTestElement('savePromptView').should('exist');
    });

    it('Can save stop', () => {
        cy.hslLoginWriteAccess();
        _openStop();

        cy.getTestElement('editButton').should('exist');
        cy.getTestElement('editButton').click();

        cy.getTestElement('elyNumber')
            .invoke('val')
            .then((value) => {
                const newInputValue = parseInt(value) + 1;
                cy.getTestElement('elyNumber').clear().type(newInputValue);

                cy.saveButtonShouldBeActive();

                cy.getTestElement('saveButton').click();
                cy.getTestElement('savePromptView').should('exist');
                cy.getTestElement('confirmButton').click();

                cy.getTestElement('elyNumber').contains(newInputValue);
            });
    });

    it('Can edit hastus-paikka', () => {
        cy.hslLoginWriteAccess();
        _openStop();

        cy.getTestElement('createHastusButton').click();
        cy.getTestElement('hastusAreaForm').should('exist');

        cy.saveButtonShouldNotBeActive('hastusSaveButton');
        cy.getTestElement('hastusIdInput').type('zxc123');
        cy.getTestElement('hastusNameInput').type('zxc123');
        cy.saveButtonShouldBeActive('hastusSaveButton');
    });

    it('Can create a stop in lahti by using custom generated node id', () => {
        cy.hslLoginWriteAccess();

        cy.visit('node/new/60.991759:25.664062');
        cy.getTestElement('closeAlertButton').click();

        cy.saveButtonShouldNotBeActive();

        cy.getTestElement('nodeId').type('12345');

        cy.getTestElement('idSuffix').type('01');
        cy.getTestElement('dropdownOption').first().click();

        _fillStopRequiredFields();

        cy.saveButtonShouldBeActive();
    });
});

const _openStop = () => {
    cy.getTestElement('authInfo').should('exist');
    cy.getTestElement('lineSearch').should('exist');

    // Have to use different link for dev / stage to prevent local db out-of-sync errors
    if (Cypress.config().baseUrl.includes('dev')) {
        cy.visit('node/1270103');
    } else {
        cy.visit('node/1260105');
    }
    cy.getTestElement('nodeView').should('exist');
};

const _openCrossroad = () => {
    cy.getTestElement('nodeToggle').click();
    cy.getTestElement('lineSearch').click();
    cy.getTestElement('lineSearch').clear().type('101');

    cy.getTestElement('nodeItemX').first().click();
    cy.getTestElement('nodeView').should('exist');
};

const _openMunicipality = () => {
    cy.getTestElement('nodeToggle').click();
    cy.getTestElement('lineSearch').click();
    cy.getTestElement('lineSearch').clear().type('101');

    cy.getTestElement('nodeItem-').first().click();
    cy.getTestElement('nodeView').should('exist');
};

const _fillStopRequiredFields = () => {
    cy.getTestElement('measurementType').type('Laskettu');
    cy.getTestElement('dropdownOption').first().click();

    cy.getTestElement('stopArea').click();
    cy.getTestElement('dropdownOption').eq(2).click();

    cy.getTestElement('addressFi').clear().type('a_fi');
    cy.getTestElement('addressSw').clear().type('a_sw');

    cy.getTestElement('municipality').click();
    cy.getTestElement('dropdownOption').first().click();

    cy.getTestElement('section').click();
    cy.getTestElement('dropdownOption').eq(2).click();

    cy.getTestElement('roof').click();
    cy.getTestElement('dropdownOption').first().click();
};
