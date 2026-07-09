import React from 'react';
import { interpolateUrl, useConfig } from '@openmrs/esm-framework';
import { type TFunction } from 'i18next';
import { type ConfigSchema } from './config-schema';
import styles from './login/login.scss';
import bayacareLogo from './assets/openmrs_logo.png';

const Logo: React.FC<{ t: TFunction }> = ({ t }) => {
  const { logo } = useConfig<ConfigSchema>();
  logo.alt = logo.alt || 'Baya Care logo';
  //logo.src = logo.src || '/assets/images/baya-care-logo.svg';
    logo.src = bayacareLogo;//interpolateUrl('src/assets/icons/openmrs_logo.png');
    console.log('Logo source:', logo.src);


  return logo.src ? (
    <img
      alt={logo.alt ? t(logo.alt) : t('bayacareLogo', 'Baya Care logo')}
      className={styles.logoImg}
      src={interpolateUrl(logo.src)}
    />
  ) : (
    <svg role="img" className={styles.logo}>
      <title>{t('bayacareLogo', 'Baya Care logo')}</title>
      <use href="#omrs-logo-full-color"></use>
    </svg>
  );
};

export default Logo;
