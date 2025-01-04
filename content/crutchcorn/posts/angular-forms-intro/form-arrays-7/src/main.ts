import { bootstrapApplication } from "@angular/platform-browser";

import {
	Component,
	provideExperimentalZonelessChangeDetection,
	ChangeDetectionStrategy,
	inject,
} from "@angular/core";
import { ReactiveFormsModule, FormBuilder, FormArray } from "@angular/forms";

@Component({
	selector: "form-comp",
	imports: [ReactiveFormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div>
			<h1>Friend List</h1>
			<form (submit)="onSubmit($event)" [formGroup]="mainForm">
				<div formArrayName="users">
					@for (item of arr.controls; let i = $index; track item) {
						<div [formGroupName]="i">
							<label>
								Name
								<input type="text" formControlName="name" />
							</label>
							<button type="button" (click)="removeUser(i)">Remove User</button>
						</div>
					}
				</div>
				<button type="button" (click)="addUser()">Add user</button>
				<button type="submit">Submit</button>
			</form>
		</div>
	`,
})
class FormComponent {
	fb = inject(FormBuilder);

	id = 0;

	mainForm = this.fb.group({
		// This could also be written using `new FormArray([`
		users: this.fb.array([this.fb.group({ id: ++this.id, name: "" })]),
	});

	addUser() {
		this.arr.push(
			// This could also be written as `new FormGroup({`
			this.fb.group({
				id: ++this.id,
				name: "",
			}),
		);
	}

	removeUser(i: number) {
		this.arr.removeAt(i);
	}

	// Required cast to FormArray. Otherwise, TypeScript will assume it
	// to be a `FormControl` and won't have `push` or `removeAt` methods.
	get arr(): FormArray {
		return this.mainForm.get("users") as FormArray;
	}

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
