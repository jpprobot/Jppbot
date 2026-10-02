import { build } from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";

await mkdir("assets", { recursive: true });
await build({
  entryPoints: ["js/robot-scene.js"],
  outfile: "assets/robot-scene.js",
  bundle: true,
  minify: true,
  format: "esm",
  target: ["es2022"],
  external: ["../model-config.js"],
  legalComments: "eof",
  logLevel: "info",
});
await copyFile("node_modules/three/LICENSE", "assets/THREE-LICENSE.txt");
