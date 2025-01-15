import { Element } from "hast";

export const isNodeHeading = (n: Element) =>
	n.type === "element" && /h[1-6]/.exec(n.tagName);

export const findLargestHeading = (nodes: Element[]) => {
	let largestSize = Infinity;
	for (const node of nodes) {
		if (!isNodeHeading(node)) continue;
		const size = parseInt(node.tagName.substring(1), 10);
		largestSize = Math.min(largestSize, size);
	}
	return largestSize;
};

export const isNodeLargestHeading = (n: Element, largestSize: number) =>
	isNodeHeading(n) && parseInt(n.tagName.substring(1), 10) === largestSize;
