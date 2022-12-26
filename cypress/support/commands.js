import "cypress-axe";

const headers = { Authorization: Cypress.env('API_KEY') }
const apiUrl = (path) => {
  return `${Cypress.config().baseUrl}api/3/action/${path}`
}

Cypress.Commands.add('createGroupAPI', (name) => {
  //  TODO: this should be extracted to CKAN Integration Tests repo
  cy.request({
    method: 'POST',
    url: apiUrl('group_create'),
    headers: headers,
    body: {
      name
    },
  })
})

Cypress.Commands.add('deleteGroupAPI', (name) => {
  //  TODO: this should be extracted to CKAN Integration Tests repo
  cy.request({
    method: 'POST',
    url: apiUrl('group_delete'),
    headers: headers,
    body: {
      id: name
    },
  })
})

function printAccessibilityViolations(violations) {
  cy.task(
    "table",
    violations.map(({ id, impact, description, nodes }) => ({
      impact,
      description: `${description} (${id})`,
      nodes: nodes.map((el) => el.target).join(" / "),
    }))
  );
}

Cypress.Commands.add(
  "checkAccessibility",
  {
    prevSubject: "optional",
  },
  ({ skipFailures = false, context = null, options = null } = {}) => {

    //  By default, exclude CKAN debugger elements
    const defaultContext = {
      exclude: [
        [".flDebugTimerPanel"],
        [".flDebugTemplatePanel"],
        [".flDebugLoggingPanel"],
        [".flDebugRouteListPanel"],
        [".flDebugProfilerPanel"],
        [".flDebugSQLAlchemyPanel"],
      ],
    };

    if (!context) {
      context = defaultContext;
    } else {
      context = { ...defaultContext, ...context };
    }

    cy.checkA11y(
      context,
      options,
      printAccessibilityViolations,
      skipFailures
    );
  }
);
