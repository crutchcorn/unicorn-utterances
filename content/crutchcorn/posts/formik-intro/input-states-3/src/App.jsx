import { useState } from "react";
import { Formik, Form, Field } from "formik";

const FormComponent = () => {
	const [isPending, setIsPending] = useState(false);
	return (
		<Formik
			initialValues={{
				name: "",
				email: "",
			}}
			onSubmit={(values) => {
				setIsPending(true);
				sendToServer(values).then(() => setIsPending(false));
			}}
		>
			{({ touched, dirty, isSubmitting }) => (
				<Form>
					<div>
						<label>
							Name
							<Field type="text" name="name" />
						</label>
						{touched.name && <p>This field has been touched</p>}
						{!touched.name && <p>This field has not been touched</p>}
					</div>
					<div>
						<label>
							Disabled Field
							<Field type="text" name="email" disabled />
						</label>
					</div>
					{/* Formik doesn't provide "dirty" on a field-level basis */}
					{dirty && <p>This form is dirty</p>}
					{isSubmitting && <p>Form is submitted</p>}
					{isPending && <p>Form is pending</p>}
					<button type="submit">Submit</button>
				</Form>
			)}
		</Formik>
	);
};

// Pretend this is calling to a server
function sendToServer(formData) {
	// Wait 4 seconds, then resolve promise
	return new Promise((resolve) => setTimeout(() => resolve(), 4000));
}

export default FormComponent;
