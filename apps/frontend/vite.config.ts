import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { promises as fs } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "local-json-api",
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url?.split("?")[0];
          const filePath = path.resolve(__dirname, "src/data/contacts.json");

          // Lokale JSON API
          if (req.method === "GET" && url === "/api/contacts") {
            const raw = await fs.readFile(filePath, "utf-8").catch(() => "[]");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(raw);
            return;
          }

          if (req.method === "POST" && url === "/api/contacts") {
            let body = "";
            for await (const chunk of req) body += chunk;
            const newEntry = JSON.parse(body);

            const raw = await fs.readFile(filePath, "utf-8").catch(() => "[]");
            const contacts = JSON.parse(raw);
            contacts.push(newEntry);
            await fs.writeFile(
              filePath,
              JSON.stringify(contacts, null, 2),
              "utf-8"
            );

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
            return;
          }

          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": "/src",
      "@asset": "/src/assets",
      "@config": "/src/configs",
      "@component": "/src/components",
      "@page": "/src/pages",
      "@utils": "/src/utils",
      "@interface": "/src/interfaces",
      "@type": "/src/types",
      "@service": "/src/services",
    },
  },
});
