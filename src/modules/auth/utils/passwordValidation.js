import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormText } from 'reactstrap';

export function validatePasswordLength(password, minLength) {
	// Check if the password is long enough
	return (!minLength)
		|| (password.length >= minLength);
}

export function validatePasswordLowercaseCount(password, minLowercaseCount) {
	// Check if the password contains enough lowercase characters
	return (!minLowercaseCount)
		|| ((password.match(/[a-z]/g) || []).length >= minLowercaseCount);
}

export function validatePasswordUppercaseCount(password, minUppercaseCount) {
	// Check if the password contains enough uppercase characters
	return (!minUppercaseCount)
		|| ((password.match(/[A-Z]/g) || []).length >= minUppercaseCount);
}

export function validatePasswordDigitCount(password, minDigitCount) {
	// Check if the password contains enough digits
	return (!minDigitCount)
		|| ((password.match(/[0-9]/g) || []).length >= minDigitCount);
}

export function validatePasswordSpecialCount(password, minSpecialCount) {
	// Check if the password contains enough special characters
	return (!minSpecialCount)
		|| ((password.match(/[^a-zA-Z0-9]/g) || []).length >= minSpecialCount);
}

export function PasswordCriteriaFeedback({ passwordCriteria, validatePassword, watchedPassword, passwordErrors }) {
	const { t } = useTranslation();
	const validatedNewPassword = validatePassword(watchedPassword);
	const invalidColor = (passwordErrors?.type == 'passwordCriteria') ? 'text-danger' : '';

	return (
		<FormText className='text-left'>
			{/*
				Every password requirement has the default (muted) color until fulfilled or form is submitted.
				Once fulfilled, it **immediately** turns green.
				Once the form is submitted, all the unmet requirements turn red.
			*/}
			<div className={Object.values(validatedNewPassword).every(Boolean) ? 'text-success' : invalidColor
			}>
				{t('ChangePwdScreen|The password must meet the following criteria:')}
			</div>
			{Boolean(passwordCriteria.minLength)
				&& <div className={validatedNewPassword.minLength ? 'text-success' : invalidColor
				}>
					<i className={validatedNewPassword.minLength ? 'cil-check-alt px-1' : 'cil-x px-1'} />
					{t('ChangePwdScreen|It must consist of {{minLength}} or more characters', passwordCriteria)}
				</div>
			}
			{Boolean(passwordCriteria.minLowercaseCount)
				&& <div className={validatedNewPassword.minLowercaseCount ? 'text-success' : invalidColor
				}>
					<i className={validatedNewPassword.minLowercaseCount ? 'cil-check-alt px-1' : 'cil-x px-1'} />
					{t('ChangePwdScreen|It must contain at least {{minLowercaseCount}} lowercase characters', passwordCriteria)}
				</div>
			}
			{Boolean(passwordCriteria.minUppercaseCount)
				&& <div className={validatedNewPassword.minUppercaseCount ? 'text-success' : invalidColor
				}>
					<i className={validatedNewPassword.minUppercaseCount ? 'cil-check-alt px-1' : 'cil-x px-1'} />
					{t('ChangePwdScreen|It must contain at least {{minUppercaseCount}} uppercase characters', passwordCriteria)}
				</div>
			}
			{Boolean(passwordCriteria.minDigitCount)
				&& <div className={validatedNewPassword.minDigitCount ? 'text-success' : invalidColor
				}>
					<i className={validatedNewPassword.minDigitCount ? 'cil-check-alt px-1' : 'cil-x px-1'} />
					{t('ChangePwdScreen|It must contain at least {{minDigitCount}} digits', passwordCriteria)}
				</div>
			}
			{Boolean(passwordCriteria.minSpecialCount)
				&& <div className={validatedNewPassword.minSpecialCount ? 'text-success' : invalidColor
				}>
					<i className={validatedNewPassword.minSpecialCount ? 'cil-check-alt px-1' : 'cil-x px-1'} />
					{t('ChangePwdScreen|It must contain at least {{minSpecialCount}} special characters', passwordCriteria)}
				</div>
			}
		</FormText>
	);
}
