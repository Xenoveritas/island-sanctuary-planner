/// <reference lib="webworker" />

interface Message {
  type: string;
}

interface CatalogEntry {
  categories: string[];
  value: number;
  time: number;
}

interface CatalogMessage extends Message {
  type: "catalog";
  catalog: Record<string, CatalogEntry>;
}

// The optimizer worker. The optimizer simply goes through every single product
// and determines an order that produces the most value under 24 hours.

addEventListener('message', ({ data }) => {
  const response = `worker response to ${data}`;
  postMessage(response);
});
