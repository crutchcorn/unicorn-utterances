import { toString } from "hast-util-to-string";
import { toHtml } from "hast-util-to-html";
import { Element } from "hast";
import { RehypeFunctionComponent } from "../types";
import { logError } from "utils/markdown/logger";
import { SnitipLink, SnitipMetadata } from "types/SnitipInfo";
import { getPictureUrls } from "utils/get-picture";
import { MarkdownVFile } from "utils/markdown/types";

const isNodeElement = (node: unknown): node is Element =>
	(typeof node === "object" &&
		node &&
		"type" in node &&
		node["type"] === "element") ??
	false;

export const transformSnitip: RehypeFunctionComponent = ({
	vfile,
	node,
	children,
	attributes,
}) => {
	const snitipId = attributes["id"];
	const snitipHref = attributes["href"];
	if (!snitipId) {
		logError(vfile, node, "Snitip must have an id!");
		return;
	}

	const headingIndex = children.findIndex(
		(node) => isNodeElement(node) && /^h[0-9]$/.test(node.tagName),
	);

	if (headingIndex < 0) {
		logError(vfile, node, "Snitip must start with a heading!");
		return;
	}

	const imageEl = (children[headingIndex] as Element).children
		.filter(isNodeElement)
		.find((node) => node.tagName === "picture")
		?.children?.filter(isNodeElement)
		?.find((node) => node.tagName === "img");

	const title = toString(children[headingIndex] as never);
	const contents = children.slice(headingIndex + 1);
	const links: SnitipLink[] = [];

	const lastElement = contents.filter(isNodeElement).at(-1);
	if (lastElement?.tagName === "ul") {
		const linkElements = lastElement.children
			.filter(isNodeElement)
			.map((node) => (node.children.length == 1 ? node.children[0] : null));

		if (
			linkElements.every((link) => isNodeElement(link) && link.tagName === "a")
		) {
			// If the list is a valid link list, remove it from contents
			const index = contents.indexOf(lastElement);
			if (index != -1) contents.splice(index, 1);

			for (const linkEl of linkElements as Element[]) {
				links.push({
					name: toString(linkEl),
					href: String(linkEl.properties.href),
				});
			}
		}
	}

	const snitip: SnitipMetadata = {
		href: snitipHref,
		icon: imageEl?.properties?.src?.toString(),
		title,
		content: toHtml(contents as never),
		links,
		tags: [],
	};

	(vfile as MarkdownVFile).data.snitips.set(snitipId, snitip);
	return [];
};
