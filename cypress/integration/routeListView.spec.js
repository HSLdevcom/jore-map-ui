import constants from "../constants";

describe('RouteListView tests - read access user', () => {
    beforeEach(() => {
        cy.hslLoginReadAccess();

        cy.getTestElement('routeItem')
            .first()
            .click();
        cy.getTestElement('routeListView').should('exist');
        cy.getTestElement('editButton').should('not.exist');
    });

    it('Can open route and close it to return home page', () => {
        cy.getTestElement('sidebarHeaderView')
            .find('[data-cy=closeButton]')
            .first()
            .click();
        cy.getTestElement('routeListView').should('not.exist');
    });

    it('Can open a second route to routeList and close one route', () => {
        cy.getTestElement('lineSearch').click();
        cy.getTestElement('lineSearch').type('550');
        cy.wait(1000);
        cy.getTestElement('routeItem')
            .first()
            .click();

        cy.getTestElement('editButton').should('not.exist');
        cy.getTestElement('routeListView').should('exist');
        cy.getTestElement('routeListView')
            .find('[data-cy=routeId]')
            .should('have.length', 2);

        cy.getTestElement('sidebarHeaderView')
            .find('[data-cy=closeButton]')
            .first()
            .click();

        cy.getTestElement('routeListView').should('exist');
        cy.getTestElement('routeListView')
            .find('[data-cy=routeId]')
            .should('have.length', 1);
    });
});

describe('RouteListView tests - write access user', () => {
    beforeEach(() => {
        cy.hslLoginWriteAccess();

        cy.visit(constants.ROUTE_LIST_UPDATE_URI);

        cy.getTestElement('routeListView').should('exist');
        cy.getTestElement('editButton').should('exist');
    });

    it('Can open route and close it to return home page', () => {
        cy.getTestElement('routeListView').should('exist');
        cy.getTestElement('editButton').should('exist');

        // TODO: after calendar input works:
        // 0. open route 1016B - put this to constants.ts
        // 0.5: if routePath to modify into exists, remove it

        // 1. edit pen
        // 2. copy new routePath there
        // - click copy button, select line, route, routePath
        // - click add
        // - click copy
        // 3. put timestamp to the future
        // 3. save
        // 4. check that save was ok
        // 5. modify copied routePath start & end date
        // 6. save
        // 7. check that save was ok
        // 8. open modified routePath, remove it
        // 9. check that rp was removed
    });
});