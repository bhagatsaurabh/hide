import { PluginOption } from "vite";
import { createHash } from "crypto";
import { load } from "cheerio";
import { OutputAsset, OutputChunk } from "rollup";
import path from "path";
import { readFile, writeFile } from "fs/promises";

function SRI(): PluginOption {
  return {
    name: "vite-plugin-hide-sri",
    apply: "build",
    enforce: "post",

    async writeBundle(_, bundle) {
      const integrityMap = new Map<string, string>();

      for (const [fileName, asset] of Object.entries(bundle)) {
        if (fileName.endsWith(".js") || fileName.endsWith(".css")) {
          const source = (asset as OutputChunk).code || (asset as OutputAsset).source;
          const hash = createHash("sha512").update(source).digest("base64");
          integrityMap.set(fileName, `sha512-${hash}`);
        }
      }

      const indexPath = path.resolve("dist/index.html");
      const html = await readFile(indexPath, "utf8");

      const $ = load(html);
      $("script[src],link[rel=stylesheet][href]").each((_, el) => {
        const attr = el.attribs.src ? "src" : "href";
        const fileName = el.attribs[attr].replace(/^\//, "");
        const integrity = integrityMap.get(fileName);
        if (integrity) {
          el.attribs.integrity = integrity;
          el.attribs.crossorigin = "anonymous";
        }
      });

      await writeFile(indexPath, $.html());
    },
  };
}
export default SRI;
