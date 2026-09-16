import { Reflector } from '@nestjs/core';
import { registerDecorator } from 'class-validator';

export const AUTH_DECORATOR_KEY = 'AUTH_DECORATOR_KEY';

export const Auth = () =>
  Reflector.createDecorator({ key: AUTH_DECORATOR_KEY });
