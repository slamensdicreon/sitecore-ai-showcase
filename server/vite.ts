import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  const adminRoot = path.resolve(import.meta.dirname, "..", "admin");
  let adminVite: any = null;
  if (fs.existsSync(adminRoot)) {
    try {
      const tailwindcss = (await import("tailwindcss")).default;
      const autoprefixer = (await import("autoprefixer")).default;
      const tailwindConfig = path.resolve(adminRoot, "tailwind.config.ts");

      adminVite = await createViteServer({
        configFile: false,
        root: adminRoot,
        base: "/oc-admin/",
        plugins: [(await import("@vitejs/plugin-react")).default()],
        css: {
          postcss: {
            plugins: [
              tailwindcss({ config: tailwindConfig }),
              autoprefixer(),
            ],
          },
        },
        server: {
          middlewareMode: true,
          hmr: { server, path: "/admin-hmr" },
          allowedHosts: true as any,
        },
        appType: "custom",
      });
    } catch (e) {
      console.log("[admin] Could not start admin dev server:", (e as Error).message);
    }
  }

  if (adminVite) {
    app.use("/oc-admin", adminVite.middlewares);
    app.use("/oc-admin", async (req, res, next) => {
      try {
        const adminTemplate = path.resolve(adminRoot, "index.html");
        let template = await fs.promises.readFile(adminTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );
        const page = await adminVite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        adminVite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
    app.use("/oc-admin/{*path}", async (req, res, next) => {
      try {
        const adminTemplate = path.resolve(adminRoot, "index.html");
        let template = await fs.promises.readFile(adminTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );
        const page = await adminVite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        adminVite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.use(vite.middlewares);

  app.use("/{*path}", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
