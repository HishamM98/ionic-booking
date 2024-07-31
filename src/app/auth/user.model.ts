export class User {
    id: string;
    email: string;
    private _token: string;
    private tokenExpirationDate: Date;

    constructor(id: string, email: string, _token: string, tokenExpirationDate: Date) {
        this.id = id;
        this.email = email;
        this._token = _token;
        this.tokenExpirationDate = tokenExpirationDate;
    }

    get token(): string {
        if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
            return null;
        }
        return this._token;
    }

    get tokenDuration() {
        if (!this.token) {
            return 0;
        }
        return this.tokenExpirationDate.getTime() - new Date().getTime();
    }
}