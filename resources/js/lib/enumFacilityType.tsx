export type FacilityType = 'rent' | 'sell';

const getLabel = (type: FacilityType) => {
    switch (type) {
        case 'rent':
            return 'Sewa';
        case 'sell':
            return 'Jual';
    }
};

export const enumFacilityType = {
    getLabel,
};
