import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export interface CurrentUser {
    _id: string;
    username: string;
    email: string;
    lastLogin?: string;
    exp: number;
    isRegistrationComplete?: boolean;
    isEmailVerified?: boolean;
}

export function useUser() {
    const { data, error, mutate, isLoading } = useSWR<CurrentUser>(
        '/api/auth/me',
        fetcher,
        {
            refreshInterval: 60_000,           // 60 s polling keeps it fresh
            revalidateOnFocus: true,
        },
    );

    return {
        user: data,
        isLoading,
        isError: !!error,
        // lets other hooks / components refresh after login / logout
        mutate,
    };
}

export interface Address {
    concessionInformation?: string;
    countryCode?: string;
    countryName: string;
    localityName?: string;
    locationDescription?: string;
    lotInformation?: string;
    partLotInformation?: string;
    postalBoxIdentifier?: string;
    postalCode?: string;
    postalStationInformation?: string;
    propertyIdentificationNumber?: string;
    provinceCode?: string;
    provinceName: string;
    ruralRouteIdentifier?: string;
    siteName?: string;
    streetDirection?: string;
    streetName?: string;
    streetNumber?: string;
    streetType?: string;
    stringRepresentation?: string;
    unitDesignator?: string;
    unitIdentifier?: string;
}


export interface Person {
    primaryAddress: Address;
    fullName: string;
    firstName: string;
    lastName: string;
    middleName?: string;
}

export interface Profile {
    person: Person;
    email: string;
    isEmailVerified?: boolean;
    isRegistrationComplete?: boolean;
    lastLogin?: Number;
}

interface Contact extends Person {
    email?: string;
    phone?: string;
}

const emptyProfile: Profile = {
    email: '',
    person: {
        fullName: '',
        firstName: '',
        lastName: '',
        primaryAddress: {
            countryName: '',
            provinceName: '',
        },
    }
}

export function useUserProfile() {
    const { data, error, mutate, isLoading } = useSWR<Profile>(
        '/api/profile',
        fetcher,
        {
            revalidateOnFocus: true,
        },
    );

    return {
        profile: data || emptyProfile,
        isLoading,
        isError: !!error,
        mutate,
    };
}

export interface Organization {
    primaryAddress: Address;
    currentLegalName: string;
    legalNames?: string[];
    description: string;
    tradeName?: string;
    name?: string;
    businessRegistrationNumber?: string;
    creditAssessment?: string;
    creditAssessmentScore?: string;
    decisionMakingStyle?: string;
    expertiseScore?: string;
    financialCapacityScore?: string;
    financialStrengthScore?: string;
    fundingModel?: string;
    governanceScore?: string;
    governanceStyle?: string;
    innovationCapacityScore?: string;
    internalControlsScore?: string;
    legalStatus?: string;
    membershipStructure?: string;
    missionStatement?: string;
    monitoringCapacityScore?: string;
    operationalApproach?: string;
    operationalScope?: string;
    partnershipStrategy?: string;
    projectDeliveryCapacityScore?: string;
    reportingCapacityScore?: string;
    riskManagementApproach?: string;
    socialPurposeClassificationStatus?: string;
    socialServicesProvisionCapacity?: string;
    stakeholderEngagementLevel?: string;
    organizationStructure?: string;
    sustainabilityAndEnvironmentalComplianceScore?: string;
    taxationStatus?: string;
    organizationValues?: string;
    viabilityScore?: string;
    debtCoverageRatio?: number;
    netWorth?: number;
    yearsExperienceAccessibleDesign?: number;
    yearsExperienceAffordableHousing?: number;
    email?: string;
    phone?: string;
    mission?: string;
    values?: string;
    primaryContact: Contact;
    mailingAddress?: Address;
    organizationType?: string;
    organizationLegalStatus?: string;
}

export function useUserOrg() {
    const { data, error, mutate, isLoading } = useSWR<Organization>(
        '/api/profile/org',
        fetcher,
        {
            revalidateOnFocus: true,
        },
    );

    return {
        org: data,
        isLoading,
        isError: !!error,
        mutate,
    };
}
