import { Root, Element } from "hast";
import { Plugin } from "unified";
import { find } from "unist-util-find";
import { visit } from "unist-util-visit";
import { LinkPreview } from "../components/link-preview/link-preview";
import { toString } from "hast-util-to-string";
import { isElement } from "../unist-is-element";

function replacePictureElement(anchorNode: Element) {
	const pictureIndex = anchorNode.children.findIndex(
		(el) => isElement(el) && el.tagName == "picture",
	);
	if (pictureIndex == -1) return;
	const pictureNode = anchorNode.children[pictureIndex];
	if (!isElement(pictureNode)) return;
	const imgNode = find(pictureNode, { type: "element", tagName: "img" });
	if (!isElement(imgNode)) return;

	// When given an <a><img/></a>, treat it as a link preview
	imgNode.properties["data-nozoom"] = true;

	const anchorText = toString(anchorNode);

	const tooltip = LinkPreview({
		type: "link",
		label: anchorText.length ? anchorText : anchorNode.properties.href + "",
		children: [pictureNode],
		anchorAttrs: anchorNode.properties,
	});

	Object.assign(anchorNode, tooltip);
}

/**
 * Transform image-wrapped links into a link preview component
 * Expects: <a><picture><img/></picture></a> / [![](image.png)](url)
 */
export const rehypeLinkPreview: Plugin<[], Root> = () => {
	return async (tree) => {
		const promises: Array<Promise<void>> = [];

		visit(tree, "element", (node: Element) => {
			if (node.tagName === "a") {
				replacePictureElement(node);
			}
		});

		await Promise.all(promises);
	};
};
