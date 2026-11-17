import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Styles from './DropdownMenu.module.scss';

const DropdownContext = createContext();

function useDropdownContext() {
	const context = useContext(DropdownContext);
	if (!context) {
		throw new Error(
			"DropdownMenu compound components can't be used outside the DropDownMenu Component"
		);
	}
	return context;
}

export function DropdownMenu({ className, children }) {
	const [on, setOn] = useState(false);
	const ref = useRef(null);
	const value = useMemo(() => ({ on, setOn }), [on]);

	// Close on outside click or Escape
	useEffect(() => {
		if (!on) return;
		const onDown = (e) => !ref.current?.contains(e.target) && setOn(false);
		const onKey = (e) => e.key === 'Escape' && setOn(false);
		document.addEventListener('mousedown', onDown);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDown);
			document.removeEventListener('keydown', onKey);
		};
	}, [on]);

	return (
		<DropdownContext.Provider value={value}>
			<div ref={ref} className={className ? `${className} ${Styles.dropdown_menu}` : Styles.dropdown_menu}>
				{children}
			</div>
		</DropdownContext.Provider>
	);
}

export function MenuButton({ className, children }) {
	const { on, setOn } = useDropdownContext();
	return (
		<button
			className={className ? `${className} ${Styles.menu_button}` : Styles.menu_button}
			onClick={() => setOn(!on)}
			aria-haspopup="true"
			aria-expanded={on}
		>
			{children}
		</button>
	);
}

export function Menu({ children }) {
	const { on, setOn } = useDropdownContext();
	return on ? (
		<ul className={Styles.menu_wrap} onClick={() => setOn(false)}>
			{children}
		</ul>
	) : null;
}

export function MenuItem({ children, ...props }) {
	const { on } = useDropdownContext();
	return on ? (
		<li className={Styles.menu_item} {...props}>
			{children}
		</li>
	) : null;
}
