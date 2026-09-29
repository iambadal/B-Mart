import { useMutation } from "@tanstack/react-query";
import { createRazorpayOrder, verifyPayment } from "../api/PaymentAPI";

export const useCreateRazorpayOrder = () => {
  return useMutation({
    mutationFn: async ({ orderId, amount, token }) => {
      const response = await createRazorpayOrder(orderId, amount, token);
      return response;
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: async ({ data, token }) => {
      const response = await verifyPayment(data, token);
      return response;
    },
    onError: (error) => {
      return error.message;
    },
  });
};
