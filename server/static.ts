import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const adminPath = path.resolve(__dirname, "admin");
  if (fs.existsSync(adminPath)) {
    app.use("/oc-admin", express.static(adminPath));
    app.use("/oc-admin/{*path}", (_req, res) => {
      res.sendFile(path.resolve(adminPath, "index.html"));
    });
  }

  app.use(express.static(distPath));

  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
