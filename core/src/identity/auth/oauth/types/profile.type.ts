export class GoogleProfileType {
    name: {
        givenName: string;
        familyName: string;
    };

    emails: Array<{
        value: string;
    }>;

    photos: Array<{
        value: string;
    }>;
}
