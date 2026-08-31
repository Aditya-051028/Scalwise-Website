import * as migration_20260822_074545_initial_schema from './20260822_074545_initial_schema';
import * as migration_20260822_194410_add_form_source from './20260822_194410_add_form_source';
import * as migration_20260825_193747_add_custom_quote_form_source from './20260825_193747_add_custom_quote_form_source';
import * as migration_20260831_195750_add_products_collection from './20260831_195750_add_products_collection';
import * as migration_20260831_221907_add_products_checkout_delivery_featured from './20260831_221907_add_products_checkout_delivery_featured';

export const migrations = [
  {
    up: migration_20260822_074545_initial_schema.up,
    down: migration_20260822_074545_initial_schema.down,
    name: '20260822_074545_initial_schema',
  },
  {
    up: migration_20260822_194410_add_form_source.up,
    down: migration_20260822_194410_add_form_source.down,
    name: '20260822_194410_add_form_source',
  },
  {
    up: migration_20260825_193747_add_custom_quote_form_source.up,
    down: migration_20260825_193747_add_custom_quote_form_source.down,
    name: '20260825_193747_add_custom_quote_form_source',
  },
  {
    up: migration_20260831_195750_add_products_collection.up,
    down: migration_20260831_195750_add_products_collection.down,
    name: '20260831_195750_add_products_collection',
  },
  {
    up: migration_20260831_221907_add_products_checkout_delivery_featured.up,
    down: migration_20260831_221907_add_products_checkout_delivery_featured.down,
    name: '20260831_221907_add_products_checkout_delivery_featured'
  },
];
