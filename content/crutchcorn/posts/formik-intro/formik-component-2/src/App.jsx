import { Formik, Form, Field } from "formik";

const FormComponent = () => {
	return (
		<Formik
			initialValues={{
				name: "",
				email: "",
			}}
			onSubmit={(values) => {
				console.log(values);
			}}
		>
			{() => (
				<Form>
					<div>
						<label>
							Name
							<Field type="text" name="name" />
						</label>
					</div>
					<div>
						<label>
							Email
							<Field type="text" name="email" />
						</label>
					</div>
					<button type="submit">Submit</button>
				</Form>
			)}
		</Formik>
	);
};

export default FormComponent;
