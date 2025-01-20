import { Formik, Form, Field, FieldArray } from "formik";

// We'll explain why we need an id a bit later
let id = 0;

export const FriendList = () => (
	<div>
		<h1>Friend List</h1>
		<Formik
			initialValues={{ users: [{ name: "", id: ++id }] }}
			onSubmit={(values) => console.log(values)}
		>
			{({ values }) => (
				<Form>
					<FieldArray
						name="users"
						render={(arrayHelpers) => (
							<div>
								{values.users.map((user, index) => (
									<div key={index}>
										<label>
											Name
											<Field name={`users.${index}.name`} />
										</label>
										<button
											type="button"
											onClick={() => arrayHelpers.remove(index)} // remove a friend from the list
										>
											Remove User
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={() => arrayHelpers.push({ name: "", id: ++id })}
								>
									Add user
								</button>
								<button type="submit">Submit</button>
							</div>
						)}
					/>
				</Form>
			)}
		</Formik>
	</div>
);

export default FriendList;
