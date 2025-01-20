import { Formik, Form, Field } from "formik";
import * as yup from "yup";

const FormSchema = yup.object().shape({
	name: yup.string().required(),
});

const FormComponent = () => {
	return (
		<Formik
			initialValues={{
				name: "",
			}}
			validationSchema={FormSchema}
			onSubmit={(values) => {
				console.log(values);
			}}
		>
			{({ errors }) => (
				<Form>
					<div>
						<label>
							Name
							<Field type="text" name="name" />
						</label>
						{errors.name && <p>{errors.name}</p>}
					</div>
					<button type="submit">Submit</button>
				</Form>
			)}
		</Formik>
	);
};

export default FormComponent;
