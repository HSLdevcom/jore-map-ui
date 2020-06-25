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

    it.only('Can copy routePath & save, edit routePath & save, finally remove routePath', () => {
        const initialStartDate = '10.05.2099';
        const initialEndDate = '11.05.2099';
        const startDateAfterEditing = '15.05.2099';
        const endDateAfterEditing = '16.05.2099';

        // If routePaths to be created / edited exist, remove them at first
        removeRoutePathIfExists(initialStartDate, initialEndDate);
        removeRoutePathIfExists(startDateAfterEditing, endDateAfterEditing);

        cy.getTestElement('routeListView').should('exist');
        cy.getTestElement('editButton').should('exist');
        cy.getTestElement('editButton').click();
        cy.getTestElement('copyRoutePathButton').click();

        // --- CopyRoutePathView, select 3 routePaths to copy ---
        cy.getTestElement('copyRoutePathView').should('exist');

        cy.getTestElement('lineDropdown').type('9975');
        cy.getTestElement('dropdownOption').first().click();

        cy.getTestElement('routeDropdown').type('9975');
        cy.getTestElement('dropdownOption').first().click();

        // Select first two routePaths to copy
        cy.getTestElement('rpQueryResult').first().click();
        cy.getTestElement('rpQueryResult').eq(1).click();
        cy.waitUntil(() => {
            return cy.getTestElement('selectedRp').should('have.length', 2)
        });
        cy.getTestElement('addRoutePathsToCopy').click();

        // Select first routePath to copy
        cy.getTestElement('rpQueryResult').first().click();
        cy.waitUntil(() => {
            return cy.getTestElement('selectedRp').should('have.length', 1)
        });
        cy.getTestElement('addRoutePathsToCopy').click();

        cy.getTestElement('copyRoutePaths').click();

        // --- RouteListView, remove 2 routePaths (before saving), set start & end dates and save
        cy.getTestElement('routeListView').should('exist');

        cy.get('body').type('{ctrl}', { release:false }).then(() => {
            cy.getTestElement('routePathRow').first().click();
            cy.getTestElement('routePathRow').eq(2).click();
        });
        // The first group should have 2 routePaths
        cy.getTestElement('rpGroup-0').find('[data-cy=routePathRow]').should('have.length', 2);
        cy.get('body').type('{ctrl}', { release:true })

        // Remove one rp from the first group, one rp from the second group
        cy.getTestElement('rpGroup-0').find('[data-cy=removeRoutePath]').eq(1).click();
        cy.getTestElement('rpGroup-1').find('[data-cy=removeRoutePath]').click();

        // Now only 1 routePath should be left
        cy.getTestElement('rpGroup-0').find('[data-cy=routePathRow]').should('have.length', 1);

        cy.getTestElement('rpGroup-0').find('[data-cy=startDateInput]').type('10.5.2099', { force: true });
        cy.get('body').type('{enter}');

        cy.getTestElement('rpGroup-0').find('[data-cy=endDateInput]').type('11.5.2099', { force: true });
        cy.get('body').type('{enter}');

        cy.getTestElement('saveButton').click();
        cy.getTestElement('confirmButton').click();

        cy.waitUntilModalContainerDisappears();

        // --- RouteListView, update routePath save
        cy.getTestElement('rpGroup-0').find('[data-cy=rpHeader]').contains(initialStartDate);
        cy.getTestElement('rpGroup-0').find('[data-cy=rpHeader]').contains(initialEndDate);

        cy.getTestElement('editButton').click();

        cy.getTestElement('rpGroup-0').find('[data-cy=startDateInput]').clear().type(startDateAfterEditing);
        cy.getTestElement('rpGroup-0').find('[data-cy=endDateInput]').clear().type(endDateAfterEditing);

        cy.getTestElement('saveButton').click();
        cy.getTestElement('confirmButton').click();

        cy.waitUntilModalContainerDisappears();

        cy.getTestElement('rpGroup-0').find('[data-cy=rpHeader]').contains(startDateAfterEditing);
        cy.getTestElement('rpGroup-0').find('[data-cy=rpHeader]').contains(endDateAfterEditing);

        // --- RouteListView, remove routePath and make sure it was removed
        removeRoutePathIfExists(startDateAfterEditing, endDateAfterEditing);
        cy.getTestElement('rpGroup-0').find('[data-cy=rpHeader]').contains(startDateAfterEditing).should('not.exist');;
        cy.getTestElement('rpGroup-0').find('[data-cy=rpHeader]').contains(endDateAfterEditing).should('not.exist');;
    });
});

const removeRoutePathIfExists = (startDateString, endDateString) => {
    cy.getTestElement('rpGroup-0', {timeout:500}).then((body) => {
        if (body[0].innerText.includes(`${startDateString} - ${endDateString}`)) {
            cy.getTestElement('rpGroup-0').find('[data-cy=openRoutePathViewButton]').first().click();
            cy.getTestElement('editButton').click();
            cy.getTestElement('removeRoutePathButton').click();
            cy.getTestElement('confirmButton').click();
            cy.waitUntilModalContainerDisappears();
        }
    });
}