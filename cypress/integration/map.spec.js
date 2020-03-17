describe('Map tests - read access user', () => {
    beforeEach(() => {
        cy.hslLoginReadAccess();
    });

    it('Can open a node from map', () => {
        cy.getTestElement('mapLayerControlIcon').trigger('mouseover');
        cy.getTestElement('mapLayerControlView').should('exist');
        cy.getTestElement('showNodes').click();
        cy.wait(2000);
        cy.getTestElement('mapView').click(590, 500); // NOTE: can change if data or map's initial position changes

        cy.getTestElement('selectNetworkEntityPopup').should('exist');
        cy.getTestElement('selectNetworkEntityPopup')
            .find('[data-cy=node]')
            .first()
            .click();

        cy.getTestElement('nodeView').should('exist');
    });

    it('Can open a link from map', () => {
        cy.getTestElement('mapLayerControlIcon').trigger('mouseover');
        cy.getTestElement('mapLayerControlView').should('exist');
        cy.getTestElement('showLinks').click();
        cy.wait(2000);
        cy.getTestElement('mapView').click(590, 500); // NOTE: can change if data or map's initial position changes

        cy.getTestElement('selectNetworkEntityPopup').should('exist');
        cy.getTestElement('selectNetworkEntityPopup')
            .find('[data-cy=link]')
            .first()
            .click();
        cy.getTestElement('linkView').should('exist');
    });
});
