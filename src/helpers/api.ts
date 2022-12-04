import axios from 'axios';
import { AppState, store } from 'stores';
import { REFRESH_TOKEN_FAILURE, REFRESH_TOKEN_REQUEST, REFRESH_TOKEN_SUCCESS } from 'stores/account/types';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});
/**
 intercept any error responses from the api
 and check if the token is no longer valid.
 ie. Token has expired or user is no longer
 authenticated.
 logout the user if the token has expired
**/
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response.status === 401) {
      const originalRequest = err.config;
      const currentState = store.getState() as AppState;
      const refreshToken = currentState.account.refreshToken;
      // Prevent infinite loops
      if (
        err.response.status === 401 &&
        originalRequest.url === `${process.env.API_URL}/api/v1/auth/refresh-token/`
      ) {
        window.location.href = '/login'
        return Promise.reject(err);
      }

      if (
        err.response.data.message === 'Token is expired' &&
        err.response.status === 401 &&
        err.response.statusText === 'Unauthorized'
      ) {
        if (refreshToken) {
          store.dispatch({
            type: REFRESH_TOKEN_REQUEST,
          });
          return api
            .post('/v1/auth/refresh-token', { refreshToken: refreshToken })
            .then((response) => {
              store.dispatch({
                type: REFRESH_TOKEN_SUCCESS,
                payload: {
                  token: response.data.token,
                  refreshToken: response.data.refreshToken,
                },
              });
              api.defaults.headers.common['x-auth-token'] = response.data.token;
              originalRequest.headers['x-auth-token'] = response.data.token;
              return api(originalRequest);
            })
            .catch((err) => {
              store.dispatch({
                type: REFRESH_TOKEN_FAILURE,
                payload: {
                  error: err.toString(),
                },
              });
              console.log("Cuong: ", err);
            });
        } else {
          console.log('Refresh token not available.');
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err);
  }
);

export { api };
