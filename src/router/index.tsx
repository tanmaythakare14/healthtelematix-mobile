import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import {
  SignIn,
  Login,
  ForgotPassword,
  ResetPassword,
  EmailVerification,
  SetPassword,
  CreateProfile,
  ReviewUsers,
  ReviewEHR,
  SIGN_IN_PATH,
  LOGIN_PATH,
  EMAIL_VERIFICATION_PATH,
  SET_PASSWORD_PATH,
  CREATE_PROFILE_PATH,
  REVIEW_USERS_PATH,
  REVIEW_EHR_PATH,
  FORGOT_PASSWORD_PATH,
  RESET_PASSWORD_PATH,
} from '@/modules/onboarding';
import {
  PatientList,
  PatientDetail,
  EnrollPatientPage,
  EditPatientPage,
  PATIENT_BASE_PATH,
  PATIENT_DETAIL_PATH,
  PATIENT_ENROLL_PATH,
  PATIENT_EDIT_PATH,
} from '@/modules/patient';
import { UserList, UserDetail, USER_BASE_PATH, USER_DETAIL_PATH } from '@/modules/user-management';
import { Settings, SETTINGS_PATH } from '@/modules/settings';
import { Dashboard, DASHBOARD_PATH } from '@/modules/dashboard';
import { BillingPage, BillingDetailPage, BILLING_BASE_PATH, BILLING_DETAIL_PATH } from '@/modules/billing';
import { CarePlanList, CARE_PLAN_BASE_PATH } from '@/modules/care-plan';
import { ROUTER_BASENAME } from '@/config/environment';
import { IPhoneShowcase } from '@/components/preview/IPhoneShowcase';

export const router = createBrowserRouter(
  [
    { path: '/', element: <IPhoneShowcase /> },
    { path: '/mobile-preview', element: <IPhoneShowcase /> },
    {
      element: <RootLayout />,
      children: [
        { path: SIGN_IN_PATH, element: <SignIn /> },
        { path: LOGIN_PATH, element: <Login /> },
        { path: FORGOT_PASSWORD_PATH, element: <ForgotPassword /> },
        { path: RESET_PASSWORD_PATH, element: <ResetPassword /> },
        { path: EMAIL_VERIFICATION_PATH, element: <EmailVerification /> },
        { path: SET_PASSWORD_PATH, element: <SetPassword /> },
        { path: CREATE_PROFILE_PATH, element: <CreateProfile /> },
        { path: REVIEW_USERS_PATH, element: <ReviewUsers /> },
        { path: REVIEW_EHR_PATH, element: <ReviewEHR /> },
        { path: DASHBOARD_PATH, element: <Dashboard /> },
        { path: PATIENT_BASE_PATH, element: <PatientList /> },
        { path: PATIENT_ENROLL_PATH, element: <EnrollPatientPage /> },
        { path: PATIENT_EDIT_PATH, element: <EditPatientPage /> },
        { path: PATIENT_DETAIL_PATH, element: <PatientDetail /> },
        { path: USER_BASE_PATH, element: <UserList /> },
        { path: USER_DETAIL_PATH, element: <UserDetail /> },
        { path: BILLING_BASE_PATH, element: <BillingPage /> },
        { path: BILLING_DETAIL_PATH, element: <BillingDetailPage /> },
        { path: CARE_PLAN_BASE_PATH, element: <CarePlanList /> },
        { path: SETTINGS_PATH, element: <Settings /> },
      ],
    },
  ],
  { basename: ROUTER_BASENAME }
);
