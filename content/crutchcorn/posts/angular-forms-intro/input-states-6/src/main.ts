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
		<div>
			<h1>Friend List</h1>
			<form (submit)="onSubmit($event)" [formGroup]="mainForm">
				<div>
					<label>
						Name
						<input type="text" formControlName="name" />
					</label>
					@if (mainForm.controls.name.untouched) {
						<p>Field has not been touched</p>
					}
					@if (mainForm.controls.name.touched) {
						<p>Field has been touched</p>
					}
					@if (mainForm.controls.name.dirty) {
						<p>Field is dirty</p>
					}
					@if (mainForm.controls.name.pristine) {
						<p>Field is pristine</p>
					}
				</div>
				<div>
					<label>
						Disabled field
						<input type="text" formControlName="email" />
					</label>
				</div>
				<button type="submit">Submit</button>
				@if (mainForm.untouched) {
					<p>Form has not been touched</p>
				}
				@if (mainForm.touched) {
					<p>Form has been touched</p>
				}
				@if (mainForm.dirty) {
					<p>Form is dirty</p>
				}
				@if (mainForm.pristine) {
					<p>Form is pristine</p>
				}
				@if (mainForm.dirty) {
					<p>Form is dirty</p>
				}
				@if (submitted) {
					<p>Form is submitted</p>
				}
				@if (pending) {
					<p>Form is pending</p>
				}
			</form>
		</div>
	`,
})
class FormComponent {
	fb = inject(FormBuilder);

	mainForm = this.fb.group({
		name: [""],
		email: [{ value: "", disabled: true }],
	});

	submitted = false;
	pending = false;

	onSubmit(e: Event) {
		this.submitted = true;
		this.pending = true;
		e.preventDefault();
		this.sendToServer(this.mainForm.value).then(() => {
			this.pending = false;
		});
	}

	// Pretend this is calling to a server
	sendToServer(formData: object) {
		// Wait 4 seconds, then resolve promise
		return new Promise((resolve) => setTimeout(() => resolve(0), 4000));
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
