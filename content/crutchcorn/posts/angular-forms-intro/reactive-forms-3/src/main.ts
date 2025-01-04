import { bootstrapApplication } from "@angular/platform-browser";

import {
	Component,
	provideExperimentalZonelessChangeDetection,
	ChangeDetectionStrategy,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

@Component({
	selector: "form-comp",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ReactiveFormsModule],
	template: `
		<form (submit)="onSubmit($event)">
			<input type="text" [formControl]="nameControl" />
			<button type="button" (click)="setControlToName()">
				Set to author name
			</button>
			<button type="submit">Submit</button>
		</form>
	`,
})
export class FormComponent {
	nameControl = new FormControl("");

	setControlToName() {
		this.nameControl.patchValue("Corbin Crutchley");
	}

	onSubmit(e: Event) {
		e.preventDefault();
		console.log(this.nameControl.value);
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
