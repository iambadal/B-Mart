import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createOrderAndReserve, deleteOrders, fetchOrders, recentOrders, updateOrderStatus, getCustomerOrder, cancelCustomerOrder } from "../api/OrdersAPI";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, token }) => {
      const response = await createOrderAndReserve(data, token);
      return response;
    },
    onSuccess: (data) => {
      data.success && queryClient.invalidateQueries(["orders"]);
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useRecentOrders = (token) => {
  return useQuery({
    queryKey: ["recent-orders", token],
    queryFn: recentOrders,
  })
};

export const useCustomerOrder = (orderId, token) => useQuery({
  queryKey: ["customerOrder", orderId, token],
  queryFn: () => getCustomerOrder(orderId, token),
  enabled: Boolean(orderId && token),
});

export const useCancelCustomerOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, accessToken }) => cancelCustomerOrder(orderId, accessToken),
    onSuccess: (data, variables) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["customerOrder", variables.orderId] });
        queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      }
    },
  });
};

export const useFetchOrders = (filters, page, limit, sort, token) => {
  return useQuery({
    queryKey: ["orders", { filters, page, limit, sort }, token],
    queryFn: fetchOrders,
    keepPreviousData: true, // keeps old data while fetching new page.
  });
};

export const useUpdateOrders = () => {
  
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessToken, ids, status, notes }) => {
      const response = await updateOrderStatus(accessToken, ids, status, notes);
      return response;
    },
    onSuccess: (data) => {
      data.status === "success" && queryClient.invalidateQueries(["orders"]);
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useDeleteOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessToken, ids  }) => {
      const response = await deleteOrders(accessToken, ids);
      return response;
    },
    onSuccess: (data) => {
      data.status === "success" && queryClient.invalidateQueries(["orders"]);
    },
    onError: (error) => {
      return error.message;
    },
  });
};
