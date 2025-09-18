import { components } from '@/generated/openapi';

export type Schemas = components['schemas'];

export type UserDto = Schemas['UserDto_Output'];
export type ProfileDto = Schemas['ProfileDto_Output'];
export type SelfUserDto = Schemas['ValidateUserDto_Output'];
export type HabitDto = Schemas['HabitDto_Output'];
export type HabitLogDto = Schemas['HabitLogDto_Output'];
export type HabitLogWithHabitDto = Schemas['HabitLogWithHabitDto_Output'];

export type LoginUserDto = Schemas['LoginUserDto'];

export type CreateHabitDto = Schemas['CreateHabitLogDto'];
export type CreateHabitLogDto = Schemas['CreateHabitLogDto'];

export type UpdateHabitLogDto = Schemas['UpdateHabitLogDto'];
export type UpdateHabitDto = Schemas['UpdateHabitDto'];
