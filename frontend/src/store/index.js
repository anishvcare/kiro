import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import searchReducer from './slices/searchSlice';
import shopReducer from './slices/shopSlice';
import requestReducer from './slices/requestSlice';
import quotationReducer from './slices/quotationSlice';
import paymentReducer from './slices/paymentSlice';
import deliveryReducer from './slices/deliverySlice';
import chatReducer from './slices/chatSlice';
import notificationReducer from './slices/notificationSlice';
import locationReducer from './slices/locationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    search: searchReducer,
    shop: shopReducer,
    request: requestReducer,
    quotation: quotationReducer,
    payment: paymentReducer,
    delivery: deliveryReducer,
    chat: chatReducer,
    notification: notificationReducer,
    location: locationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
