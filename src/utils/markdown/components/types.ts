import type * as hast from "hast";
import { VFile } from "vfile";

type MaybePromise<T> = Promise<T> | T;

export type RehypeFunctionProps = {
	vfile: VFile;
	node: hast.Node;
	attributes: Record<string, string>;
	children: hast.Node[];
};

export type RehypeFunctionComponent = (
	props: RehypeFunctionProps,
) => MaybePromise<hast.Node | Array<hast.Node> | undefined>;
