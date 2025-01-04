import { Formik, Form, Field } from "formik";
import * as yup from "yup";

const FormSchema = yup.object().shape({
	termsAndConditions: yup
		.bool()
		.oneOf([true], "You need to accept the terms and conditions"),
});

const FormComponent = () => {
	return (
		<Formik
			initialValues={{
				termsAndConditions: false,
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
							Terms and conditions
							<Field type="checkbox" name="termsAndConditions" />
						</label>
						{errors.termsAndConditions && <p>{errors.termsAndConditions}</p>}
					</div>
					<button type="submit">Submit</button>
				</Form>
			)}
		</Formik>
	);
};

export default FormComponent;
