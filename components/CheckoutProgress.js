import Styles from './CheckoutProgress.module.scss';

const steps = ['Sign in', 'Shipping', 'Payment', 'Place order'];

const CheckoutProgress = ({ activeStep }) => {
	return (
		<nav className={Styles.CheckoutProgress} aria-label="Checkout progress">
			<ol style={{ '--progress': activeStep / (steps.length - 1) }}>
				{steps.map((step, index) => (
					<li
						key={step}
						className={`${index <= activeStep ? Styles.active : ''} ${index === activeStep ? Styles.current : ''}`}
						aria-current={index === activeStep ? 'step' : undefined}
					>
						<span className={Styles.dot}>{index < activeStep ? '✓' : index + 1}</span>
						<span className={Styles.label}>{step}</span>
					</li>
				))}
			</ol>
		</nav>
	);
};

export default CheckoutProgress;
