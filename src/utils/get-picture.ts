import type { JSX } from "preact";
import type { ImageMetadata } from "astro";
import { siteUrl } from "../constants/site-config";

export interface GetPictureSizes {
	[size: number]: {
		maxWidth: number;
	};
}

export type GetPictureFormat = "avif" | "webp" | "png";

export type GetPictureUrls = Partial<
	Record<GetPictureFormat, { [width: number]: string }>
>;

export interface GetPictureOptions {
	src: string | ImageMetadata;
	width: number;
	height: number;
	sizes?: GetPictureSizes;
	formats?: GetPictureFormat[];
	loading?: "eager" | "lazy";
}

export interface GetPictureResult {
	urls: GetPictureUrls;
	image: JSX.HTMLAttributes<HTMLImageElement>;
	sources: JSX.HTMLAttributes<HTMLSourceElement>[];
}

export const SUPPORTED_IMAGE_SIZES = [
	24, 48, 72, 96, 160, 192, 480, 512, 896, 1080, 1200,
];

function getSupportedWidth(width: number) {
	// Find the closest supported image size for a given width
	return (
		SUPPORTED_IMAGE_SIZES.find((supportedWidth) => supportedWidth >= width) ??
		Math.max(...SUPPORTED_IMAGE_SIZES)
	);
}

const isDev = Boolean(import.meta.env?.DEV);

const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
if (!isDev && !cloudName)
	console.error("missing public variable CLOUDINARY_CLOUD_NAME");

function getSource(src: string, width: number, getFormat: string) {
	if (isDev) {
		// If the dev server is running, we can use the /_image endpoint
		return `/_image?${new URLSearchParams({
			href: src,
			w: String(width),
			q: "100",
		})}`;
	} else {
		// If in production use cloudinary's fetch
		const domainUrl = new URL(src, siteUrl);
		return `https://res.cloudinary.com/${cloudName}/image/fetch/w_${width},f_${getFormat},q_auto/${encodeURIComponent(domainUrl.toString())}`;
	}
}

export function getPictureUrls(options: GetPictureOptions): GetPictureUrls {
	const formats = options.formats ?? ["avif", "webp", "png"];
	const widths = options.sizes
		? Object.keys(options.sizes).map(Number).concat([options.width])
		: [options.width];

	const src =
		typeof options.src === "object" ? options.src.src : (options.src ?? 2000);

	const urls: GetPictureUrls = {};

	for (const format of formats) {
		const formatUrls = (urls[format] ||= {});

		for (const width of widths) {
			const supportedWidth = getSupportedWidth(width);
			formatUrls[supportedWidth] = getSource(src, supportedWidth, format);
		}
	}

	return urls;
}

export function getPictureAttrs(
	options: GetPictureOptions,
	urls: GetPictureUrls,
): GetPictureResult {
	const sizeMap = options.sizes || {};

	const widths = Object.keys(sizeMap)
		.map(Number)
		// any additional source widths must be smaller than the original image width
		.filter((w) => w < options.width)
		// breakpoints only need to be mapped for widths that *aren't* the max size
		.filter((w) => getSupportedWidth(w) != getSupportedWidth(options.width))
		.sort()
		.reverse();

	const maxWidth = Math.max(options.width, ...widths);

	const sizes = widths.length
		? widths
				.map(
					(w) =>
						`(max-width: ${sizeMap[w].maxWidth}) ${getSupportedWidth(w)}px`,
				)
				.join(", ") + `, ${getSupportedWidth(maxWidth)}px`
		: undefined;

	const sources = Object.entries(urls).map(([format, sizeUrls]) => ({
		type: `image/${format}`,
		sizes,
		srcset: Object.entries(sizeUrls)
			.map(([width, src]) => `${src} ${width}w`)
			.join(", "),
	}));

	return {
		urls,
		image: {
			width: Math.round(options.width),
			height: Math.round(options.height),
			decoding: "async",
			loading: options.loading ?? "lazy",
		},
		sources,
	};
}

export function getPicture(
	options: GetPictureOptions,
	urls: GetPictureUrls = getPictureUrls(options),
): GetPictureResult {
	return getPictureAttrs(options, urls);
}
