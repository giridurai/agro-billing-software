## CRM

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.10.

### Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

### Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

## Deploying to Vercel

This application is configured to deploy to Vercel with the login page as the default landing page.

### Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Git repository pushed to GitHub, GitLab, or Bitbucket

### Deployment Steps

1. **Install Vercel CLI (Optional)**

   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard (Recommended)**

   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your Git repository
   - Vercel will automatically detect the Angular project
   - Click "Deploy"
   - The `vercel.json` configuration will automatically:
     - Build using `npm run build`
     - Serve files from `dist/browser`
     - Redirect all routes to `/login` by default
     - Handle SPA routing properly

3. **Deploy via CLI**
   ```bash
   vercel
   ```
   Follow the prompts to complete the deployment.

### Configuration Files

- `vercel.json` - Vercel deployment configuration
- `.vercelignore` - Files to ignore during deployment

### Default Route

The application is configured to redirect to the login page (`/login`) by default when accessing the root URL.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
