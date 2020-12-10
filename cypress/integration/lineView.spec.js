import constants from '../constants';

describe('LineView tests - read access user', () => {
    beforeEach(() => {
        cy.hslLoginReadAccess();
        _openLine();
    });

    it('Can open routes tab', () => {
        cy.getTestElement('tab').contains('Reitit').click();
        cy.getTestElement('lineRoutesTabView').should('exist');
    });

    it('Can open lineHeader', () => {
        cy.getTestElement('lineHeaderButton', { timeout: 10000 }).first().click();
        cy.getTestElement('activeLineHeaderName').should('exist');
        cy.getTestElement('editButton').should('not.exist');
    });

});

describe('LineView tests - write access user', () => {
    beforeEach(() => {
        cy.hslLoginWriteAccess();
        _openLine();
    });

    it('Can copy lineHeader from other line', () => {
        cy.getTestElement('lineView').should('exist');

        cy.getTestElement('lineHeaderTableView').find('[data-cy=editButton]').first().click();

        cy.getTestElement('copyLineHeadersButton').click();

        cy.getTestElement('lineHeaderTableView').find('[data-cy=lineDropdown]').first().click().type('9975');
        cy.getTestElement('dropdownOption').first().click();

        cy.getTestElement('lineHeaderTableView').find('[data-cy=lineHeaderRow]').first().click()
        cy.getTestElement('lineHeaderTableView').find('[data-cy=copySelectedLineHeaders]').first().click()

        cy.getTestElement('lineHeaderTableView').contains('Keravan asema');
    })
});

const _openLine = () => {
        cy.getTestElement('lineSearch').click();
        cy.getTestElement('lineSearch').clear().type(constants.LINE_TEST_ID);
        cy.wait(1000);
        cy.getTestElement('lineItem', { timeout: 10000 }).first().click();

        cy.getTestElement('lineView').should('exist');
};