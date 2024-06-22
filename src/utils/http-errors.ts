export class HttpError extends Error {
  private _status: number;
  constructor(status: number, message: string) {
    super(message);
    this._status = status;
  }

  get status(): number {
    return this._status;
  }

  get message(): string {
    return this.message;
  }
}

module.exports = HttpError;
