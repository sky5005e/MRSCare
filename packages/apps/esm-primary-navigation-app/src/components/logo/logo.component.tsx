import React from 'react';
import { interpolateUrl, useConfig } from '@openmrs/esm-framework';
import { type ConfigSchema } from '../../config-schema';
import styles from './logo.scss';
import bayacareLogo from '../../assets/openmrs_logo.png';

const Logo: React.FC = () => {
  const { logo } = useConfig<ConfigSchema>();

  logo.alt = logo.alt || 'Baya Care logo';
  //logo.src = logo.src || '/assets/images/baya-care-logo.svg';
    logo.src = bayacareLogo;//interpolateUrl('src/assets/icons/openmrs_logo.png');
    //console.log('Logo source:', logo.src);


  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Failed to load logo image:', e);
  };

  return (
    <>
      {logo?.src ? (
        <img alt={logo.alt} className={styles.logo} onError={handleImageError} src={interpolateUrl(logo.src)} />
      ) : logo?.name ? (
        logo.name
      ) : (
        <svg aria-label="OpenMRS Logo" role="img" width={110} height={40}>
          <use href="#omrs-logo-white" />
        </svg>
      )}
    </>
  );
};

export default Logo;
