import { Formik, Form, Field } from "formik";
import * as yup from "yup";

const FormSchema = yup.object().shape({
	minLenStr: yup.string().min(3),
	maxLenStr: yup.string().max(3),
	regex: yup.string().matches(/hello|hi/i),
	pass: yup.string(),
	confirm: yup
		.string()
		.oneOf([yup.ref("pass"), null], 'Must match "password" field value'),
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
							Minimum Length String (3)
							<Field type="text" name="minLenStr" />
						</label>
						{errors.minLenStr && <p>{errors.minLenStr}</p>}
					</div>
					<div>
						<label>
							Maximum Length String (3)
							<Field type="text" name="maxLenStr" />
						</label>
						{errors.maxLenStr && <p>{errors.maxLenStr}</p>}
					</div>
					<div>
						<label>
							Regex
							<Field type="text" name="regex" />
						</label>
						{errors.regex && <p>{errors.regex}</p>}
					</div>
					<div>
						<label>
							Password
							<Field type="password" name="pass" />
						</label>
					</div>
					<div>
						<label>
							Password Confirm
							<Field type="password" name="confirm" />
						</label>
						{errors.confirm && <p>{errors.confirm}</p>}
					</div>
					<button type="submit">Submit</button>
				</Form>
			)}
		</Formik>
	);
};

export default FormComponent;
