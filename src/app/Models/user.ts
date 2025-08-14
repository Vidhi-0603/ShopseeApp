export class User {
  constructor(
    public Uid: string,
    private _refreshToken: string,   
    private _token: string,
    private _expiresIn: Date
  ) {}

  
  get token() {
    if (!this._expiresIn || new Date() > this._expiresIn) {
      return null;
    }
    return this._token;
  }
  get refreshToken() {
    if (!this._expiresIn) {
      return null;
    }
    return this._refreshToken;
  }
  get expiresIn() {
    if (!this._expiresIn) {
      return null;
    }
    return this._expiresIn;
  }

  static fromJson(json: any): User {
    return new User(
      json.Uid,
      json._refreshToken,
      json._token,
      new Date(json._expiresIn)
    );
  }
}