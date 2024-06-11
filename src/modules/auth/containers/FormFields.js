import React, { useState, useEffect } from 'react';
import {
	FormGroup, Input, Label,
	FormFeedback, FormText,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';
import {
	validatePasswordLength,
	validatePasswordLowercaseCount,
	validatePasswordUppercaseCount,
	validatePasswordDigitCount,
	validatePasswordSpecialCount,
	PasswordCriteriaFeedback,
} from '../utils/passwordValidation';

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
			required: props.content?.required ? t("FormFields|Phone can't be empty!") : false
		}
	);
	return (
		<FormGroup>
			<Label title={props.content?.required ? t("FormFields|Required field") : undefined} for="phone">
				{t("FormFields|Phone")}{props.content?.required && '*'}
			</Label>
			<Input
				title={disabled ? t("FormFields|Phone editing is not allowed") : undefined}
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
			required: props.content?.required ? t("FormFields|Email can't be empty!") : false,
			validate: {
				emptyInput: value => (
					props.getValues("email") !== "") || t("FormFields|Email can't be empty!"),
			}
		}
	);

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
				emptyInput: value => (value && value.toString().length !== 0) || (props.content?.required == false) || t("FormFields|Username can't be empty!"),
				startWithNumber: value => !(/^\d/).test(value) ||  t("FormFields|Invalid format, username can't start with a number"),
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
				title={disabled ? t("FormFields|Username editing is not allowed") : undefined}
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


export function PasswordChangeFieldGroup({ app, form: { watch, register, getValues, formState: { errors, isSubmitting } }, oldPasswordInput = true }) {
	const { t } = useTranslation();
	const SeaCatAuthAPI = app.axiosCreate('seacat-auth');

	const [ passwordCriteria, setPasswordCriteria ] = useState({
		minLength: 10,
	});

	useEffect(() => {
		loadPasswordCriteria();
	}, []);

	const loadPasswordCriteria = async () => {
		try {
			const response = await SeaCatAuthAPI.get('/public/password/policy');
			setPasswordCriteria({
				minLength: response.data?.min_length,
				minLowercaseCount: response.data?.min_lowercase_count,
				minUppercaseCount: response.data?.min_uppercase_count,
				minDigitCount: response.data?.min_digit_count,
				minSpecialCount: response.data?.min_special_count,
			});
		} catch (e) {
			if (e?.response?.status == 404) {
				// Most likely older service version which does not have this endpoint
				console.error(e);
			} else {
				app.addAlertFromException(e, t('FormFields|PasswordChange|Failed to load password criteria'));
			}
		}
	};

	// Password is watched for immediate feedback to the user
	const watchedNewPassword = watch('newpassword', '');
	const validateNewPassword = (value) => ({
		minLength: validatePasswordLength(value, passwordCriteria?.minLength),
		minLowercaseCount: validatePasswordLowercaseCount(value, passwordCriteria?.minLowercaseCount),
		minUppercaseCount: validatePasswordUppercaseCount(value, passwordCriteria?.minUppercaseCount),
		minDigitCount: validatePasswordDigitCount(value, passwordCriteria?.minDigitCount),
		minSpecialCount: validatePasswordSpecialCount(value, passwordCriteria?.minSpecialCount),
	});

	const regOldPassword = register("oldpassword");
	const regNewPassword = register("newpassword", {
		validate: {
			passwordCriteria: (value) => (Object.values(validateNewPassword(value)).every(Boolean)
			|| t('FormFields|PasswordChange|Password does not meet security requirements')),
			dontReuseOldPassword: (value) => (value !== getValues('oldpassword'))
			|| t('FormFields|PasswordChange|New password must be different from your old password'),
		}
	});
	const regNewPasswordRepeat = register("newpassword2", {
		validate: {
			passEqual: value => (value === getValues().newpassword) || t("FormFields|PasswordChange|Passwords do not match"),
		}
	});

	return (<>
		{oldPasswordInput && <FormGroup tag="fieldset" disabled={isSubmitting} className="text-center">
			<h5>
				<Label for="oldpassword" style={{display: "block"}}>
					{t('ChangePwdScreen|Current Password')}
				</Label>
			</h5>
			<Input
				autoFocus
				id="oldpassword"
				name="oldpassword"
				type="password"
				autoComplete="off"
				required="required"
				onChange={regOldPassword.onChange}
				onBlur={regOldPassword.onBlur}
				innerRef={regOldPassword.ref}
			/>
		</FormGroup>}
		<FormGroup tag="fieldset" disabled={isSubmitting} className="text-center">
			<h5>
				<Label for="newpassword" style={{display: "block"}}>
					{t('FormFields|PasswordChange|New Password')}
				</Label>
			</h5>
			<Input
				id='newpassword'
				name='newpassword'
				type='password'
				autoComplete='new-password'
				required='required'
				invalid={Boolean(errors?.newpassword)}
				onBlur={regNewPassword.onBlur}
				innerRef={regNewPassword.ref}
				onChange={regNewPassword.onChange}
			/>
			{errors?.newpassword?.type !== 'passwordCriteria'
				&& <FormFeedback>{errors?.newpassword?.message}</FormFeedback>
			}
			<PasswordCriteriaFeedback
				passwordCriteria={passwordCriteria}
				validatePassword={validateNewPassword}
				watchedPassword={watchedNewPassword}
				passwordErrors={errors?.newpassword}
			/>
		</FormGroup>

		<FormGroup tag="fieldset" disabled={isSubmitting} className="text-center">
			<h5>
				<Label for="newpassword2" style={{display: "block"}}>
					{t('FormFields|PasswordChange|Re-enter Password')}
				</Label>
			</h5>
			<Input
				id="newpassword2"
				name="newpassword2"
				type="password"
				autoComplete="new-password"
				required="required"
				invalid={errors.newpassword2}
				onChange={regNewPasswordRepeat.onChange}
				onBlur={regNewPasswordRepeat.onBlur}
				innerRef={regNewPasswordRepeat.ref}
			/>
			{errors.newpassword2
				? <FormFeedback>{errors.newpassword2.message}</FormFeedback>
				: <FormText className='text-left'>
					{t('FormFields|PasswordChange|Enter new password a second time to verify it')}
				</FormText>
			}
		</FormGroup>
	</>)
}
