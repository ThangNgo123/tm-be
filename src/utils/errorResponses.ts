export const errorUserAuthen = {
  tokenNotFound: {
    statusCode: 401,
    message: 'Token not found',
    error: 'Unauthorized',
  },
  invalidToken: {
    statusCode: 401,
    message: 'Invalid or expired token',
    error: 'Unauthorized',
  },
};
