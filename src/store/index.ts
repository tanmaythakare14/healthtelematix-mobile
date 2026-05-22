import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { secureLocalStorage } from '../utils/secureStorage';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

const secureStorage = {
  getItem: (key: string): Promise<string | null> => {
    try {
      const value = secureLocalStorage.getItem(key);
      return Promise.resolve(value);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      secureLocalStorage.setItem(key, value);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },
  removeItem: (key: string): Promise<void> => {
    secureLocalStorage.removeItem(key);
    return Promise.resolve();
  },
};

const persistConfig = {
  key: 'root',
  storage: secureStorage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
