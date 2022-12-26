import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

class CKANAccessibilityTests {
  commandsRegistered = false;

  constructor(integratedTestsInstance) {
    this.src = path.dirname(fileURLToPath(import.meta.url));

    this.registerCommands = () => {
      if (!this.commandsRegistered) {
        const supportFilePath =
          integratedTestsInstance.options.config.supportFile;
        const importStatement = `import '${this.src}/cypress/support/commands.js';\n`;

        let content = fs.readFileSync(supportFilePath);
        content = importStatement + content;

        fs.writeFileSync(supportFilePath, content);

        this.commandsRegistered = true;
      }
    };

    this.registerOnLoadTest = () => {
      if (!this.commandsRegistered) {
        this.registerCommands();
      }

      integratedTestsInstance.addSpecs(this.src, ["routes-onload.js"]);
    };
  }
}

function singleton() {
  if(!singleton.instance) {
    singleton.instance = this;
  }

  this.getPages = () => {
    return ["/", "/about"]
  }

  return singleton.instance;
}


export { CKANAccessibilityTests, singleton };
