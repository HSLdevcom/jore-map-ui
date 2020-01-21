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
    const CLIENT_ID = Cypress.env('CLIENT_ID');
    const CLIENT_SECRET = Cypress.env('CLIENT_SECRET');
    const AUTH_SCOPE = Cypress.env('AUTH_SCOPE');

    let HSL_TESTING_HSLID_USERNAME;
    let HSL_TESTING_HSLID_PASSWORD;
    if (hasWriteAccess) {
        // TODO: change username & password for user with write access
        HSL_TESTING_HSLID_USERNAME = Cypress.env('HSL_TESTING_HSLID_READ_ACCESS_USERNAME');
        HSL_TESTING_HSLID_PASSWORD = Cypress.env('HSL_TESTING_HSLID_READ_ACCESS_PASSWORD');
    } else {
        HSL_TESTING_HSLID_USERNAME = Cypress.env('HSL_TESTING_HSLID_READ_ACCESS_USERNAME');
        HSL_TESTING_HSLID_PASSWORD = Cypress.env('HSL_TESTING_HSLID_READ_ACCESS_PASSWORD');
    }
    const authHeader = `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`;

    Cypress.log({
        name: 'HSL ID login'
    });
    Cypress.log({ name: HSL_TESTING_HSLID_USERNAME });
    Cypress.log({
        name: HSL_TESTING_HSLID_PASSWORD
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
            username: HSL_TESTING_HSLID_USERNAME,
            password: HSL_TESTING_HSLID_PASSWORD
        }
    };

    cy.request(options).then(response => {
        const { access_token } = response.body;

        expect(response.status).to.eq(200);
        expect(access_token).to.be.ok;
        // testing = QueryParams.testing
        cy.visit(`/afterLogin?code=${access_token}&testing=true`);
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
