import { bootstrapApplication } from "@angular/platform-browser";

import {
	Component,
	provideExperimentalZonelessChangeDetection,
	ChangeDetectionStrategy,
	inject,
} from "@angular/core";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";

@Component({
	selector: "form-comp",
	imports: [ReactiveFormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
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
	fb = inject(FormBuilder);

	mainForm = this.fb.group({
		name: "",
		// This doesn't mean to make `email` an array
		// It just allows us to add more information about this
		// Input in the future.
		// We'll see it's usage in the next section
		email: [""],
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
