import React from 'react';
import LegalScreen from './LegalScreen';
import {TERMS_CONTENT} from './legalContent';

export const TermsConditionsScreen: React.FC = () => (
  <LegalScreen content={TERMS_CONTENT} />
);

export default TermsConditionsScreen;
