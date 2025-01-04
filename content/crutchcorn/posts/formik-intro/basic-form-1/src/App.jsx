import { useFormik } from "formik";

const FormComponent = () => {
	/**
	 * Formik provides us a hook called "useFormik" which allows us to
	 * define the initial values and submitted behavior
	 *
	 * This return value is then used to track form events and more
	 */
	const formik = useFormik({
		initialValues: {
			name: "",
			email: "",
		},
		onSubmit: (values) => {
			console.log(values);
		},
	});

	return (
		<form onSubmit={formik.handleSubmit}>
			<div>
				<label>
					Name
					<input
						type="text"
						name="name"
						onChange={formik.handleChange}
						value={formik.values.name}
					/>
				</label>
			</div>
			<div>
				<label>
					Email
					<input
						type="text"
						name="email"
						onChange={formik.handleChange}
						value={formik.values.email}
					/>
				</label>
			</div>
			<button type="submit">Submit</button>
		</form>
	);
};

export default FormComponent;
