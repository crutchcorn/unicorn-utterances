import { bootstrapApplication } from "@angular/platform-browser";

import {
	Component,
	provideExperimentalZonelessChangeDetection,
	ChangeDetectionStrategy,
	inject,
} from "@angular/core";

import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
	selector: "form-comp",
	imports: [ReactiveFormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div>
			<form (submit)="onSubmit($event)" [formGroup]="mainForm">
				<div>
					<label>
						Terms and Conditions
						<input type="checkbox" formControlName="termsAndConditions" />
					</label>
				</div>
				@if (mainForm.controls.termsAndConditions.errors?.["required"]) {
					<div>You must accept the terms and conditions</div>
				}
				<button type="submit">Submit</button>
			</form>
		</div>
	`,
})
class FormComponent {
	fb = inject(FormBuilder);

	mainForm = this.fb.group({
		termsAndConditions: ["", Validators.requiredTrue],
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
