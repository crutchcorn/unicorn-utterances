import { bootstrapApplication } from "@angular/platform-browser";

import {
	Component,
	provideExperimentalZonelessChangeDetection,
	ChangeDetectionStrategy,
} from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
	selector: "form-comp",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<form (submit)="onSubmit($event)">
			<input type="text" [(ngModel)]="usersName" name="input" />
			<button type="submit">Submit</button>
		</form>
	`,
})
export class FormComponent {
	usersName = "";

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
