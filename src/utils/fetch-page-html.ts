import { Element, Root } from "hast";
import { fromHtml } from "hast-util-from-html";
import { find } from "unist-util-find";
import { isElement } from "./markdown/unist-is-element";
import { LRUCache } from "lru-cache";

export async function fetchAsBrowser(input: string | URL, init?: RequestInit) {
	const response = await fetch(input, {
		...init,
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
			"Accept-Language": "en",
			...init?.headers,
		},
	});
	const isSuccess = `${response.status}`.startsWith("2");
	if (!isSuccess)
		throw new Error(`Request ${input} returned an error: ${response.status}`);
	return response;
}

const pageHtmlCache = new LRUCache<string, Promise<Root | null>>({
	max: 50,
});

export function fetchPageHtml(src: string): Promise<Root | null> {
	if (pageHtmlCache.has(src)) return pageHtmlCache.get(src)!;

	const promise = (async () => {
		const srcHTML = await fetchAsBrowser(src)
			.then(async (r) => await r.text())
			.catch(() => null);

		// if fetch fails...
		if (!srcHTML) return null;

		const srcHast = fromHtml(srcHTML);

		return srcHast;
	})();

	pageHtmlCache.set(src, promise);
	return promise;
}

export function getPageTitle(srcHast: Root) {
	// find <title> element in response HTML
	const titleEl = find<Element>(srcHast, { tagName: "title" });
	const titleContentEl = titleEl && titleEl.children[0];
	const title =
		titleContentEl?.type === "text" ? titleContentEl.value : undefined;

	return title;
}

export function getOpenGraphImage(srcHast: Root): string | undefined {
	const metaNames = ["twitter:image", "og:image"];
	const metaNode = find<Element>(
		srcHast,
		(e) =>
			isElement(e) &&
			e.tagName === "meta" &&
			metaNames.includes(e.properties.property + ""),
	);
	if (!metaNode) return undefined;

	return metaNode.properties.content + "";
}

export function escapeHtml(unsafe: string) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
