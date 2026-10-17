import React from 'react';
import LegalScreen from './LegalScreen';
import {PRIVACY_CONTENT} from './legalContent';

export const PrivacyPolicyScreen: React.FC = () => (
  <LegalScreen content={PRIVACY_CONTENT} />
);

export default PrivacyPolicyScreen;
