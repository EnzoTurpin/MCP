export type ApiError = {
  message: string;
  statusCode: number;
};

export type AuthResponse = {
  accessToken: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  display_name: string;
};
