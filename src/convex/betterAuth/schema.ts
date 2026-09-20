import { defineSchema } from 'convex/server';
import { tables as existing } from './legacySchema';
import { tables as connector } from './connectorSchema';

// Preserve every existing table and index when moving to a local component.
export default defineSchema({ ...existing, ...connector });
