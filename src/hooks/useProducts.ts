import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ProductService, CategoryService, TypeService } from '@/services/api';
import { PAGE_SIZE } from '@/constants/config';

export function useProducts(params?: Record<string, any>) {
  return useInfiniteQuery({
    queryKey: ['products', params],
    queryFn: ({ pageParam = 1 }) =>
      ProductService.list({ limit: PAGE_SIZE, page: pageParam, ...params }),
    getNextPageParam: (last) =>
      last.current_page < last.last_page ? last.current_page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => ProductService.get(slug),
    enabled: !!slug,
  });
}

export function useCategories(type?: string) {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: () => CategoryService.list(type ? { type } : {}),
  });
}

export function useTypes() {
  return useQuery({
    queryKey: ['types'],
    queryFn: () => TypeService.list(),
  });
}
