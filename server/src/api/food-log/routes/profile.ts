export default {
  type: 'content-api',
  routes: [
    {
      method: 'PUT',
      path: '/profile/me',
      handler: 'api::food-log.food-log.updateProfile',
      config: {
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
  ],
};