import { Element } from "hast";
import { find } from "unist-util-find";
import { LinkPreview } from "./link-preview";
import { toString } from "hast-util-to-string";
import { URL } from "url";
import {
	fetchAsBrowser,
	fetchPageHtml,
	getOpenGraphImage,
} from "utils/fetch-page-html";
import * as path from "path";
import * as fs from "fs";
import * as stream from "stream";
import * as crypto from "crypto";
import { getPicture, GetPictureResult } from "utils/get-picture";
import { Picture } from "../../picture/picture";
import { getImageSize } from "utils/get-image-size";
import {
	IMAGE_MAX_HEIGHT,
	IMAGE_MAX_WIDTH,
	IMAGE_SIZES,
} from "utils/markdown/constants";
import { RehypeFunctionComponent } from "../types";
import { isElement } from "utils/markdown/unist-is-element";
import { PAGE_HEIGHT, PAGE_WIDTH } from "build-scripts/social-previews/base";

function getImagePath(url: URL) {
	const hash = crypto.createHash("md5").update(url.toString()).digest("hex");
	return `generated/${url.hostname}-${hash}.linkpreview`;
}

async function createLinkElement(anchorNode: Element) {
	let url: URL;
	try {
		url = new URL(anchorNode.properties.href + "");
	} catch (e) {
		return;
	}

	let result: GetPictureResult | undefined;

	if (url.hostname === "playfulprogramming.com") {
		// If the url refers to another blog post, use its .twitter-preview image
		const path = /^\/posts\/([\w\-]+)/.exec(url.pathname);
		if (!path) return;

		const postSlug = path[1];
		if (!postSlug) return;

		result = {
			urls: {},
			image: {
				src: `https://playfulprogramming.com/generated/${postSlug}.twitter-preview.jpg`,
				width: PAGE_WIDTH,
				height: PAGE_HEIGHT,
			},
			sources: [],
		};
	} else {
		// Otherwise, try to parse an opengraph image from the link
		const html = await fetchPageHtml(url.toString());
		if (!html) return;
		let imageUrl: URL;
		try {
			imageUrl = new URL(getOpenGraphImage(html)!);
		} catch (e) {
			return;
		}

		const body = await fetchAsBrowser(imageUrl)
			.then((r) => r.body)
			.catch(() => null);
		if (!body) return;

		const imagePath = getImagePath(imageUrl);
		let imageExt = path.extname(imageUrl.pathname);

		const writeStream = fs.createWriteStream("public/" + imagePath + imageExt);
		await stream.promises.finished(
			stream.Readable.fromWeb(body as never).pipe(writeStream),
		);
		// src is an absolute path, so the second getImageSize arg is never used
		const dimensions = await getImageSize("/" + imagePath + imageExt, "");
		if (!dimensions) return;

		// If the image is missing an extension, replace it with the format from sharp metadata
		if (!imageExt) {
			imageExt = `.${dimensions.format}`;
			await fs.promises.rename(
				"public/" + imagePath,
				"public/" + imagePath + imageExt,
			);
		}

		const imageRatio = dimensions.width / dimensions.height;

		if (dimensions.height > IMAGE_MAX_HEIGHT) {
			dimensions.height = IMAGE_MAX_HEIGHT;
			dimensions.width = Math.floor(IMAGE_MAX_HEIGHT * imageRatio);
		}

		if (dimensions.width > IMAGE_MAX_WIDTH) {
			dimensions.width = IMAGE_MAX_WIDTH;
			dimensions.height = Math.floor(IMAGE_MAX_WIDTH / imageRatio);
		}

		result = getPicture({
			src: "/" + imagePath + imageExt,
			width: dimensions.width,
			height: dimensions.height,
			sizes: IMAGE_SIZES,
		});
	}

	if (!result) return;

	const picture = Picture({
		result,
		noZoom: true,
		imgAttrs: {},
	});

	return LinkPreview({
		type: "link",
		label: toString(anchorNode),
		children: [picture],
		anchorAttrs: anchorNode.properties,
	});
}

export const transformLinkPreview: RehypeFunctionComponent = ({ children }) => {
	const paragraphNode = children.filter(isElement).at(0);
	if (!paragraphNode) return;
	const anchorNode = find<Element>(paragraphNode, {
		type: "element",
		tagName: "a",
	});
	if (!anchorNode) return;

	return createLinkElement(anchorNode);
};
