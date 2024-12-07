import { Root, Element } from "hast";
import { VFile } from "vfile";
import { Plugin } from "unified";

import { visit } from "unist-util-visit";

import { EMBED_MIN_HEIGHT, EMBED_SIZE } from "../constants";
import { find } from "unist-util-find";
import { getLargestManifestIcon } from "../../get-largest-manifest-icon";
import { IFramePlaceholder } from "./iframe-placeholder";
import * as path from "path";
import * as fs from "fs";
import * as stream from "stream";
import sharp from "sharp";
import * as svgo from "svgo";
import {
	fetchAsBrowser,
	fetchPageHtml,
	getPageTitle,
} from "utils/fetch-page-html";
import { LRUCache } from "lru-cache";

interface RehypeUnicornIFrameClickToRunProps {
	srcReplacements?: Array<(val: string, root: VFile) => string>;
}

// default icon, used if a frame's favicon cannot be resolved
const defaultPageIcon = "/icons/website.svg";

function getIconPath(src: URL) {
	return `generated/${src.hostname}.favicon`;
}

// Cache the fetch *promises* - so that only one request per manifest/icon is processed,
//   and multiple fetchPageInfo() calls can await the same icon
const pageIconCache = new LRUCache<string, Promise<string>>({
	max: 50,
});

function fetchPageIcon(src: URL, srcHast: Root): Promise<string> {
	if (pageIconCache.has(src.hostname)) return pageIconCache.get(src.hostname)!;

	const promise = (async () => {
		const iconPath = getIconPath(src);
		const iconDir = path.dirname("public/" + iconPath);
		await fs.promises.mkdir(iconDir, { recursive: true });

		const existingIconFiles = await fs.promises
			.readdir(iconDir)
			.catch(() => []);

		// If an icon has already been downloaded for the origin (in a previous build)
		const existingIconFile = existingIconFiles.find((file) =>
			file.startsWith(path.basename(iconPath)),
		);
		if (existingIconFile) {
			return iconDir.replace(/^public/, "") + "/" + existingIconFile;
		}

		// <link rel="manifest" href="/manifest.json">
		const manifestPath: Element | undefined = find(srcHast, {
			type: "element",
			tagName: "link",
			rel: "manifest",
		});

		let iconHref: string | undefined;

		if (manifestPath?.properties?.href) {
			// `/manifest.json`
			const manifestRelativeURL = String(manifestPath.properties.href);
			const fullManifestURL = new URL(manifestRelativeURL, src).href;

			const manifest = await fetchAsBrowser(fullManifestURL)
				.then((r) => r.json())
				.catch(() => null);

			if (manifest) {
				const largestIcon = getLargestManifestIcon(manifest);
				if (largestIcon?.icon)
					iconHref = new URL(largestIcon.icon.src, src.origin).href;
			}
		}

		if (!iconHref) {
			// fetch `favicon.ico`
			// <link rel="shortcut icon" type="image/png" href="https://example.com/img.png">
			for (const extension of [".svg", ".png", ".jpg", ".jpeg"]) {
				const favicon: Element | undefined = find(srcHast, (node) => {
					if (node.type !== "element" || (node as Element).tagName !== "link")
						return false;

					const rel = (node as Element).properties?.rel?.toString() ?? "";
					const href = (node as Element).properties?.href?.toString() ?? "";

					return rel.includes("icon") && path.extname(href) === extension;
				});

				if (favicon?.properties?.href) {
					iconHref = new URL(favicon.properties.href.toString(), src).href;
					break;
				}
			}
		}

		// no icon image URL is found
		if (!iconHref) return null;

		if (process.argv.includes("--verbose"))
			console.log(`[iframes] found iconHref for ${src.origin}:`, iconHref);

		// Fetch the provided image href
		const iconExt = path.extname(iconHref);

		// If it's an SVG, pipe directly to the output dir
		if (iconExt === ".svg") {
			const svg = await fetchAsBrowser(iconHref)
				.then((r) => r.text())
				.catch(() => null);

			if (!svg) return null;
			const optimizedSvg = svgo.optimize(svg, { multipass: true });
			await fs.promises.writeFile(
				"public/" + iconPath + iconExt,
				optimizedSvg.data,
			);
		}

		// If it's an image file, pass it through sharp to ensure 24px compression
		if ([".png", ".jpg", ".jpeg"].includes(iconExt)) {
			const dir = path.dirname("public/" + iconPath + iconExt);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
			const writeStream = fs.createWriteStream("public/" + iconPath + iconExt);
			const body = await fetchAsBrowser(iconHref)
				.then((r) => r.body)
				.catch(() => null);
			if (!body) return null;
			const transformer = sharp().resize(24, 24);
			await stream.promises.finished(
				stream.Readable.fromWeb(body as never)
					.pipe(transformer)
					.pipe(writeStream),
			);
		}

		return "/" + iconPath + iconExt;
	})()
		// if an error is thrown, or response is null, use the default page icon
		.catch((e) => {
			console.error("[rehypeIFrameClickToRun]", e);
			return null;
		})
		.then((p) => p || defaultPageIcon);

	pageIconCache.set(src.hostname, promise);
	return promise;
}

type PageInfo = {
	title?: string;
	iconFile: string;
};

export async function fetchPageInfo(src: string): Promise<PageInfo | null> {
	// fetch origin url, catch any connection timeout errors
	const url = new URL(src);
	url.search = ""; // remove any search params

	const srcHast = await fetchPageHtml(url.toString());
	if (!srcHast) return null;

	const title = getPageTitle(srcHast);

	if (process.argv.includes("--verbose"))
		console.log(`[iframes] found title for ${src}: "${title}"`);

	// find the page favicon (cache by page origin)
	const iconFile = await fetchPageIcon(url, srcHast);
	return { title, iconFile };
}

// TODO: Add switch/case and dedicated files ala "Components"
export const rehypeUnicornIFrameClickToRun: Plugin<
	[RehypeUnicornIFrameClickToRunProps | never],
	Root
> = ({ srcReplacements = [], ...props }) => {
	return async (tree, file) => {
		const iframeNodes: Element[] = [];
		visit(tree, "element", (node: Element) => {
			if (node.tagName === "iframe") {
				iframeNodes.push(node);
			}
		});

		await Promise.all(
			iframeNodes.map(async (iframeNode) => {
				let {
					height,
					width,
					src,
					// eslint-disable-next-line prefer-const
					dataFrameTitle,
					// eslint-disable-next-line prefer-const
					...propsToPreserve
				} = iframeNode.properties;

				for (const replacement of srcReplacements) {
					src = replacement(src!.toString(), file);
				}

				width = width ?? EMBED_SIZE.w;
				height = height ?? EMBED_SIZE.h;
				const info: PageInfo = (await fetchPageInfo(src!.toString()).catch(
					() => null,
				)) || { iconFile: defaultPageIcon };

				const [, heightPx] = /^([0-9]+)(px)?$/.exec(height + "") || [];
				if (Number(heightPx) < EMBED_MIN_HEIGHT) height = EMBED_MIN_HEIGHT;

				const iframeReplacement = IFramePlaceholder({
					width: width.toString(),
					height: height.toString(),
					src: String(src),
					pageTitle: String(dataFrameTitle ?? "") || info.title || "",
					pageIcon: info.iconFile,
					pageIconFallback: defaultPageIcon,
					propsToPreserve: JSON.stringify(propsToPreserve),
				});

				Object.assign(iframeNode, iframeReplacement);
			}),
		);
	};
};
