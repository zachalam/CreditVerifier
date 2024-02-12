import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'nx run credit-verifier-frontend:serve',
        production: 'nx run credit-verifier-frontend:preview',
      },
      ciWebServerCommand: 'nx run credit-verifier-frontend:serve-static',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
