# CKAN Cypress Axe
Automated accessibility testing for CKAN portals with [Cypress](https://github.com/cypress-io/cypress), [Cypress Axe](https://github.com/component-driven/cypress-axe) and [Axe Core](https://github.com/dequelabs/axe-core).

This repo extends the [CKAN Integrated Tests](https://github.com/datopian/ckan-integration-tests) package adding accessibility coverage to it.

#### Features
- Implement accessibility tests on a pre-existing CKAN Cypress project
    - This repo provides a wrapper for Cypress Axe, enabling developers to easily run accessibility check ups on preexisting test cases at any point of execution (e.g before and after a form is fulfiled)
    - Extend the [CKAN Integrated Tests](https://github.com/datopian/ckan-integration-tests) package with a ready to use basic routes on load accessibility test and customize it
- Bootstrap your accessibility tests by forking this repo and customizing it
- Clone this repo and run remote accessibility tests against any CKAN instance

## Requirements
- Node 14
- Cypress 5

## Usage
There are multiple ways of using this repo. Choose the path you want to follow according to your needs.
### Implement accessibility tests on a preexisting CKAN Cypress project
Choose this path if you already have a Cypress project for your CKAN instance.
1. Ensure your project has the [CKAN Integration Tests](https://github.com/datopian/ckan-integration-tests) package set up. You can find the setup instructions on the repo.
2. Install the package with:
```
npm install https://github.com/datopian/ckan-cypress-axe
```
3. Add the following lines to your `test.js` file:
```
// At the top of the file 
import { CKANAccessibilityTests } from 'ckan-cypress-axe';


...


/* 
    After instanciating CKANIntegrationTests
    e.g:  
    const assets = new CKANIntegrationTests();
*/
const accessibilityTests = new CKANAccessibilityTests(assets);

// Add Cypress commands needed for accessibility testing
accessibilityTests.registerCommands();

// (optional) Add the basic routes on load test spec
accessibilityTests.registerOnLoadTest();
```

4. Run the tests with `node test`
  
    
  
#### `registerCommands()`
`registerCommands()` is going to set up the following Cypress commands on your project:
- `cy.injectAxe()` - This command injects Axe Core in the page you want to test. Add it after `cy.visit()`, before doing check ups with the next command.
- `cy.checkAccessibility(options)` - This command is going to test the accessibility of the current state of the visited page and output the accessibility issues.

Note that `cy.checkAccessibility(options)` accepts a `options` parameter with the following attributes:
- `skipFailures` - Boolean. Determines whether the accessibility errors should make the test case fail or not. When set to `true` accessibility errors will be printed on the logs but won't interrupt the execution of the tests nor count the test case as a failure. Defaults to `false`.
- `context`- Object. Axe Core `run` `context` parameter. Determines the scope of the accessibility tests e.g exclude certain DOM elements from the tests. You can check all the accepted attributes [here](https://www.deque.com/axe/core-documentation/api-documentation/#context-parameter). Defaults to excluding the CKAN debugger elements from the accessibility check ups:
```
{
    exclude: [
        [".flDebugTimerPanel"],
        [".flDebugTemplatePanel"],
        [".flDebugLoggingPanel"],
        [".flDebugRouteListPanel"],
        [".flDebugProfilerPanel"],
        [".flDebugSQLAlchemyPanel"],
    ],
};
```
- `options` - Object. Axe Core `run` `options` parameter. Specifies how Axe Core will work, including the rules that are going to be used. Defaults to `null`.

**Example**: test if the about page is compliant with Section 508:
```
cy.visit('/about');

cy.injectAxe();

cy.checkAccessibility({
    skipFailures: false,
    options: {
        runOnly: {
          type: 'tag',
          //  https://www.access-board.gov/ict/#E205.4
          values: [
              'section508', 
              'section508.*.*', 
              'wcag2aa', 
              'wcag2a', 
              'wcag***'
          ]
        }
    }
})
```

#### Set global options for `checkAccessibility(options)`
You can also set options globally on `cypress/support/commands.js` by adding an overwrite for the `checkAccessibility` command. E.g:
```
Cypress.Commands.overwrite('checkAccessibility', (orig, params) => {
  params = {
    options: {
      runOnly: {
        type: "tag",
        // Use only color related rules
        values: ["cat.color"]
      }
    }
  }

  return orig(params);
})
```

#### `registerOnLoadTest()`
This function is going to add a basic on load test for common CKAN routes. The default covered routes are:
```
[
    "/",
    "/about",
    "/ckan-admin",
    "/ckan-admin/config",
    "/ckan-admin/trash",
    "/dashboard",
    "/dashboard/datasets",
    "/dashboard/groups",
    "/dashboard/organizations",
    "/dataset",
    "/dataset/<id>",
    "/dataset/<id>/dictionary/<resource_id>",
    "/dataset/<id>/resource/<resource_id>/views",
    "/dataset/<id>/resource_data/<resource_id>",
    "/dataset/<id>/resource_edit/<resource_id>",
    "/dataset/activity/<id>",
    "/dataset/edit/<id>",
    "/dataset/groups/<id>",
    "/dataset/new",
    "/dataset/new_resource/<id>",
    "/dataset/resources/<id>",
    "/group",
    "/group/<id>",
    "/group/about/<id>",
    "/group/activity/<id>/0",
    "/group/new",
    "/organization",
    "/organization/<id>",
    "/organization/about/<id>",
    "/organization/activity/<id>/0",
    "/organization/bulk_process/<id>",
    "/organization/edit/<id>",
    "/organization/member_new/<id>",
    "/organization/members/<id>",
    "/organization/new",
    "/user/<id>",
    "/user/activity/<id>",
    "/user/edit/<id>",
    "/user/login",
    "/user/register"
]
```
  
If your CKAN instance contains extensions and customizations and/or has non-default routes it's recommended to write your own routes on load test.
  
You can do that based on [this test spec](https://github.com/datopian/ckan-cypress-axe/blob/main/cypress/integration/routes-onload.js).


#### How to map the routes on your CKAN instance
There are multiple ways of mapping the routes of your instance to use it on your routes on load test spec. 

The most simple way would be starting from the [basic routes.json file](https://github.com/datopian/ckan-cypress-axe/blob/main/routes.json) and adding the new routes manually.
  
However, if your instance has many custom routes, consider adding and running the following command:
```
import logging
import click

@click.command()
@click.pass_context
def list_pages(ctx):
    app = ctx.meta['flask_app']

    banned_pieces = [
        "/api/",
        "/action/",
        ".json",
        "/zh_TW",
        "<path:path>",
        "/zh_CN/",
        "/<path:filename>",
        "<path:filename>",
        "/_debug_toolbar",
        "<filename>"
    ]

    with app.app_context():
        paths = []
        for rule in app.url_map.iter_rules():
            if "GET" in rule.methods and not any(x in str(rule) for x in banned_pieces):
                paths.append(str(rule))

        paths = list(set(paths))
        for path in paths:
            click.secho(path, fg="cyan")
```
This is going to print all the `GET` routes in your instance that do not contain any of the entries in the `banned_pieces` array. It's recommended to do a manual review of the listed routes after running the command, for there may be routes that do not necessarily have to be tested.


**_TODO:_** create an extension with this command to make this step easier.

Note that if there are new dynamic routes on your application you might need to write Cypress commands to create/delete these entities in order to use it as parameters in the dynamic routes.

### Bootstrap your accessibility tests by forking/cloning this repo and customizing it or run remote accessibility tests against any CKAN instance
Follow this path if you plan on using a separate repo for your accessibility tests, if you want to quick start a new CKAN Cypress project with accessibility support or if you want to do remote accessibility tests against any CKAN instance.
1. Fork and/or clone this repo
2. Set the environment variables ([guide](https://github.com/datopian/ckan-integration-tests#usage)). Note that you can set the `CYPRESS_BASE_URL` variable to any address you want.
3. Run the tests with `node test`
4. (optional) Customize your accessibility tests according to the previous sections of this README.


## Example output
```
┌─────────┬───────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────┐
│ (index) │  impact   │                                                             description                                                              │                                           nodes                                           │
├─────────┼───────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│    0    │ 'serious' │ 'Ensures the contrast between foreground and background colors meets WCAG 2 AAA contrast ratio thresholds (color-contrast-enhanced)' │ 'li:nth-child(1) > a[href$="dashboard"] / a[href$="datasets"] / a[href$="organizations"]' │
└─────────┴───────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────┘
    7) /dashboard/groups
```
Based on this input, there are three elements with color contrast issues on `/dashboard/groups`. You can find these elements by pasting the selector displayed on the last column on the devtools search.

## FAQ
**1. Why do I need an on load test?**
An on load test consists on visiting the routes of the portal and executing an accessibility check up just after the visit, hence, without any other interaction with the page. We recommend the creation of a centralized on load test with all the routes in the portal because this is going to be easier to implement, simpler to run and is going to cover most of the elements of the portal. After that, you can start tracking page interactions along other tests (see next question) and executing accessibility check ups that are dependant on the state of the page, which are going to be fewer.
  
**2. Where should I add accessibility check ups on my other tests?**
On load tests are going to test only the initial state of the page, therefore, you should add accessibility check ups after page interactions that cause changes to the UI. Some examples are:
- When a modal pop up is triggered
- When a form is fulfilled
- When an error message appears
  
**3. Are automated tests enough to ensure 100% accessibility compliance?** 
No. Automated tests are going to flag UI accessibility issues, but you still have to be aware and review UX aspects related to, for example, keyboard interactions and screen readers.
  
**4. What should I do if the CKAN Integration Tests commands do not work on my instance?**
You can overwrite the commands in your `support/commands.js` file. As an example, the default `createResourceAPI` command uses `datastore` to create a new resource, if you don't use `datastore` you can overwrite this command.
  

