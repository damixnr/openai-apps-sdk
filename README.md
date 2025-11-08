# Open AI Apps Template with Cloudflare Workers
<img width="1400" height="1324" alt="template" src="https://github.com/user-attachments/assets/28f692f3-a994-4461-8879-6d7399ca358e" />

This project is a template for building OpenAI apps using Vite, React, TypeScript, and Cloudflare Workers.

Instead of a traditional Single-Page App (SPA), this architecture builds each resource as its own independent, minimal page (e.g., `map.html`, `carousel.html`).

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Toolbase-AI/openai-apps-sdk-cloudflare-vite-template)

> If you click on Deploy to Cloudflare, your build will fail initially but still have a Worker domain associated to it. Copy over this domain to your Build settings and set it in your Build Variables as WORKER_DOMAIN_BASE in addition to setting it in ur Worker Environment variables

## Try it out

An example of this template is deployed at `https://openai-template.gavinching.workers.dev/mcp`

You can add it to ChatGPT and call `hello world`

## Examples

* [Pizzaz Example](./examples//pizzaz/)


## Project Architecture Overview

The entire process is automated by a custom Vite plugin (`src/plugins/routesManifest.ts`):

### 1. Automatic Route Resource Discovery
- Finds all `*.html` files within the `src/app/routes/` directory and treats them as resources.

### 2. Dynamic Build Manifest
- Manifest assists in generating a typed resource object for you to create resources + tools in your MCP

### 3. Content Hashing for Resources
- For each resource, the plugin calculates a hash of the final HTML file's content. This hash is included in the `resourceURI` within the manifest and ensures your resources are cache-busted.

### 4. Dynamic Worker
- The Cloudflare Worker (`src/worker/index.ts`) imports the generated manifest and is able to register all resources automatically.


#### Improvements

I quickly just hacked this out to make my life easier to create OpenAI Apps, but theirs definitely more exploration needed for frameworks such as React Router/Remix. The DX would probably be much better than this quickly hacked out plugin.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- [pnpm](https://pnpm.io/installation)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory and install dependencies:
   ```bash
   cd vite-react-template
   pnpm install
   ```

### Configuration
1. Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and set the required environment variables. These are used by the Cloudflare worker to correctly identify your domains.
   - `WORKER_DOMAIN_BASE`: The domain where the worker and assets will be served (e.g., `https://my-app.example.workers.dev`).
   - `WIDGET_DOMAIN`: The widget domain to provide to OpenAI for the sandbox (e.g., `https://gettoolbase.ai`).

## Development

To start the local development server, run:
```bash
pnpm dev
```
Your application will be available at `http://localhost:5173`. The custom Vite plugin will automatically handle routing, so you can access your pages using clean URLs (e.g., `http://localhost:5173/hello-world`).

In production, this redirect will not occur. This is mainly for you to locally view your resources before deploying.

## How to Add a New Resource

**1. Create the Component:**
Create your new React component in `src/app/components/`, for example, `src/app/components/MyNewResource.tsx`. At the end of this file, add the React `createRoot` logic to make it a self-rendering application.

*Example (`MyNewResource.tsx`):*
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css'; // Import shared styles

export function MyNewResource() {
  return (
    <div>
      <h1>My New Tool</h1>
    </div>
  );
}

// Mount the component to the DOM
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <MyNewResource />
    </StrictMode>
  );
}
```

**2. Create the HTML Entry Point:**
Create a new HTML file in `src/app/routes/`, for example, `src/app/routes/my-new-resource.html`. This file just needs a root element and a script tag.

*Example (`my-new-resource.html`):*
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My New Tool</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="../components/MyNewResource.tsx"></script>
  </body>
</html>
```

**3. Update Worker Metadata:**
Add an entry for `"my-new-resource"` to the `registerTool` calls in `src/worker/index.ts` to define its title and other MCP-specific information. The `routesManifest` will automatically provide the correct UI resource URI.

*Example (`src/worker/index.ts`):*
```ts
// ... inside the init() method of TemplateMCPServer

this.server.registerTool(
  "mynewtool", // Must match the HTML filename (without .html)
  {
    title: "My New Tool",
    _meta: {
      "openai/outputTemplate": `ui://widget/${routesManifest["my-new-resource"].resourceURI}`,
      "openai/toolInvocation/invoking": "Running my new tool...",
      "openai/toolInvocation/invoked": "Ran my new tool!",
      "openai/widgetAccessible": true,
    },
  },
  async () => {
    // Your tool logic here
    return {
      content: [{ type: "text" as const, text: "This is my new tool." }],
    };
  }
);
```
The development server will automatically detect the new route.

## Available Scripts

- `pnpm dev`: Starts the Vite development server.
- `pnpm build`: Builds the application for production.
- `pnpm deploy`: Deploys the application to Cloudflare Workers.
- `pnpm build-deploy`: Builds and deploys the application to Cloudflare Workers.
- `pnpm preview`: Builds the app and serves it locally to preview the production build.
- `pnpm lint`: Runs ESLint to check for code quality issues.
- `pnpm typecheck`: Runs the TypeScript compiler to check for type errors.

## Deployment

To build +deploy your application to Cloudflare Workers, run:
```bash
pnpm build-deploy
```
This command first builds your project using `vite build` and then deploys the contents of the `dist` folder using `wrangler deploy`.

After deploying, your Connector MCP link will live at `${DOMAIN_NAME}/mcp`.

You may add this to ChatGPT to test it it.

## 🔗 Links

- [OpenAI Apps SDK Docs](https://developers.openai.com/apps-sdk/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [MCP Specification](https://modelcontextprotocol.io)

## License

MIT

See [LICENSE](./LICENSE) for details.

