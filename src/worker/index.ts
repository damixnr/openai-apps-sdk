import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { env } from "cloudflare:workers";

import { routesManifest } from "./routesManifest.generated";

const DEFAULT_RESOURCE_META = {
  "openai/widgetCSP": {
    connect_domains: [] as string[],
    resource_domains: [] as string[],
  },
  "openai/widgetDomain": env.WIDGET_DOMAIN as string | undefined,
};

if (env.WORKER_DOMAIN_BASE) {
  DEFAULT_RESOURCE_META["openai/widgetCSP"].resource_domains.push(
    env.WORKER_DOMAIN_BASE
  );
} else {
  console.error(
    "env.WORKER_DOMAIN_BASE is not defined. For this template to work, you must provide WORKER_DOMAIN_BASE"
  );
}

if (!env.WIDGET_DOMAIN) {
  delete DEFAULT_RESOURCE_META["openai/widgetDomain"];
}

export class TemplateMCPServer extends McpAgent<Env> {
  server = new McpServer({ name: "TemplateMCP", version: "v1.0.0" });

  async init() {
    // Loop over our manifest, generate resources.
    for (const [, routeInfo] of Object.entries(routesManifest)) {
      // Construct the resource URI with the unique content hash
      const resourceUri = `ui://widget/${routeInfo.resourceURI}`;

      this.server.registerResource(
        routeInfo.resourceName,
        `ui://widget/${routeInfo.resourceURI}`,
        {},
        async () => {
          const response = await this.env.ASSETS.fetch(
            new Request(`http://localhost${routeInfo.originalUrlPath}`)
          );
          const html = await response.text();

          return {
            contents: [
              {
                uri: resourceUri,
                mimeType: "text/html+skybridge",
                text: html,
                _meta: DEFAULT_RESOURCE_META,
              },
            ],
          };
        }
      );
    }

    this.server.registerTool(
      "hello-world",
      {
        title: "Hello World",
        _meta: {
          "openai/outputTemplate": `ui://widget/${routesManifest["hello-world"].resourceURI}`,
          "openai/toolInvocation/invoking": "Saying hello back",
          "openai/toolInvocation/invoked": "I said hello!",
          "openai/widgetAccessible": true,
        },
      },
      async () => {
        return {
          content: [{ type: "text" as const, text: "Hello World" }],
        };
      }
    );

    this.server.registerTool(
      "who-made-you",
      {
        title: "Who made you?",
        _meta: {
          "openai/outputTemplate": `ui://widget/${routesManifest["who-made-you"].resourceURI}`,
          "openai/toolInvocation/invoking": "Knock knock...",
          "openai/toolInvocation/invoked": "Who is it?",
          "openai/widgetAccessible": true,
        },
      },
      async () => {
        return {
          structuredContent: {
            description:
              "This is a template for building OpenAI Chat Apps from Gavin Ching",
            authorsXSocialLink: "https://x.com/gching",
          },
          content: [
            {
              type: "text" as const,
              text: "This is a template for building OpenAI Chat Apps from Gavin Ching",
            },
          ],
        };
      }
    );
  }
}

export default TemplateMCPServer.serve("/mcp");
