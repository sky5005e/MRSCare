/** @module @category API */
import { fhirBaseUrl, openmrsFetch, type FetchConfig, type FetchResponse } from '@openmrs/esm-api';
import { getSynchronizationItems } from '@openmrs/esm-offline';

export type CurrentPatient = fhir.Patient | FetchResponse<fhir.Patient>;

export interface CurrentPatientOptions {
  includeConfig?: boolean;
}

export interface PatientWithFullResponse extends CurrentPatientOptions {
  includeConfig: true;
}

export interface OnlyThePatient extends CurrentPatientOptions {
  includeConfig: false;
}

export type PatientUuid = string | null;

/**
 * Fetches a patient by their UUID from the FHIR API. This function first attempts
 * to fetch the patient from the server. If the server request fails and offline
 * patients are included, it will check for a matching patient in the offline
 * patient registration sync queue.
 *
 * @param patientUuid The UUID of the patient to fetch, or `null`.
 * @param fetchInit Optional fetch configuration options to pass to the request.
 * @param includeOfflinePatients Whether to include patients from the offline
 *   registration queue if the server request fails. Defaults to `true`.
 * @returns A Promise that resolves with the FHIR Patient object, or `null` if
 *   the patient UUID is null or the patient is not found.
 * @throws Rethrows any error from the server request if no offline patient is found.
 *
 * @example
 * ```ts
 * import { fetchCurrentPatient } from '@openmrs/esm-framework';
 * const patient = await fetchCurrentPatient('patient-uuid');
 * if (patient) {
 *   console.log('Patient name:', patient.name?.[0]?.text);
 * }
 * ```
 */
export async function fetchCurrentPatient(
  patientUuid: PatientUuid,
  fetchInit?: FetchConfig,
  includeOfflinePatients: boolean = true,
): Promise<fhir.Patient | null> {
  if (patientUuid) {
    let err: Error | null = null;
    const [onlinePatient, offlinePatient] = await Promise.all([
      openmrsFetch<fhir.Patient>(`${fhirBaseUrl}/Patient/${patientUuid}`, fetchInit).catch<FetchResponse<fhir.Patient>>(
        (e) => (err = e),
      ),
      includeOfflinePatients ? getOfflineRegisteredPatientAsFhirPatient(patientUuid) : Promise.resolve(null),
    ]);

    if (onlinePatient.ok) {
      console.log('onlinePatient.data', onlinePatient.data);
      const finalData = await GetDecryptData(onlinePatient.data);
      console.log('finalData .data', finalData);
      return finalData; //onlinePatient.data;
    }

    if (offlinePatient) {
      return offlinePatient;
    }

    if (err) {
      throw err;
    }
  }

  return null;
}
/*
async function GetDecryptData(patientdata : fhir.Patient) : Promise<fhir.Patient>  {
    console.log(patientdata);
    const identifier = (patientdata?.identifier ?? []) as Array<{
  type: {
    text: string;
  };
  value: string;
}>;
const identifierText = identifier[1]?.type?.text;
const identifierValue = identifier[1]?.value;
    
    if (patientdata && identifier && identifierValue && identifierText === 'ID Card') {
      try {
        const payload = patientdata;
        const encoded = window.localStorage.getItem('EncqB64-user');
        const user = encoded ? JSON.parse(atob(encoded)) : null;
        // Making the POST request
         await window.fetch(`http://localhost:8765/api/rest/v1/patient/decrypt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + user.accessToken,
          },
          body: JSON.stringify( payload),
        }).then(async(response) => {
          if(response.status !== 500 && response.status !==401)
          {
          const data = await response.json();
            console.log('Response from decrypt API:', data);
             return data;;
          }
          else {
            console.log('error in the calling ' + response);
            return patientdata;
          }
          })
          .catch((error) => {
            console.error('Error posting data:', error);
            return patientdata;
          });
      } catch (error) { 
        return patientdata;
      }
    }
    else
    {
      return patientdata;
    }
};
*/

async function GetDecryptData(patientdata: fhir.Patient): Promise<fhir.Patient> {
  console.log(patientdata);

  const identifier = (patientdata?.identifier ?? []) as Array<{
    type?: {
      text?: string;
    };
    value?: string;
  }>;

  const idCard = identifier.find((i) => i.type?.text === 'ID Card');

  if (!patientdata || !idCard?.value) {
    return patientdata;
  }

  try {
    const encoded = localStorage.getItem('EncqB64-user');
    const user = encoded ? JSON.parse(atob(encoded)) : null;

    const response = await fetch('http://localhost:8765/api/rest/v1/patient/decrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.accessToken ?? ''}`,
      },
      body: JSON.stringify(patientdata),
    });

    if (!response.ok) {
      console.error('Decrypt API failed:', response.status);
      return patientdata;
    }

    const data = await response.json();
    console.log('Response from decrypt API:', data);

    return data as fhir.Patient;
  } catch (error) {
    console.error('Error posting data:', error);
    return patientdata;
  }
}
async function getOfflineRegisteredPatientAsFhirPatient(patientUuid: string): Promise<fhir.Patient | null> {
  const patientRegistrationSyncItems = await getSynchronizationItems<{
    fhirPatient: fhir.Patient;
  }>('patient-registration');
  const patientSyncItem = patientRegistrationSyncItems.find((item) => item.fhirPatient.id === patientUuid);

  return patientSyncItem?.fhirPatient ?? null;
}
