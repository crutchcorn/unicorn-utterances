import { bootstrapApplication } from "@angular/platform-browser";

import {
	Component,
	provideExperimentalZonelessChangeDetection,
	ChangeDetectionStrategy,
} from "@angular/core";

@Component({
	selector: "form-comp",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<form (submit)="onSubmit($event)">
			<input type="text" (change)="onChange($event)" [value]="usersName" />
			<button type="submit">Submit</button>
		</form>
	`,
})
export class FormComponent {
	usersName = "";

	onChange(e: Event) {
		const input = e.target as HTMLInputElement;
		this.usersName = input.value;
	}

	onSubmit(e: Event) {
		e.preventDefault();
		console.log(this.usersName);
	}
}

@Component({
	selector: "app-root",
	imports: [FormComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: ` <form-comp /> `,
})
class AppComponent {}

bootstrapApplication(AppComponent, {
	providers: [provideExperimentalZonelessChangeDetection()],
});
