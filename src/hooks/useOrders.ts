import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/services/api';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => OrderService.list(),
  });
}

export function useOrder(trackingNumber: string) {
  return useQuery({
    queryKey: ['order', trackingNumber],
    queryFn: () => OrderService.get(trackingNumber),
    enabled: !!trackingNumber,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: OrderService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
