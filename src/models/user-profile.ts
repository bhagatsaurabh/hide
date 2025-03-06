export interface IUserProfile {
  uid: string;
}

export class UserProfile implements IUserProfile {
  constructor(public uid: string) {}
}
