import React from "react";
import * as wordCountStyles from "./word-count.module.scss";
import { Feather as FeatherIcon } from "assets/icons/feather";

interface WordCountProps {
	numberOfArticles: number;
	wordCount: number;
}
export const WordCount = ({
	numberOfArticles = 0,
	wordCount = 0,
}: WordCountProps) => {
	return (
		<div className={wordCountStyles.container}>
			<FeatherIcon className={wordCountStyles.icon} />
			<p>{numberOfArticles} {numberOfArticles < 2 ? 'Article' : 'Articles'}</p>
			<div className={wordCountStyles.divider} />
			<p>{wordCount} Words</p>
		</div>
	);
};
