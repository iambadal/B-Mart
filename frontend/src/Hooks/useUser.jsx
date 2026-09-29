import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addUserProductReviews,
  addUserWishlist,
  deleteUser,
  deleteUserProductReviews,
  deleteUserWishlist,
  fetchAddress,
  fetchBanners,
  fetchUserData,
  updateAddress,
  updateUser,
  userOrders,
  userReviews,
  userWishlists,
} from "../api/UserAPI";

export const useFetchUsersData = (token) => {
  return useQuery({
    queryKey: ["user", token],
    queryFn: fetchUserData,
  });
};

export const useUpdateUserData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fd, accessToken }) => {
      const response = await updateUser(fd, accessToken);
      return { ...response, accessToken };
    },
    onSuccess: (data, { accessToken }) => {
      if (data.status === "success") {
        queryClient.setQueryData(["user", accessToken], data); // instant update for new data cache..
        queryClient.invalidateQueries(["user", accessToken]); // optional: refetch
      }
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token }) => {
      const response = await deleteUser(token);
      return response;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.clear();
      }
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useFetchAddress = (token) => {
  return useQuery({
    queryKey: ["address", token],
    queryFn: fetchAddress,
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fd, accessToken }) => {
      const response = await updateAddress(fd, accessToken);
      return { ...response, accessToken };
    },
    onSuccess: (data, { accessToken }) => {
      if (data.status === "success") {
        queryClient.setQueryData(["address", accessToken], data);
        queryClient.invalidateQueries(["address", accessToken]);
      }
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useFetchUserReviews = (page, limit, token) => {
  return useQuery({
    queryKey: ["userReviews", { page, limit }, token],
    queryFn: userReviews,
    keepPreviousData: true, // keeps old data while fetching new page
  });
};

export const useDeleteUserProductReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessToken, productId }) => {
      const response = await deleteUserProductReviews(accessToken, productId);
      return response;
    },
    onSuccess: (data) => {
      data.status === "success" &&
        queryClient.invalidateQueries({
          queryKey: ["userReviews"],
          exact: false,
        });
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useAddUserProductReviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, accessToken, productId }) => {
      const response = await addUserProductReviews(
        formData,
        accessToken,
        productId
      );
      return response;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({
          queryKey: ["userReviews"],
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: ["product"],
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: ["products"],
          exact: false,
        });
      }
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useFetchUserOrders = (page, limit, token) => {
  return useQuery({
    queryKey: ["userOrders", { page, limit }, token],
    queryFn: userOrders,
    keepPreviousData: true, // keeps old data while fetching new page
  });
};

export const useFetchUserWishlist = (page, limit, token) => {
  return useQuery({
    queryKey: ["userWishlist", { page, limit }, token],
    queryFn: userWishlists,
    keepPreviousData: true, // keeps old data while fetching new page
  });
};

export const useUserWishlistAdd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fd, accessToken }) => {
      const response = await addUserWishlist(fd, accessToken);
      return response;
    },
    onSuccess: (data) => {
      data.status === "success" &&
        queryClient.invalidateQueries({
          queryKey: ["userWishlist"],
          exact: false,
        });
    },
    onError: (error) => {
      return error;
    },
  });
};

export const useUserWishlistDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, accessToken }) => {
      const response = await deleteUserWishlist(accessToken, productId);
      return response;
    },
    onSuccess: (data) => {
      data.status === "success" &&
        queryClient.invalidateQueries({
          queryKey: ["userWishlist"],
          exact: false,
        });
    },
    onError: (error) => {
      return error;
    },
  });
};

export const useFetchBanners = (token) => {
  return useQuery({
    queryKey: ["banners", token],
    queryFn: fetchBanners,
    keepPreviousData: true, // keeps old data while fetching new page
  });
};