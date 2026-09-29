import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  summary,
  dashboardDataAPIs,
  fetchUsersList,
  updateUserStatus,
  deleteUsers,
  updateUserRole,
  updateBanner,
  createBanner,
  getAllBanners,
  deleteBanners,
} from "../api/AdminAPI";

const { salesAPI, categoryDistributionAPI, stockStatusAPI } =
  dashboardDataAPIs();

export const useDashboardSummary = (token) => {
  return useQuery({
    queryKey: ["summary", token],
    queryFn: summary,
  });
};

export const useDashboardData = (token) => {
  const salesQuery = useQuery({
    queryKey: ["sales", token],
    queryFn: salesAPI,
  });

  const categoryQuery = useQuery({
    queryKey: ["category-distribution", token],
    queryFn: categoryDistributionAPI,
  });

  const stockQuery = useQuery({
    queryKey: ["stock-status", token],
    queryFn: stockStatusAPI,
  });

  return { salesQuery, categoryQuery, stockQuery };
};

export const useFetchUsersList = (filters, page, limit, sort, token) => {
  return useQuery({
    queryKey: ["users", { filters, page, limit, sort }, token],
    queryFn: fetchUsersList,
    keepPreviousData: true, // keeps old data while fetching new page.
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessToken, ids, status }) => {
      const response = await updateUserStatus(accessToken, ids, status);
      return response;
    },
    onSuccess: (data) => {
      data.status === "success" && queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessToken, ids, role }) => {
      const response = await updateUserRole(accessToken, ids, role);
      return response;
    },
    onSuccess: (data) => {
      data.status === "success" && queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessToken, ids }) => {
      const response = await deleteUsers(accessToken, ids);
      return response;
    },
    onSuccess: (data) => {
      data.status === "success" && queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useFetchBannersList = (search, page, limit, sort, token) => {
  return useQuery({
    queryKey: ["banners", { search, page, limit, sort }, token],
    queryFn: getAllBanners,
    keepPreviousData: true, // keeps old data while fetching new page.
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fd, accessToken }) => {
      const response = await createBanner(fd, accessToken);
      return response;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["banners"], exact: false });
      }
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fd, accessToken, id }) => {
      const response = await updateBanner(fd, accessToken, id);
      return response;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["banners"], exact: false });
      }
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useDeleteBanners = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessToken, ids }) => {
      const response = await deleteBanners(accessToken, ids);
      return response;
    },
    onSuccess: (data) => {
      data.status === "success" &&
        queryClient.invalidateQueries({ queryKey: ["banners"], exact: false });
    },
    onError: (error) => {
      return error.message;
    },
  });
};
