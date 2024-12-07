import { mobile, tabletSmall } from "src/tokens/breakpoints";
import { GetPictureSizes } from "utils/get-picture";

// default sizing used for iframes (MarkdownRenderer/media.tsx)
export const EMBED_SIZE = { w: "100%", h: 500 };

export const EMBED_MIN_HEIGHT = 300;

export const IMAGE_MAX_WIDTH = 896;
export const IMAGE_MAX_HEIGHT = 768;

export const IMAGE_SIZES: GetPictureSizes = {
	356: { maxWidth: mobile },
	596: { maxWidth: tabletSmall },
};

export interface MarkdownConfig {
	format: "html" | "epub";
	// fs path for any static files (used primarily for epub / rehype-absolute-paths)
	path?: string;
}
