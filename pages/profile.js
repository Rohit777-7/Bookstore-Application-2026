import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

import Layout from '../components/Layout';
import Styles from './form.module.scss';
import { useToast } from '../components/Toast';
import { playSound } from '../utils/sound';

const Profile = () => {
	const { data: session } = useSession();
	const toast = useToast();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm();

	useEffect(() => {
		setValue('name', session.user.name);
		setValue('email', session.user.email);
	}, [session.user, setValue]);

	const submitHandler = async ({ name, email, password }) => {
		try {
			const updateUser = await fetch('/api/auth/update', {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name,
					email,
					password,
				}),
			});

			const response = await updateUser.json();
			if (!updateUser.ok) {
				playSound('error');
				toast({ type: 'error', title: 'Update failed', message: response.message });
				return;
			} else {
				const result = await signIn('credentials', {
					redirect: false,
					email,
					password,
				});
				if (result.error) {
					playSound('error');
					toast({ type: 'error', title: 'Update failed', message: result.error });
					return;
				}
			}
			playSound('add');
			toast({ title: 'Profile updated', message: 'Your details have been saved.' });
		} catch (err) {
			playSound('error');
			toast({ type: 'error', title: 'Update failed', message: err.message });
		}
	};

	return (
		<Layout title={`${session.user.name} - Edit Profile`}>
			<div className="container">
				<form
					className={Styles.form}
					onSubmit={handleSubmit(submitHandler)}
				>
					<h2>Register</h2>

					<label htmlFor="name">Name</label>
					<input
						type="text"
						placeholder="Enter your Name"
						id="name"
						autoFocus
						{...register('name', {
							required: 'Please provide your name',
							minLength: {
								value: 3,
								message:
									'Name should be minimum 3 characters long',
							},
						})}
					/>
					{errors.name && (
						<span className={Styles.error} role="alert">
							{errors.name.message}
						</span>
					)}

					<label htmlFor="email">Email</label>
					<input
						type="text"
						placeholder="Enter your Email"
						id="email"
						disabled
						{...register('email')}
					/>

					<label htmlFor="password">Password</label>
					<input
						type="password"
						placeholder="Enter your Password"
						id="password"
						{...register('password', {
							required: 'Please provide your password',
							minLength: {
								value: 6,
								message:
									"Password can't be less than 6 characters",
							},
						})}
					/>
					{errors.password && (
						<span className={Styles.error} role="alert">
							{errors.password.message}
						</span>
					)}

					<label htmlFor="confirm_password">Confirm Password</label>
					<input
						type="password"
						placeholder="Enter your Password"
						id="confirm_password"
						{...register('confirm_password', {
							required: 'Please confirm your password',
							minLength: {
								value: 6,
								message:
									"Password can't be less than 6 characters",
							},
						})}
					/>
					{errors.confirm_password && (
						<span className={Styles.error} role="alert">
							{errors.confirm_password.message}
						</span>
					)}

					{watch('password') !== watch('confirm_password') &&
					!errors.confirm_password ? (
						<span className={Styles.error} role="alert">
							Password Does not match
						</span>
					) : null}

					<button type="submit" className="button">
						Update Profile
					</button>
				</form>
			</div>
		</Layout>
	);
};
Profile.auth = true;
export default Profile;
