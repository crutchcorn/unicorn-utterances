/** @jsxRuntime automatic */
import type { Element, ElementContent } from "hast";
import { fromHtml } from "hast-util-from-html";
import { SnitipMetadata } from "types/SnitipInfo";
import { promises as fs } from "fs";

interface LinkProps {
	id: string,
	snitip: SnitipMetadata,
	children: ElementContent[];
}

const info = await fs.readFile("src/icons/info.svg", "utf8");

const InfoIcon = fromHtml(info, { fragment: true }).children[0] as Element;
InfoIcon.properties["aria-hidden"] = "true";

/** @jsxImportSource hastscript */
export function SnitipLink(props: LinkProps): Element {
	return (
		<a id={"snitip-" + props.id} href={"#snitip-" + props.id} class="snitip__link" data-snitip={JSON.stringify(props.snitip)} tabindex={0} role="button">
			{props.children}
		</a>
	) as never;
}
