import { bootstrapApplication } from "@angular/platform-browser";

import {
	Component,
	provideExperimentalZonelessChangeDetection,
	ChangeDetectionStrategy,
} from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormControl } from "@angular/forms";

@Component({
	selector: "form-comp",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ReactiveFormsModule],
	template: `
		<form (submit)="onSubmit($event)" [formGroup]="mainForm">
			<div>
				<label>
					Name
					<input type="text" formControlName="name" />
				</label>
			</div>
			<div>
				<label>
					Email
					<input type="text" formControlName="email" />
				</label>
			</div>
			<button type="submit">Submit</button>
		</form>
	`,
})
export class FormComponent {
	mainForm = new FormGroup({
		name: new FormControl(""),
		email: new FormControl(""),
	});

	onSubmit(e: Event) {
		e.preventDefault();
		console.log(this.mainForm.value);
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
