import { Root, Element } from "hast";
import { Node } from "unist";

export const isElement = (e: Root | Element | Node | undefined): e is Element =>
	e?.type == "element";
