import { Client } from "typesense";

export const typesenseClient = new Client({
  apiKey: import.meta.env.VITE_HIDE_TYPESENSE_SEARCH_API_KEY!,
  nodes: [{ url: import.meta.env.VITE_HIDE_TYPESENSE_SERVER! }],
});
