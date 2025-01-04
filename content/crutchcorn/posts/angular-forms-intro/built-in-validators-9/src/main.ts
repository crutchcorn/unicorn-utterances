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
			<h1>Friend List</h1>
			<form (submit)="onSubmit($event)" [formGroup]="mainForm">
				<label>
					Name
					<input type="text" formControlName="name" />
				</label>

				@if (mainForm.controls.name.errors?.["required"]) {
					<div>Name is required.</div>
				}
				<button type="submit">Submit</button>
			</form>
		</div>
	`,
})
class FormComponent {
	fb = inject(FormBuilder);

	mainForm = this.fb.group({
		name: ["", Validators.required],
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
