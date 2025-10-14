export type UsernameAvailabilityDTO = {
  available: boolean;
};
export type CreateUserDTO = {
  name: string;
  username: string;
  picture: string;
};

export type UserSearchHighlight = {
  field: keyof User;
  snippet: string;
};

export type UserSearchHits = {
  doc: Partial<User>;
  highlights: UserSearchHighlight[];
};

export type UserSearchDTO = {
  data: UserSearchHits[];
  page: number;
};

export type User = {
  uid: string;
  name: string;
  username: string;
  email: string;
  picture: string;
  issuer: string;
  expireAt?: string;
};
