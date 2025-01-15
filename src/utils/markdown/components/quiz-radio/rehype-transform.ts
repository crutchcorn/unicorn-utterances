import { QuizRadio, QuizRadioOption } from "./quiz-radio";
import { RehypeFunctionComponent } from "../types";
import {
	findLargestHeading,
	isNodeHeading,
	isNodeLargestHeading,
} from "../utils/headings";
import { getHeaderNodeId } from "rehype-slug-custom-id";
import { Element, Text } from "hast";
import { toString } from "hast-util-to-string";

export const transformQuizRadio: RehypeFunctionComponent = ({ children }) => {
	// Setup
	const largestSize = findLargestHeading(children as Element[]);

	// QuizRadioProps
	const options: QuizRadioOption[] = [];
	let questionId = "";
	const localChildren = [] as Element[];
	let title = "";

	for (const child of children as Element[]) {
		if (isNodeHeading(child) && isNodeLargestHeading(child, largestSize)) {
			// TODO: Does not need to run `getHeaderNodeId` since it's a heading and this should have already occurred
			const { id } = child.properties;
			questionId = id as string;
			title = toString(child);
			continue;
		}

		if (child.type === "element" && child.tagName === "ul") {
			if (options.length !== 0) {
				continue;
			}

			for (const option of child.children as Element[]) {
				if (option.type !== "element" && option.tagName !== "li") {
					continue;
				}
				const rawLabel = toString(option);
				// We want `rawLabel` to start with `( )` or `(x)` to indicate the radio button and it's correctness or not
				// If it is not, we assume this `ul` is not a quiz radio option list and don't want to transform it
				const match = /^\((.)\) (.*)$/.exec(rawLabel);
				if (!match) {
					localChildren.push(child);
					break;
				}
				const correct = match[1] === "x";
				const innerText = option.children[0] as Text;
				// Remove the `( )` or `(x)` from the label
				innerText.value = match[2];
				const { id: value } = getHeaderNodeId(option, {
					enableCustomId: true,
				});
				const label = toString(option);
				options.push({ value, label, correct });
			}

			if (options.length !== 0) {
				continue;
			}
		}

		localChildren.push(child);
	}

	return QuizRadio({
		id: questionId,
		title,
		options,
		numberOfVotes: 23,
		numberOfCorrectVotes: 13,
		children: localChildren,
	});
};
