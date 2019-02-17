import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Icon, InputLabel, Loading, TextField} from 'ui-kit';
import {I18n, Translate} from 'react-redux-i18n';
import {userService} from '../../services/user/UserService';
import {anEmptyFunction} from '../../utils/fixtures';
import styles from './UserDetails.style';
import PhoneInput from 'react-phone-number-input';
import Button from 'ui-kit/Button';
import {doValidate, emailValidator, phoneNumberValidator, requiredValidator} from '../../utils/validators';
import {bindActionCreators} from 'redux';
import * as notificationsActions from '../../actions/notifications';
import {connect} from 'react-redux';
import SidePanel from '../../layout/SidePanel';
import ChangeEmail from './ChangeEmail';

export class UserDetails extends Component {

    constructor(props) {
        super(props);

        this.state = this.getResetForm();
        this.formValidators = this.constructValidators();

        this.handleChange = this.handleChange.bind(this);
        this.handlePhoneInputChange = this.handlePhoneInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOpenChangeEmailModal = this.handleOpenChangeEmailModal.bind(this);
        this.handleCloseChangeEmailModal = this.handleCloseChangeEmailModal.bind(this);
    }

    constructValidators() {
        return {
            firstName: requiredValidator,
            lastName: requiredValidator,
            email: [requiredValidator, emailValidator],
            phoneNumber: [requiredValidator, phoneNumberValidator],
            language: requiredValidator,
            position: null
        };
    }

    componentDidMount() {
        this.fetchUserDetails(this.props.user.id);
    }

    fetchUserDetails(userId) {
        this.setState(this.getResetForm());

        userService.getUserDetailsById(userId)
            .then(userDetails => {
            this.setState({userDetails: Object.assign({}, userDetails), loading: false}, this.validateAllFields);
    })
    .catch(() => this.setState({loading: false, error: true}));
    }

    getResetForm() {
        return Object.assign({}, {
            userDetails: null,
            loading: true,
            error: false,
            changeEmailModalIsOpen: false,
            userDetailsForm: {
                submitIsDisabled: true,
                submitInProgress: false,
                submitted: false,
                formErrors: {}
            }
        });
    }

    handleChange(event) {
        const target = event.target;
        this.partialUpdate(target.name, target.value);
    }

    handlePhoneInputChange(newPhoneNumber) {
        this.partialUpdate('phoneNumber', newPhoneNumber);
    }

    partialUpdate(name, value) {
        const userDetails = this.state.userDetails;
        userDetails[name] = value;
        const userDetailsForm = this.state.userDetailsForm;
        userDetailsForm.submitIsDisabled = false;
        this.setState({userDetails, userDetailsForm}, () => this.validateField(name, value));
    }

    validateField(name, value) {
        const fieldValidators = this.formValidators[name];
        const userDetailsForm = this.state.userDetailsForm;
        const formErrors = userDetailsForm.formErrors;
        const validation = doValidate(fieldValidators, value);
        if (formErrors[name] === validation) {
            return;
        }
        formErrors[name] = validation;
        userDetailsForm.formErrors = formErrors;
        this.setState({userDetailsForm});
    }

    validateAllFields() {
        Object.keys(this.state.userDetails).forEach(fieldName => {
            this.validateField(fieldName, this.state.userDetails[fieldName]);
    });
    }

    isOnError(fieldName) {
        if (!this.state.userDetailsForm.submitted) {
            return;
        }
        return Boolean(this.state.userDetailsForm.formErrors[fieldName]);
    }

    getErrorHelperText(fieldName) {
        if (!this.state.userDetailsForm.submitted) {
            return;
        }
        const error = this.state.userDetailsForm.formErrors[fieldName];
        if (error) {
            return I18n.t('users.details.form.' + fieldName + '.' + error);
        }
        return '';
    }

    handleSubmit(event) {
        event.preventDefault();
        const userDetailsForm = this.state.userDetailsForm;
        if (userDetailsForm.submitIsDisabled) {
            return;
        }
        userDetailsForm.submitted = true;
        userDetailsForm.submitIsDisabled = true;
        this.setState({userDetailsForm});
        // We check if there are erros on the form
        let formIsWitoutErrors = true;
        Object.keys(this.state.userDetailsForm.formErrors).forEach(fieldName => {
            if (this.state.userDetailsForm.formErrors[fieldName]) {
            formIsWitoutErrors = false;
        }
    });
        if (formIsWitoutErrors) {
            this.updateUserDetails();
        }
    }

    handleOpenChangeEmailModal() {
        this.setState({changeEmailModalIsOpen: true});
    }

    handleCloseChangeEmailModal() {
        this.setState({changeEmailModalIsOpen: false});
    }

    updateUserDetails() {
        const userDetailsForm = this.state.userDetailsForm;
        userDetailsForm.submitIsDisabled = true;
        userDetailsForm.submitInProgress = true;
        this.setState(userDetailsForm);
        userService.updateUserDetails(this.state.userDetails)
            .then(() => {
            this.props.actions.addSuccess(<Translate value="message.changesSaved"/>);
        const userDetailsForm = this.state.userDetailsForm;
        userDetailsForm.submitInProgress = false;
        this.setState(userDetailsForm);
    })
    .catch(() => {
            this.props.actions.addError(<Translate value="error.generic"/>);
        const userDetailsForm = this.state.userDetailsForm;
        userDetailsForm.submitInProgress = false;
        this.setState(userDetailsForm);
    });
    }

    render() {
        return (this.state.error ? (<span><Translate value="error.generic"/></span>) :
        this.state.loading ? (<Loading><Translate value="message.loading"/></Loading>) :
            (
            <Fragment>
            {this.renderUserDetails()}
    </Fragment>
    )
    );
    }

    renderUserDetails() {
        return (
            <div>
            {this.state.changeEmailModalIsOpen &&
            <SidePanel onClose={this.handleCloseChangeEmailModal}>
    <ChangeEmail
        onClose={this.handleCloseChangeEmailModal}
        userId={this.props.user.id}
        actions={this.props.actions}
        />
        </SidePanel>
    }
    <div key="user-details-form" style={styles.root}>
    <form onSubmit={this.handleSubmit} className="form-layout">
            <div className="form-layout-notice">
            <Translate value="organisation.create.requiredNotice"/>
            </div>
            <div className="form-layout-cols">
            <TextField
        label={<span><Translate value="user.email"/> *</span>}
        error={this.isOnError('email')}
        helperText={this.getErrorHelperText('email')}
        FormHelperTextProps={{error: true, style: {position: 'absolute', left: 0, top: '100%'}}}
        id="email"
        name="email"
        margin="normal"
        value={this.state.userDetails.email}
        onChange={anEmptyFunction}
        fullWidth
        inputProps={{autoComplete: 'off'}}
        disabled
        m="m0"
            />
            <div className="not-shrinkable">
            <Button data-id="changeEmailButton" withIcon raised dense color="primary" onClick={this.handleOpenChangeEmailModal}>
    <Translate value="user.changeEmailButton"/>
            <Icon icon="arrow"/>
            </Button>
            </div>
            </div>
            <div className="form-layout-cols">
            <TextField
        label={<span><Translate value="user.firstName"/> *</span>}
        error={this.isOnError('firstName')}
        helperText={this.getErrorHelperText('firstName')}
        FormHelperTextProps={{error: true, style: {position: 'absolute', left: 0, top: '100%'}}}
        id="firstName"
        name="firstName"
        margin="normal"
        value={this.state.userDetails.firstName}
        onChange={this.handleChange}
        inputProps={{autoComplete: 'off'}}
        />
        <TextField
        label={<span><Translate value="user.lastName"/> *</span>}
        error={this.isOnError('lastName')}
        helperText={this.getErrorHelperText('lastName')}
        FormHelperTextProps={{error: true, style: {position: 'absolute', left: 0, top: '100%'}}}
        id="lastName"
        name="lastName"
        margin="normal"
        value={this.state.userDetails.lastName}
        onChange={this.handleChange}
        inputProps={{autoComplete: 'off'}}
        />
        </div>
        <div style={styles.phoneNumber}>
    <InputLabel htmlFor="phoneNumber" shrink variant="filled" error={this.isOnError('phoneNumber')}><span
        style={styles.phoneNumber.label}
    ><Translate value="user.phoneNumber"/> *</span></InputLabel>
        <div style={styles.phoneNumber.input}>
    <PhoneInput
        id="phoneNumber"
        name="phoneNumber"
        margin="normal"
        value={this.state.userDetails.phoneNumber ? this.state.userDetails.phoneNumber : ''}
        placeholder=""
        onChange={this.handlePhoneInputChange}
        error={this.getErrorHelperText('phoneNumber')}
        />
        </div>
        </div>
        <div className="form-layout-cols">
            <TextField
        fullWidth
        label={<Translate value="user.position"/>}
        id="position"
        name="position"
        margin="normal"
        error={this.isOnError('position')}
        helperText={this.getErrorHelperText('position')}
        FormHelperTextProps={{error: true, style: {position: 'absolute', left: 0, top: '100%'}}}
        value={this.state.userDetails.position || ''}
        onChange={this.handleChange}
        inputProps={{autoComplete: 'off'}}
        />
        </div>
        <div className="actionBar">
            <Button
        data-id="validateButton" type="submit" raised withIcon color="secondary"
        disabled={this.state.userDetailsForm.submitIsDisabled}
    >
    <Translate value="user.updateButton"/>
            <Icon icon={this.state.userDetailsForm.submitInProgress ? 'spinner' : 'check'}/>
        </Button>
        </div>
        </form>
        </div>
        </div>
    );
    }
}

UserDetails.propTypes = {
    user: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(Object.assign({}, notificationsActions), dispatch)
    };
}

export default connect(null, mapDispatchToProps)(UserDetails);