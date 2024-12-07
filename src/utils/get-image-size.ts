import { resolvePath } from "./url-paths";
import sharp from "sharp";
import { readFile } from "fs/promises";

export async function getImageSize(src: string, relativeDir: string) {
	const path = resolvePath(src, relativeDir);
	if (!path) return undefined;

	const buffer = await readFile(path.absoluteFSPath);
	const metadata = await sharp(buffer).metadata();
	const width = Number(metadata.width);
	const height = Number(metadata.height);
	const format = metadata.format;
	if (!isFinite(width) || !isFinite(height) || !format) return undefined;

	return { width, height, format };
}
