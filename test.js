import cypress from "cypress";
import { CKANIntegrationTests } from "cypress-tests";
import dotenv from "dotenv";

// Get any extra arguments passed when running node from the terminal
const args = process.argv.slice(2);

dotenv.config()

const assets = new CKANIntegrationTests();

// Calling assets.addSpec() allows the user to pass an optional 2nd argument
assets.addSpecs(assets.src, ['ckan-classic-api']);  //<-- specs from integration-tests repository

// Custom specs in /cypress/integration/ 
assets.addSpecs(".", [
  //  Add your specs here or leave it empty to
  //  add all specs
])

// Add a browser option if it was passed from the terminal
args[0] ? assets.options["browser"] = args[0] : undefined;

// Uncomment the next line and comment the line below it
// if you want to see the tests execution on the browser
// assets.options["headless"] = true;
assets.options["headed"] = true;

cypress
  .run(assets.options)
  .then(r => {
    console.log(r)
    assets.cleanUp()

    // if the cypress tests fail to run, log the error
    if (r.failures) {
      console.error('Could not execute cypress tests')
      console.error(r.message)
      process.exit(1)
    }
    // return exit code of 1 if any tests fail
    r.totalFailed ? process.exit(1) : process.exit(0)
  })
  .catch(e => {
    console.error(e.message)
    process.exit(1)
  });