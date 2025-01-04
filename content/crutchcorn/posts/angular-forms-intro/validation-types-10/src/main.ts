import { bootstrapApplication } from "@angular/platform-browser";

import {
	Component,
	provideExperimentalZonelessChangeDetection,
	ChangeDetectionStrategy,
	inject,
} from "@angular/core";

import {
	FormBuilder,
	ReactiveFormsModule,
	Validators,
	ValidationErrors,
	AbstractControl,
} from "@angular/forms";

// Angular does not provide a built-in validator for matching two `FormControl` values,
// so we have to build our own
function matchValues(matchTo: string) {
	return (control: AbstractControl): ValidationErrors | null => {
		// Get "parent" of control, AKA the "form" itself AKA a "FormGroup"
		return !!control.parent &&
			!!control.parent.value &&
			control.value ===
				(control.parent.controls[matchTo as never] as { value: string })?.value
			? null
			: { isNotMatching: true };
	};
}

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
						Minimum Length String (3)
						<input type="text" formControlName="minLenStr" />
					</label>
				</div>
				@if (mainForm.controls.minLenStr.errors?.["minlength"]) {
					<div>Expected a length of at least 3</div>
				}
				<div>
					<label>
						Maximum Length String (3)
						<input type="text" formControlName="maxLenStr" />
					</label>
				</div>
				@if (mainForm.controls.maxLenStr.errors?.["maxlength"]) {
					<div>Expected a length of at most 3</div>
				}
				<div>
					<label>
						Regex
						<input type="text" formControlName="regex" />
					</label>
				</div>
				@if (mainForm.controls.regex.errors?.["pattern"]) {
					<div>Expected the input to match the regex: /hello|hi/i</div>
				}
				<div>
					<label>
						Password
						<input type="text" formControlName="pass" />
					</label>
				</div>
				<div>
					<label>
						Password Confirm
						<input type="text" formControlName="confirm" />
					</label>
				</div>
				@if (mainForm.controls.confirm.errors?.["isNotMatching"]) {
					<div>Expected password to match confirm</div>
				}
				<button type="submit">Submit</button>
			</form>
		</div>
	`,
})
class FormComponent {
	fb = inject(FormBuilder);

	mainForm = this.fb.group(
		{
			minLenStr: ["", Validators.minLength(3)],
			maxLenStr: ["", Validators.maxLength(3)],
			regex: ["", Validators.pattern(/hello|hi/i)],
			pass: [""],
			confirm: ["", matchValues("pass")],
		},
		{ validators: [] },
	);

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
