import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import productReducer from './slices/productSlice';
import inventoryReducer from './slices/inventorySlice';
import salesChallanReducer from './slices/salesChallanSlice';
import dashboardReducer from './slices/dashboardSlice';
import enterpriseReducer from './slices/enterpriseSlice';
import warehouseReducer from './slices/warehouseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    product: productReducer,
    inventory: inventoryReducer,
    salesChallan: salesChallanReducer,
    dashboard: dashboardReducer,
    enterprise: enterpriseReducer,
    warehouse: warehouseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
