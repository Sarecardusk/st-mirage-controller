export type Settings = z.infer<typeof Settings>;
export const Settings = z
  .object({
    button_selected: z.boolean().default(false),
    plugin_enabled: z.boolean().default(false),
    debug_mode: z.boolean().default(false),
  })
  .prefault({});

export const setting_field = 'mirage_main_view';
