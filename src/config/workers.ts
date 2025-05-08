import "monaco-editor";

self.MonacoEnvironment = {
  getWorker: async function (_workerId, label) {
    switch (label) {
      case "json":
        return new (await import("/monaco-editor/esm/vs/language/json/json.worker?worker")).default();
      case "css":
      case "scss":
      case "less":
        return new (await import("/monaco-editor/esm/vs/language/css/css.worker?worker")).default();
      case "html":
      case "handlebars":
      case "razor":
        return new (await import("/monaco-editor/esm/vs/language/html/html.worker?worker")).default();
      case "typescript":
      case "javascript":
        return new (await import("/monaco-editor/esm/vs/language/typescript/ts.worker?worker")).default();
      default:
        return new (await import("/monaco-editor/esm/vs/editor/editor.worker?worker")).default();
    }
  },
};
