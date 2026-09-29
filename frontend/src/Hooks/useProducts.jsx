import {
  useMutation,
  useQueryClient,
  useQuery,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  createProduct,
  updateProduct,
  fetchProducts,
  deleteProduct,
  deleteProductMany,
  updateProductStatus,
  fetchProductsById,
} from "../api/ProductsAPI";

export const useFetchProduct = (
  filters,
  page,
  limit,
  sort,
  role,
  isFetch = true
) => {
  return useQuery({
    queryKey: ["products", { filters, page, limit, sort }, role],
    queryFn: fetchProducts,
    keepPreviousData: true, // keeps old data while fetching new page
    enabled: isFetch,
  });
};

export const useFetchInfiniteProducts = (filters, page, limit, sort, role) => {
  return useInfiniteQuery({
    queryKey: ["products", { filters, page, limit, sort }, role],
    queryFn: fetchProducts,
    keepPreviousData: true,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      } else {
        return undefined; // if no more pages...
      }
    },
  });
};

export const useFetchProductById = (productId) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: fetchProductsById,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fd, accessToken }) => {
      const response = await createProduct(fd, accessToken);
      return response;
    },
    onSuccess: (data) => {
      data.success && queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fd, accessToken, productId }) => {
      const response = await updateProduct(fd, accessToken, productId);
      return response;
    },
    onSuccess: (data) => {
      data.success && queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessToken, productId }) => {
      const response = await deleteProduct(accessToken, productId);
      return response;
    },
    onSuccess: (data) => {
      data.success && queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useDeleteProductMany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessToken, ids }) => {
      const response = await deleteProductMany(accessToken, ids);
      return response;
    },
    onSuccess: (data) => {
      data.success && queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      return error.message;
    },
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessToken, ids, status }) => {
      const response = await updateProductStatus(accessToken, ids, status);
      return response;
    },
    onSuccess: (data) => {
      data.success && queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      return error.message;
    },
  });
};
