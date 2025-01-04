---
{
    title: "Intro to Angular Forms",
    description: "Learn the basics of Angular Forms! Explore different approaches to build dynamic, user-friendly forms with ease.",
    published: '2025-01-01T22:12:03.284Z',
    tags: ["angular", "javascript", "webdev"]
}
---

Forms are the building blocks for many applications written in Angular. Given's Angular's all-in-one solution, it's no wonder that there's a plethora of options available to Angular developers when it comes to forms; right out of the box!

Let's explore those options in a quick guide on Angular's Forms solutions.

# One-way Form Bindings

One common and easy way to assign a value to form elements - like a text input - is to simply listen for value changes (using events) on the element and assign those changes back to a bound input value.

```angular-ts
@Component({
	selector: 'form-comp',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
    <form (submit)="onSubmit($event)">
	  	<input type="text" (change)="onChange($event)" [value]="usersName"/>
      <button type="submit">Submit</button>
    </form>
  `,
})
export class FormComponent {
	usersName = '';

	onChange(e: Event) {
		const input = e.target as HTMLInputElement;
		this.usersName = input.value;
	}

	onSubmit(e: Event) {
		e.preventDefault();
		console.log(this.usersName);
	}
}
```

<iframe data-frame-title="One Way Form Binding - StackBlitz" src="pfp-code:./one-way-form-binding-1?template=node&embed=1&file=src%2Fmain.ts"></iframe>

While this works as-is, it can get complex when too many inputs are present. For each input, you need:

- A function to listen for changes and bind them to the value
- A variable to assign the data to
- Rebind said data back to the input

Let's try to simplify this by removing the first step.

# Two-way form bindings

One method for removing the input change listener is by using two-way variable bindings. By using this, you don't need to assign a function for change listening. Simply pass a variable and watch the value change as you type!

If you recall from earlier, Angular's syntax to bind to an attribute or property is `[bindName]`. Similarly, the syntax to bind to a DOM event or component output is `(bindName)`.

Well, if we combine them together, we can sync all of an event's values to and from an Angular variable with a handy shorthand:
```typescript
[(bindName)]
```

> Remember to not flip the `[]` and `()` symbols! It's important to make sure that the square brackets go on the outside of the bind.
>
> Luckily, there's a mnemonic device to remember this operator order - This syntax is colloquially known as a ["banana in a box", even in Angular's source code itself](https://github.com/angular/angular/blob/f8d22a9ba4e426f14f9c7fd608e1ad752cd44eb5/packages/compiler/src/render3/r3_template_transform.ts#L50)!

For our simple example of binding a `value`, we can use the `bindName` of `ngModel`, which is standard on most input elements through the `FromsModule`:

```angular-ts {4,10}
import {FormsModule} from "@angular/forms";

@Component({
	selector: 'form-comp',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [FormsModule],
	template: `
    <form (submit)="onSubmit($event)">
	  <input type="text" [(ngModel)]="usersName" name="input"/>
      <button type="submit">Submit</button>
    </form>
  `,
})
export class FormComponent {
	usersName = '';

	onSubmit(e: Event) {
		e.preventDefault();
		console.log(this.usersName);
	}
}
```

<iframe data-frame-title="Two Way Form Binding - StackBlitz" src="pfp-code:./two-way-form-binding-2?template=node&embed=1&file=src%2Fmain.ts"></iframe>

> Don't forget to add `FormsModule` to the `imports` array in your component. If you forget it, you'll see the following error:
>
> ```shell
> ✘ [ERROR] NG8002: Can't bind to 'ngModel' since it isn't a known property of 'input'. [plugin angular-compiler]
> 
>     src/main.ts:15:22:
>       15 │     <input type="text" [(ngModel)]="usersName" name="input"/>
>          ╵                        ~~~~~~~~~~~~~~~~~~~~~~~
> ```

While these methods of two-way binding help mitigate some problems, there's still one big problem: Your data is no longer consolidated. This means that if you submit a form and want to, say, pass the form's data to your server, you'll need to:

- Create a new object
- Make sure you pass all subkeys of the object

While this works for simple examples like ours, it quickly gets unwieldy and easy to introduce bugs within at a larger scale.

There's a better way.

# Reactive Forms

Reactive forms are a way for you to keep all of your form data inside of a single variable when it comes time to submit a form. There are also multiple enhancements to this method, such as data validation and array handling.

As opposed to the other frameworks, which require utilizing an external library for reactive forms, Angular has them baked in as a priority feature of the framework.

To utilize them, we first need to import the `ReactiveFormsModule`, which allows us to have a more fully-featured API as opposed to `FormsModule`'s `[(ngModel)]`.

Now, we can create a new instance of a class called `FormControl` to act as a form item that we can then bind to a `[formControl]` in order to have two-way event and value input sync. 

```angular-ts {0,6,12}
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
	selector: 'form-comp',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ReactiveFormsModule],
	template: `
    <form (submit)="onSubmit($event)">
	  <input type="text" [formControl]="nameControl"/>
      <button type="submit">Submit</button>
    </form>
  `,
})
export class FormComponent {
	nameControl = new FormControl('');

	onSubmit(e: Event) {
		e.preventDefault();
		console.log(this.nameControl.value);
	}
}
```

We aren't simply bound to input events to update this value, however; we can even manually update the value of the `FormControl` from JavaScript-land:

```angular-ts {14}
@Component({
  selector: 'form-comp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form (submit)="onSubmit($event)">
      <input type="text" [formControl]="nameControl"/>
      <button type="button" (click)="setControlToName()">Set to author name</button>
      <button type="submit">Submit</button>
    </form>
  `,
})
export class FormComponent {
  nameControl = new FormControl('');

  setControlToName() {
    this.nameControl.patchValue('Corbin Crutchley');
  }

  onSubmit(e: Event) {
    e.preventDefault();
    console.log(this.nameControl.value);
  }
}
```

<iframe data-frame-title="Reactive Forms - StackBlitz" src="pfp-code:./reactive-forms-3?template=node&embed=1&file=src%2Fmain.ts"></iframe>

## Form Groups

While a basic `FormControl` creation is useful for demonstration purposes, it doesn't truly demonstrate the full power of reactive forms. Namely, when there are multiple inputs, your `form` can act as the source of truth through a new `FormGroup` class instance:

```angular-ts {0,5,9,23-26,30}
import {ReactiveFormsModule,  FormGroup, FormControl } from '@angular/forms';

@Component({
	selector: 'form-comp',
	imports: [ReactiveFormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
    <form (submit)="onSubmit($event)" [formGroup]="mainForm">
    <div>
      <label>
        Name
        <input type="text" formControlName="name"/>
      </label>
    </div>
    <div>
      <label>
        Email
        <input type="text" formControlName="email"/>
      </label>
    </div>
    <button type="submit">Submit</button>
    </form>
  `,
})
export class FormComponent {
	mainForm = new FormGroup({
		name: new FormControl(''),
		email: new FormControl(''),
	});

	onSubmit(e: Event) {
		e.preventDefault();
		console.log(this.mainForm.value);
	}
}
```

<iframe data-frame-title="Form Groups - StackBlitz" src="pfp-code:./form-groups-4?template=node&embed=1&file=src%2Fmain.ts"></iframe>

## Form Builder

You're also able to utilize a shorthand `fb` provided by Angular to remove duplicate calls to `FormControl` and `FormGroup`, respectively using [Angular's Dependency Injection](/posts/ffg-fundamentals-dependency-injection):

```angular-ts
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

@Component({
	selector: 'form-comp',
	imports: [ReactiveFormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
    <form (submit)="onSubmit($event)" [formGroup]="mainForm">
    <div>
      <label>
        Name
        <input type="text" formControlName="name"/>
      </label>
    </div>
    <div>
      <label>
        Email
        <input type="text" formControlName="email"/>
      </label>
    </div>
    <button type="submit">Submit</button>
    </form>
  `,
})
export class FormComponent {
	fb = inject(FormBuilder);

	mainForm = this.fb.group({
		name: '',
		// This doesn't mean to make `email` an array
		// It just allows us to add more information about this
		// Input in the future.
		// We'll see it's usage in the next section
		email: [''],
	});

	onSubmit(e: Event) {
		e.preventDefault();
		console.log(this.mainForm.value);
	}
}
```

<iframe data-frame-title="Form Builder - StackBlitz" src="pfp-code:./form-builder-5?template=node&embed=1&file=src%2Fmain.ts"></iframe>

## Input States {#input-states}

When dealing with form fields, it's valuable to have metadata about the fields' state itself. These metadata states include:

- Touched: When a user has tabbed or clicked into a field but not yet typed
- Dirty: If the user has typed a value into the field
- Pristine: The opposite of "dirty" - if the user has not typed information into the field

Here's an interactive playground that you can use to play around with each of the different input states.

```angular-ts
@Component({
  selector: 'form-comp',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <div>
          <h1>Friend List</h1>
          <form (submit)="onSubmit($event)" [formGroup]="mainForm">
              <div>
                  <label>
                      Name
                      <input type="text" formControlName="name"/>
                  </label>
                  @if (mainForm.controls.name.untouched) {
                      <p>
                          Field has not been touched
                      </p>
                  }
                  @if (mainForm.controls.name.touched) {
                      <p>
                          Field has been touched
                      </p>
                  }
                  @if (mainForm.controls.name.dirty) {
                      <p>
                          Field is dirty
                      </p>
                  }
                  @if (mainForm.controls.name.pristine) {
                      <p>
                          Field is pristine
                      </p>
                  }
              </div>
              <div>
                  <label>
                      Disabled field
                      <input type="text" formControlName="email"/>
                  </label>
              </div>
              <button type="submit">Submit</button>
              @if (mainForm.untouched) {
                  <p>
                      Form has not been touched
                  </p>
              }
              @if (mainForm.touched) {
                  <p>
                      Form has been touched
                  </p>
              }
              @if (mainForm.dirty) {
                  <p>
                      Form is dirty
                  </p>
              }
              @if (mainForm.pristine) {
                  <p>
                      Form is pristine
                  </p>
              }
              @if (mainForm.dirty) {
                  <p>
                      Form is dirty
                  </p>
              }
              @if (submitted) {
                  <p>
                      Form is submitted
                  </p>
              }
              @if (pending) {
                  <p>
                      Form is pending
                  </p>
              }
          </form>
      </div>
  `,
})
class FormComponent {
  fb = inject(FormBuilder);

  mainForm = this.fb.group({
    name: [''],
    email: [{value: '', disabled: true}],
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
```

<iframe data-frame-title="Input States - StackBlitz" src="pfp-code:./input-states-6?template=node&embed=1&file=src%2Fmain.ts"></iframe>

# Form Arrays {#form-arrays}

Not all forms have a static list of items; this is where a need for an array of items might come into play.

Let's build out an example of a form that tracks a list of users:

```angular-ts
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
```

<iframe data-frame-title="Form Arrays - StackBlitz" src="pfp-code:./form-arrays-7?template=node&embed=1&file=src%2Fmain.ts"></iframe>

Because we're now using an array, we need a unique ID for each user. This is why, for each implementation, there's an `id` field. We then use this `id` field to identify which user is which to the framework.


# Form Validation {#form-validation}

You know how earlier we switch our `fb.group` command from:

```typescript
mainForm = this.fb.group({
  name: ''
});
```

To:

```typescript
mainForm = this.fb.group({
  name: [''],
});
```

And promised there was some nebulous benefit for doing so later? Well, now it's time to introduce the "why". When a `FormControl` is passed an array with a second value, that value is treated as a validator function.

Validation is when we confirm that the user's inputs match what we expect them to be for a form to be considered "valid".

Let's write a simple validator function to check when the field is filled or not. If it's not filled, we can return a string to display to the user that "This field is required".

```angular-ts
import {
	FormBuilder,
	ReactiveFormsModule,
	AbstractControl,
	ValidationErrors,
} from "@angular/forms";

export function requiredValidator(
	control: AbstractControl,
): ValidationErrors | null {
	const noVal = !control.value;
	return noVal ? { required: "This field is required" } : null;
}

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
		name: ["", requiredValidator],
	});

	onSubmit(e: Event) {
		e.preventDefault();
		console.log(this.mainForm.value);
	}
}
```

<iframe data-frame-title="Form Validation - StackBlitz" src="pfp-code:./form-validation-8?template=node&embed=1&file=src%2Fmain.ts"></iframe>

## Built-In Validators

Luckily for us, just like [Angular's Pipes](/posts/angular-pipes-a-complete-guide), Angular provides some built-in validators for us to use. For example, we can replace our implementation with Angular's built-in `Validators.required` version.

```angular-ts
import {
	FormBuilder,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";

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
```

<iframe data-frame-title="Built-in Validators - StackBlitz" src="pfp-code:./built-in-validators-9?template=node&embed=1&file=src%2Fmain.ts"></iframe>

## Validation Types

Marking a field as required is far from the only type of form validation. While there are any number of items, there

- Minimum string length
- Maximum string length
- Two inputs match each other
- Match a regex

Here's a playground where we demonstrate a form that validates all of those examples:

```angular-ts
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
			control.value === (control.parent.controls[matchTo as never] as {value: string})?.value
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
				@if (mainForm.controls.minLenStr.errors?.['minlength']) {
					<div>Expected a length of at least 3</div>
				}
				<div>
					<label>
						Maximum Length String (3)
						<input type="text" formControlName="maxLenStr" />
					</label>
				</div>
				@if (mainForm.controls.maxLenStr.errors?.['maxlength']) {
					<div>Expected a length of at most 3</div>
				}
				<div>
					<label>
						Regex
						<input type="text" formControlName="regex" />
					</label>
				</div>
				@if (mainForm.controls.regex.errors?.['pattern']) {
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
				@if (mainForm.controls.confirm.errors?.['isNotMatching']) {
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
```

<iframe data-frame-title="Validation Types - StackBlitz" src="pfp-code:./validation-types-10?template=node&embed=1&file=src%2Fmain.ts"></iframe>

# Non-Text Form Fields

Not all fields in a form are going to be text inputs, however. You might want to introduce a checkbox to the user to make sure they've accepted terms and conditions, have a dropdown of time zones, or have a date picker for the user to input a time.

Just like text inputs, you can combine these input types with validation!

While there are many other types of user input elements, let's focus on just one: Checkboxes.

Since Angular uses the `input` element directly, it's trivial to implement a checkbox without much thought. In addition, our specific use-case of creating a terms and conditions toggle is something that [the built-in validator `requiredTrue`](https://angular.io/api/forms/Validators#requiredtrue) can make trivial.

```angular-ts
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
```

# Conclusion

This has been a quick look at Angular's official forms solution.

Want to learn more of Angular's APIs and how to properly leverage them?

Check out my book series called ["The Framework Field Guide", which teaches React, Angular, and Vue all at once for free - start to end](https://framework.guide).

Until next time!
