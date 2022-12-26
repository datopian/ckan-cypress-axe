import "cypress-axe";

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
