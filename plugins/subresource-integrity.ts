import { PluginOption } from "vite";
import { createHash } from "crypto";
import { Cheerio, load } from "cheerio";
import { Element } from "domhandler";
import { OutputAsset, OutputChunk } from "rollup";

declare interface CheerioE extends Cheerio<Element> {
  asyncForEach: (cb: (el: Element) => Promise<void>) => Promise<void>;
}

function SRI(): PluginOption {
  return {
    name: "vite-plugin-hide-sri",
    enforce: "post",
    apply: "build",

    async transformIndexHtml(html, context) {
      const bundle = context.bundle;

      const calculateIntegrityHashes = async (element: Element) => {
        if (element.attribs?.src?.includes("libphonenumber")) return;

        let source;
        const attributeName = element.attribs.src ? "src" : "href";
        const resourcePath = element.attribs[attributeName];
        if (resourcePath.startsWith("http")) {
          source = await (await fetch(resourcePath)).text();
        } else {
          const resourcePathWithoutLeadingSlash = element.attribs[attributeName].slice(1);
          if (resourcePathWithoutLeadingSlash === "registerSW.js") return;

          const bundleItem = bundle![resourcePathWithoutLeadingSlash];
          source = (bundleItem as OutputChunk).code || (bundleItem as OutputAsset).source;
        }
        element.attribs.integrity = `sha512-${createHash("sha512").update(source).digest().toString("base64")}`;
      };

      const $ = load(html);
      $.prototype.asyncForEach = async function (
        callback: (el: Element, idx: number, inst: Cheerio<Element>) => Promise<void>
      ) {
        for (let idx = 0; idx < this.length; idx += 1) {
          await callback(this[idx], idx, this);
        }
      };

      const scripts = $("script").filter("[src]");
      const stylesheets = $("link[rel=stylesheet]").filter("[href]");

      await (scripts as CheerioE).asyncForEach(calculateIntegrityHashes);
      await (stylesheets as CheerioE).asyncForEach(calculateIntegrityHashes);

      return $.html();
    },
  };
}
export default SRI;
