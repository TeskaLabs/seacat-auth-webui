import React, { useState }  from 'react';
import {
	FormGroup, Input, Label,
	Button, InputGroupAddon, InputGroup, FormFeedback, FormText
} from 'reactstrap';
import { useTranslation } from 'react-i18next';

// TODO: Validation on phone number
export function PhoneField(props) {
	const { t } = useTranslation();
	const disabled = props.content?.editable == undefined ? false : props.content?.editable == false ? true : false;
	if (disabled && props.content?.value) {
		props.setValue("phone", props.content.value);
	}
	const reg = props.register(
		"phone",
		{
			validate: {
				regexValidation: value => (/^(?=.*[0-9])[+ 0-9]+$/).test(value) || value.length < 1 || t('FormFields|Invalid phone number format'),
				lengthValidation: value => value.length >= 9 || value.length < 1 || t('FormFields|Phone number is too short')
			},
			required: props.content?.required ? t("FormFields|Phone cannot be empty!") : false
		}
	);
	return (
		<FormGroup>
			<Label title={props.content?.required ? t("FormFields|Required field") : undefined} for="phone">
				{t("FormFields|Phone")}{props.content?.required && '*'}
			</Label>
			<Input
				title={disabled ? t("FormFields|Phone editing is not allowed within these credentials") : undefined}
				id="phone"
				name="phone"
				type="text"
				maxLength="17"
				defaultValue={props.content?.value ? props.content?.value : undefined}
				disabled={disabled}
				invalid={props.errors.phone}
				onChange={reg.onChange}
				onBlur={reg.onBlur}
				innerRef={reg.ref}
			/>
			{props.errors.phone && <FormFeedback>{props.errors.phone.message}</FormFeedback>}
		</FormGroup>
	)
}

export function EmailField(props) {
	const { t } = useTranslation();
	const disabled = props.content?.editable == undefined ? false : props.content?.editable == false ? true : false;
	if (disabled && props.content?.value) {
		props.setValue("email", props.content.value);
	}
	const reg = props.register(
		"email", {
			required: props.content?.required ? t("FormFields|Email cannot be empty!") : false,
			validate: {
				emptyInput: value => (
					props.getValues("email") !== "") || t("FormFields|Email cannot be empty!"),
			}
		}
	);
	/*
		TODO: Validation on email (default validation should be created and should
		be overriden when there will be information for email validation from
		config.item [from site])
	*/
	return (
		<FormGroup>
			<Label title={props.content?.required ? t("FormFields|Required field") : undefined} for="email">
				{t("FormFields|Email")}{props.content?.required && '*'}
			</Label>
			<Input
				title={disabled ? t("FormFields|Email editing is not allowed") : undefined}
				id="email"
				name="email"
				type="email"
				autoComplete="email"
				defaultValue={props.content?.value ? props.content?.value : undefined}
				disabled={disabled}
				invalid={props.errors.email}
				onChange={reg.onChange}
				onBlur={reg.onBlur}
				innerRef={reg.ref}
			/>
			{props.errors.email && <FormFeedback>{props.errors.email.message}</FormFeedback>}
		</FormGroup>
	)
}

export function UserNameField(props) {
	const { t } = useTranslation();
	const disabled = props.content?.editable == undefined ? false : props.content?.editable == false ? true : false;
	const reg = props.register(
		"username",
		{
			validate: {
				emptyInput: value => (value && value.toString().length !== 0) || (props.content?.required == false) || t("FormFields|Username cannot be empty!"),
				startWithNumber: value => !(/^\d/).test(value) ||  t("FormFields|Invalid format, username cannot start with a number"),
				validation: value => (/^[a-z_][a-z0-9_-]{0,31}$|^$/).test(value) || t("FormFields|Invalid format, only lower-case letters, numbers, dash and underscore are allowed"),
			}
		}
	);

	if (disabled && props.content?.value) {
		props.setValue("username", props.content.value);
	}

	return (
		<FormGroup>
			<Label title={props.content?.required ? t("FormFields|Required field") : undefined} for="username">
				{t("FormFields|Username")}{props.content?.required && '*'}
			</Label>
			<Input
				title={disabled ? t("FormFields|Email editing is not allowed") : undefined}
				id="username"
				name="username"
				type="text"
				defaultValue={props.content?.value ? props.content?.value : undefined}
				disabled={disabled}
				invalid={props.errors.username}
				onChange={reg.onChange}
				onBlur={reg.onBlur}
				innerRef={reg.ref}
			/>
			{props.errors.username ?
				<FormFeedback>{props.errors.username.message}</FormFeedback>
				:
				<FormText>{t("FormFields|Only lower-case letters, numbers, dash and underscore are allowed")}</FormText>
			}
		</FormGroup>
	)
}


// TODO: Password complexity check (configurable)
// TODO: Another types of password validation (length, characters, etc.)
export function PasswordField(props) {
	// If password is already set, dont render password input
	if (props.content?.set == true) {
		return null;
	}
	const { t, i18n } = useTranslation();
	const regPwd1 = props.register(
		"password",
		{
			validate: {
				emptyInput: value => (value && value.toString().length !== 0) || (props.content?.required == false) || t("FormFields|Password cannot be empty!"),
			}
		}
	);
	const regPwd2 = props.register(
		"password2",
		{
			validate: {
				passEqual: value => (value === props.getValues("password")) || (props.content?.required == false) || t("FormFields|Passwords do not match!"),
			}
		}
	);
	const [type, setType] = useState("password");
	const [type2, setType2] = useState("password");
	const [label, setLabel] = useState(props.content.passwordLabel);

	// Define default label
	if (label === undefined) {
		setLabel(t("FormFields|Password"));
	}

	// Change type of the input field to reveal password to the user
	const changeType = () => {
		if (type === "password") {
			setType("text");
		} else {
			setType("password");
		}
	};
	const changeType2 = () => {
		if (type2 === "password") {
			setType2("text");
		} else {
			setType2("password");
		}
	};

	return(

		<>
			<FormGroup>
				<Label
					title={props.content?.required ? t("FormFields|Required field") : undefined}
					for="password"
				>
					{label}{props.content?.required && (props.content?.set == false) && '*'}
			</Label>
				<InputGroup>
					<Input
						id="password"
						name="password"
						type={type}
						invalid={props.errors.password}
						autoComplete="new-password"
						onChange={regPwd1.onChange}
						onBlur={regPwd1.onBlur}
						innerRef={regPwd1.ref}
					/>
					<InputGroupAddon addonType="append" style={{ marginLeft: 0 }}>
						<Button color="primary" size="sm" onClick={() => changeType()} onMouseDown={() => changeType()}>
							<span className="cil-low-vision" />
						</Button>
					</InputGroupAddon>
					{props.errors.password && <FormFeedback>{props.errors.password.message}</FormFeedback>}
				</InputGroup>
			</FormGroup>

			<FormGroup>
				<Label for="password2">{t("FormFields|Password again")}</Label>
				<InputGroup>
					<Input
						id="password2"
						name="password2"
						type={type2}
						invalid={props.errors.password2}
						autoComplete="new-password"
						onChange={regPwd2.onChange}
						onBlur={regPwd2.onBlur}
						innerRef={regPwd2.ref}
					/>
					<InputGroupAddon addonType="append" style={{ marginLeft: 0 }}>
						<Button color="primary" size="sm" onClick={() => changeType2()} onMouseDown={() => changeType2()}>
							<span className="cil-low-vision" />
						</Button>
					</InputGroupAddon>
					{props.errors.password2 && <FormFeedback>{props.errors.password2.message}</FormFeedback>}
				</InputGroup>
			</FormGroup>
		</>
	)
}
