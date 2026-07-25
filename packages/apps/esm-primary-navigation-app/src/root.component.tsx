import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar/navbar.component';
import styles from './root.scss';
import { showSnackbar, SmartReaderWSConnection } from '@openmrs/esm-framework';

const Root: React.FC = () => {

  useEffect(() => {
    console.log('Always load!')
    SmartReaderWSConnection((data) => {
       //console.log("Card event:", data);
      showSnackbar({
          isLowContrast: true,
          kind: 'warning',
          title: 'Card Reader Event',
          subtitle: data.payload?.reader
            ? `Card Reader: ${data.type} - ${data.payload.reader}`
            : 'No reader information available',
        })
      },'ws://localhost:8765/api/ws/v1/smartcard/?token=all')
  });

  return (
    <BrowserRouter basename={window.getOpenmrsSpaBase()}>
      <Routes>
        <Route path="login/*" element={null} />
        <Route path="logout/*" element={null} />
        <Route
          path="*"
          element={
            <div className={styles.primaryNavContainer}>
              <Navbar />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
