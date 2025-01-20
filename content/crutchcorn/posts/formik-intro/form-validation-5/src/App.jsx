import { Formik, Form, Field } from "formik";

function requiredField(value) {
	let error;
	if (!value) {
		error = "Required";
	}
	return error;
}

const FormComp = () => {
	return (
		<Formik initialValues={{ name: "" }} onSubmit={(val) => console.log(val)}>
			{({ errors, touched }) => (
				<Form>
					<div>
						<Field name="name" validate={requiredField} />
					</div>
					{errors.name && touched && <div>{errors.name}</div>}
					<button type="submit">Submit</button>
				</Form>
			)}
		</Formik>
	);
};

export default FormComp;
