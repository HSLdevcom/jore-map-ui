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

Cypress.Commands.add('getTestElement', (selector, options = {}) => {
    return cy.get(`[data-cy~="${selector}"]`, options);
});

Cypress.Commands.add('hslLoginReadAccess', () => {
    return hslLogin(false);
});

Cypress.Commands.add('hslLoginWriteAccess', () => {
    return hslLogin(true);
});

const hslLogin = hasWriteAccess => {
    const AUTH_URI = Cypress.env('AUTH_URI');
    const HSLID_CLIENT_ID = Cypress.env('CLIENT_ID');
    const HSLID_CLIENT_SECRET = Cypress.env('CLIENT_SECRET');
    const AUTH_SCOPE = Cypress.env('AUTH_SCOPE');

    let HSLID_CYPRESS_USERNAME;
    let HSLID_CYPRESS_PASSWORD;
    if (hasWriteAccess) {
        HSLID_CYPRESS_USERNAME = Cypress.env('HSLID_CYPRESS_WRITE_ACCESS_USERNAME');
        HSLID_CYPRESS_PASSWORD = Cypress.env('HSLID_CYPRESS_WRITE_ACCESS_PASSWORD');
    } else {
        HSLID_CYPRESS_USERNAME = Cypress.env('HSLID_CYPRESS_READ_ACCESS_USERNAME');
        HSLID_CYPRESS_PASSWORD = Cypress.env('HSLID_CYPRESS_READ_ACCESS_PASSWORD');
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
            username: HSLID_CYPRESS_USERNAME,
            password: HSLID_CYPRESS_PASSWORD
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

Cypress.Commands.add('waitUntilLoadingFinishes', loadingElementSelector => {
    const testId = loadingElementSelector || 'loader';
    cy.waitUntil(() => cy.getTestElement(testId).should('exist'));
    return cy.waitUntil(
        () => cy.getTestElement(testId, { timeout: 60 * 60 * 1000 }).should('have.length', 0),
        {
            timeout: 60 * 60 * 1000
        }
    );
});
