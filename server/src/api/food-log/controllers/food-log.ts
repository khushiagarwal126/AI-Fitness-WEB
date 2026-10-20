
/**
 * food-log controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::food-log.food-log',
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) return ctx.unauthorized('Login required');

      const body = ctx.request.body.data;
      body.users_permissions_user = user.id;

      return await strapi.entityService.create(
        'api::food-log.food-log',
        {
          data: body,
          populate: ['users_permissions_user'],
        }
      );
    },

    async find(ctx) {
      const user = ctx.state.user;

      if (!user) return ctx.unauthorized('Login required');

      return await strapi.entityService.findMany(
        'api::food-log.food-log',
        {
          filters: { users_permissions_user: user.id },
          populate: ['users_permissions_user'],
        }
      );
    },

    async findOne(ctx) {
      const user = ctx.state.user;

      if (!user) return ctx.unauthorized('Login required');

      const { id } = ctx.params;

      const result = await strapi.entityService.findMany(
        'api::food-log.food-log',
        {
          filters: { id, users_permissions_user: user.id },
          populate: ['users_permissions_user'],
        }
      );

      if (!result.length) return ctx.notFound('Not found or not yours');

      return result[0];
    },

    async updateProfile(ctx) {
      const user = ctx.state.user;

      if (!user) return ctx.unauthorized('Login required');

      const body = ctx.request.body?.data ?? ctx.request.body ?? {};
      const allowedFields = [
        'age',
        'weight',
        'height',
        'goal',
        'dailyCalorieIntake',
        'dailyCalorieBurn',
      ];

      const data: Record<string, unknown> = {};

      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
          data[field] = body[field];
        }
      }

      if (Object.keys(data).length === 0) {
        return ctx.badRequest('No valid profile fields provided');
      }

      const updatedUser = await strapi.entityService.update(
        'plugin::users-permissions.user',
        user.id,
        { data }
      );

      const {
        password,
        resetPasswordToken,
        confirmationToken,
        ...safeUser
      } = updatedUser as any;

      return { data: safeUser };
    },
  })
);
