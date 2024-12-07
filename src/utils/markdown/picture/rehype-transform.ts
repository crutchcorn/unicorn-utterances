import { Root, Element } from "hast";
import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import path from "path";

/**
 * They need to be the same `getImage` with the same `globalThis` instance, thanks to the "hack" workaround.
 */
import { getPicture } from "utils/get-picture";
import { getImageSize } from "../../get-image-size";
import { resolvePath } from "../../url-paths";
import { Picture } from "./picture";
import { logError } from "../logger";
import { IMAGE_MAX_HEIGHT, IMAGE_MAX_WIDTH, IMAGE_SIZES } from "../constants";

/**
 * parse a height/width attribute value (e.g. "20px" or "20") and
 * return the value in pixel units, or undefined if it cannot be
 * parsed.
 */
function getPixelValue(attr: unknown): number | undefined {
	const [, pxValue] = /^([0-9]+)(px)?$/.exec(attr + "") || [];
	return typeof pxValue !== "undefined" ? Number(pxValue) : undefined;
}

export const rehypeAstroImageMd: Plugin<[], Root> = () => {
	return async (tree, file) => {
		const imgNodes: Element[] = [];
		visit(tree, "element", (node: Element) => {
			if (node.tagName === "img") {
				imgNodes.push(node);
			}
		});

		await Promise.all(
			imgNodes.map(async (node): Promise<void> => {
				const nodeSrc = node.properties.src as string;

				let src: string;

				const resolvedSrc = resolvePath(nodeSrc, path.dirname(file.path));
				if (resolvedSrc) {
					src = resolvedSrc.relativeServerPath;
				} else {
					// If the image links to an external URL, do nothing
					node.properties.src = nodeSrc;
					logError(
						file,
						node,
						"Avoid using external images, as they cannot be optimized.",
					);
					return;
				}

				// If the image is an unsupported format, do nothing
				if (
					![".png", ".jpg", ".jpeg"].includes(
						path.extname(nodeSrc).toLowerCase(),
					)
				) {
					node.properties.src = src;
					return;
				}

				const srcSize = (await getImageSize(
					nodeSrc,
					path.dirname(file.path),
				)) || {
					height: undefined,
					width: undefined,
				};

				if (!srcSize.height || !srcSize.width) return;

				const imageRatio = srcSize.width / srcSize.height;

				const nodeWidth = getPixelValue(node.properties.width);
				const nodeHeight = getPixelValue(node.properties.height);

				const dimensions = { ...srcSize } as { width: number; height: number };
				if (nodeHeight) {
					dimensions.height = nodeHeight;
					dimensions.width = Math.floor(nodeHeight * imageRatio);
				} else if (nodeWidth) {
					dimensions.width = nodeWidth;
					dimensions.height = Math.floor(nodeWidth / imageRatio);
				}

				if (dimensions.height > IMAGE_MAX_HEIGHT) {
					dimensions.height = IMAGE_MAX_HEIGHT;
					dimensions.width = Math.floor(IMAGE_MAX_HEIGHT * imageRatio);
				}

				if (dimensions.width > IMAGE_MAX_WIDTH) {
					dimensions.width = IMAGE_MAX_WIDTH;
					dimensions.height = Math.floor(IMAGE_MAX_WIDTH / imageRatio);
				}

				const pictureResult = getPicture({
					src: src,
					width: dimensions.width,
					height: dimensions.height,
					sizes: IMAGE_SIZES,
					formats: ["avif", "webp", "png"],
				});

				const {
					height: _height,
					width: _width,
					src: _src,
					alt: _alt,
					["data-zoom-src"]: _dataZoomSrc,
					...rest
				} = node.properties;

				Object.assign(
					node,
					Picture({
						result: pictureResult,
						alt: node.properties.alt?.toString(),
						zoomSrc: resolvedSrc.relativeServerPath,
						imgAttrs: rest,
					}),
				);
			}),
		);
	};
};
