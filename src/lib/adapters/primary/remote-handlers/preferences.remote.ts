import { query, command } from '$app/server';
import { z } from 'zod';
import { preferencesSchema, searchSchema } from '$lib/core/domain/api';
import { backendForWebsite } from '$lib/glue/backend.server';
import { operations } from '$lib/use_cases/backend';
import type { Preferences } from '$lib/ports/backend.repository';

export const getPreferences = query(z.object({}), () => operations.get_preferences.execute(backendForWebsite(), {}) as Promise<Preferences>);
export const updatePreferences = command(preferencesSchema, input => operations.update_preferences.execute(backendForWebsite(), input) as Promise<Preferences>);
export const searchPlaces = query(searchSchema, input => operations.search_places.execute(backendForWebsite(), input));
