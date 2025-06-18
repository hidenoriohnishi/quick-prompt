import Store from 'electron-store'
import { IpcMain, BrowserWindow } from 'electron'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Define Zod schemas for validation
const GeneralSettingsSchema = z.object({
  globalShortcut: z.string().default('CommandOrControl+Shift+Space'),
  launchAtLogin: z.boolean().default(false),
  showInDock: z.boolean().default(false),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.enum(['ja', 'en']).default('ja'),
})

const PlaceholderSchema = z.object({
  name: z.string(),
  type: z.enum(['input', 'textarea', 'select']),
  label: z.string(),
  placeholder: z.string().nullable().default(null),
  defaultValue: z.string().nullable().default(null),
  options: z.array(z.string()).nullable().default(null),
  required: z.boolean().default(true),
  validation: z.string().nullable().default(null),
})

const PromptSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  template: z.string(),
  placeholders: z.array(PlaceholderSchema),
  providerId: z.string(),
  modelId: z.string(),
  temperature: z.number().default(0.7),
  maxTokens: z.number().nullable().default(null),
  shortcut: z.string().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const ProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  apiKey: z.string().nullable().default(null),
  enabled: z.boolean().default(false),
  baseUrl: z.string().nullable().default(null),
})

// Combined Schema for Store
const StoreSchema = z.object({
  generalSettings: GeneralSettingsSchema,
  prompts: z.array(PromptSchema),
  providers: z.array(ProviderSchema),
})

// Export types
export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>
export type Prompt = z.infer<typeof PromptSchema>
export type Provider = z.infer<typeof ProviderSchema>
export type StoreType = z.infer<typeof StoreSchema>

// Create JSON schema for electron-store
const jsonSchema = zodToJsonSchema(StoreSchema, 'settingsSchema')

const store = new Store<StoreType>({
  // @ts-ignore
  schema: jsonSchema.properties,
  defaults: {
    generalSettings: GeneralSettingsSchema.parse({}),
    prompts: [],
    providers: [],
  },
})

export function setupStore(ipcMain: IpcMain) {
  ipcMain.handle('getStore', (_, key) => {
    return store.get(key)
  });

  ipcMain.handle('setStore', (_, key, value) => {
    store.set(key, value)
  });

  store.onDidAnyChange((newState) => {
    const window = BrowserWindow.getFocusedWindow()
    window?.webContents.send('store-changed', newState);
  });
}

export default store 