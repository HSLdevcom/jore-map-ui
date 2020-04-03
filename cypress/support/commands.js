// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const _ = require('lodash');

Cypress.Commands.add('incrementInputValue', selector => {
    cy.getTestElement(selector)
        .invoke('val')
        .then(value => {
            let newInputValue;
            if (isNaN(value) || !value) {
                newInputValue = 1;
            } else {
                newInputValue = parseInt(value) + 1;
            }
            cy.getTestElement(selector)
                .clear()
                .type(newInputValue)
                .invoke('val');
        });
});

Cypress.Commands.add('getTestElement', (selector, options = {}) => {
    return cy.get(`[data-cy~="${selector}"]`, options);
});

Cypress.Commands.add('hslLoginReadAccess', () => {
    hslLogin(false);
    cy.getTestElement('authInfo').should('exist');
    cy.getTestElement('lineSearch').should('exist');
});

Cypress.Commands.add('hslLoginWriteAccess', () => {
    hslLogin(true);
    cy.getTestElement('authInfo').should('exist');
    cy.getTestElement('lineSearch').should('exist');
});

const hslLogin = hasWriteAccess => {
    const AUTH_URI = Cypress.env('AUTH_URI');
    const HSLID_CLIENT_ID = Cypress.env('CYPRESS_HSLID_CLIENT_ID');
    const HSLID_CLIENT_SECRET = Cypress.env('CYPRESS_HSLID_CLIENT_SECRET');
    const AUTH_SCOPE = Cypress.env('AUTH_SCOPE');

    let HSLID_USERNAME;
    let HSLID_PASSWORD;
    if (hasWriteAccess) {
        HSLID_USERNAME = Cypress.env('CYPRESS_HSLID_WRITE_ACCESS_USERNAME');
        HSLID_PASSWORD = Cypress.env('CYPRESS_HSLID_WRITE_ACCESS_PASSWORD');
    } else {
        HSLID_USERNAME = Cypress.env('CYPRESS_HSLID_READ_ACCESS_USERNAME');
        HSLID_PASSWORD = Cypress.env('CYPRESS_HSLID_READ_ACCESS_PASSWORD');
    }
    const authHeader = `Basic ${btoa(`${HSLID_CLIENT_ID}:${HSLID_CLIENT_SECRET}`)}`;

    const writeAccessText = hasWriteAccess ? 'with write access ' : 'without write access';
    Cypress.log({
        name: `HSL ID login ${writeAccessText}`
    });

    const options = {
        method: 'POST',
        url: AUTH_URI,
        headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: true, // we are submitting a regular form body
        body: {
            scope: AUTH_SCOPE,
            grant_type: 'password',
            username: HSLID_USERNAME,
            password: HSLID_PASSWORD
        }
    };

    cy.request(options).then(response => {
        const { access_token } = response.body;

        expect(response.status).to.eq(200);
        expect(access_token).to.be.ok;
        // testing = QueryParams.testing
        cy.visit(`/afterLogin?code=${access_token}&testing=true`);
        cy.wait(1000);
    });
};

Cypress.Commands.add('saveButtonShouldBeActive', selector => {
    if (selector) {
        cy.getTestElement(selector)
            .find('[data-cy=saveButton]')
            .should($el => {
                expect($el).not.have.css('pointer-events', 'none');
            });
    } else {
        cy.getTestElement('saveButton').should($el => {
            expect($el).not.have.css('pointer-events', 'none');
        });
    }
});

Cypress.Commands.add('saveButtonShouldNotBeActive', selector => {
    if (selector) {
        cy.getTestElement(selector)
            .find('[data-cy=saveButton]')
            .should($el => {
                expect($el).to.have.css('pointer-events', 'none');
            });
    } else {
        cy.getTestElement('saveButton').should($el => {
            expect($el).to.have.css('pointer-events', 'none');
        });
    }
});

Cypress.Commands.add('centerMapToHelsinki', selector => {
    cy.getTestElement('coordinateControlY')
        .clear()
        .type(60.1699);
    cy.getTestElement('coordinateControlX')
        .clear()
        .type(24.938);
});
