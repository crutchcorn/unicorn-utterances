/** @jsxRuntime automatic */
import { Element } from "hast";
import checkmark from "src/icons/checkmark.svg?raw";
import dot from "src/icons/dot.svg?raw";
import close from "src/icons/close.svg?raw";
import { fromHtml } from "hast-util-from-html";

const checkmarkHast = fromHtml(checkmark, { fragment: true });
const dotHast = fromHtml(dot, { fragment: true });
const closeHast = fromHtml(close, { fragment: true });

export interface QuizRadioOption {
	value: string;
	label: string;
	correct: boolean;
}

export interface QuizRadioProps {
	id: string;
	title: string;
	options: QuizRadioOption[];
	numberOfVotes: number;
	numberOfCorrectVotes: number;
	children: Element[];
}

/** @jsxImportSource hastscript */
export function QuizRadio(props: QuizRadioProps): Element {
	const { id, title, options, numberOfVotes, numberOfCorrectVotes, children } =
		props;

	return (
		<form data-quiz-radio class="quizOptionContainer">
			<fieldset>
				<div class="quizOptionTitle">
					<legend class="text-style-headline-6">{title}</legend>
				</div>

				{children}

				<div class="quizOptionOptionsContainer">
					{options.map((option) => {
						const optionId = option.value + "_id";
						return (
							<div class="quizOptionOptionContainer">
								<label>
									<input
										class="quizOptionOptionInput"
										required
										type="radio"
										name={id}
										value={option.value}
									/>
									<div class="quizOptionOptionInnerContainer">
										<div class="quizOptionOptionCheckboxSvgContainer">
											<div class="quizOptionOptionCheckboxCheckmarkSvgContainer">
												{checkmarkHast}
											</div>
											<div class="quizOptionOptionCheckboxDotSvgContainer">
												{dotHast}
											</div>
											<div class="quizOptionOptionCheckboxCloseSvgContainer">
												{closeHast}
											</div>
										</div>
										{option.label}
									</div>
								</label>
							</div>
						);
					})}
				</div>
			</fieldset>

			<div class="quizOptionBottomContainer">
				<div class="quizOptionButtonRowContainer">
					<p
						style="display: none"
						data-loading-message
						class="quizOptionLoading text-style-button-regular"
					>
						Submitting your answer<span class="quizOptionLoadingDotOne">.</span>
						<span class="quizOptionLoadingDotTwo">.</span>
						<span class="quizOptionLoadingDotThree">.</span>
					</p>
					<p data-votes class="quizOptionVotes">
						{numberOfVotes} votes
					</p>
					<span class="quizOptionButtonContainer">
						<button
							disabled
							class="button text-style-button-regular primary-emphasized regular"
						>
							<span className="innerText">Submit</span>
						</button>
					</span>
				</div>
				<p
					style="display: none"
					data-error-message
					class="quizOptionErrorCode text-style-body-small-bold"
				>
					An error occurred. Please try again.
				</p>
			</div>
		</form>
	) as never;
}
